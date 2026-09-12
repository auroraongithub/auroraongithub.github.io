#!/usr/bin/env python3
"""Create a small, offline-friendly mirror of a public website.

This is intentionally limited to one host. It follows HTML and CSS references,
keeps the original URL path structure, and rewrites same-host references to the
corresponding local files so the result can be opened without a server.
"""

from __future__ import annotations

import argparse
import html
import mimetypes
import os
import re
import sys
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urldefrag, urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen


URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.IGNORECASE)
IMPORT_RE = re.compile(
    r"@import\s+(?:url\(\s*)?(['\"])(.*?)\1", re.IGNORECASE
)


def normalize_url(url: str, base: str) -> str | None:
    """Normalize a web reference and discard fragments and unsupported schemes."""

    if not url or url.startswith(("#", "data:", "mailto:", "javascript:", "tel:")):
        return None
    resolved = urljoin(base, html.unescape(url.strip()))
    parsed = urlparse(urldefrag(resolved).url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return None
    encoded_path = quote(parsed.path or "/", safe="/%:@!$&'()*+,;=-._~")
    encoded_query = quote(parsed.query, safe="/?%:@!$&'()*+,;=-._~")
    return urlunparse((parsed.scheme, parsed.netloc, encoded_path, "", encoded_query, ""))


def is_same_host(url: str, host: str) -> bool:
    return (urlparse(url).hostname or "").lower() == host.lower()


def local_path(url: str, output: Path) -> Path:
    parsed = urlparse(url)
    path = unquote(parsed.path or "/")
    if path.endswith("/"):
        path = f"{path}index.html"
    elif not Path(path).suffix:
        path = f"{path}/index.html"
    relative = path.lstrip("/") or "index.html"
    return output / relative


def relative_reference(from_file: Path, to_file: Path) -> str:
    relative = os.path.relpath(to_file, from_file.parent).replace(os.sep, "/")
    return quote(relative, safe="/%:@!$&'()*+,;=-._~")


class ReferenceParser(HTMLParser):
    """Collect URL-bearing attributes while retaining the original HTML bytes."""

    ATTRS = {"href", "src", "poster", "data-src", "data-href", "action"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name.lower() in self.ATTRS and value:
                self.references.append(value)
            elif name.lower() == "srcset" and value:
                self.references.extend(part.strip().split(" ", 1)[0] for part in value.split(","))
            elif name.lower() == "style" and value:
                self.references.extend(match.group(2) for match in URL_RE.finditer(value))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)


def extract_references(content: str, content_type: str) -> list[str]:
    if "text/html" in content_type or content.lstrip().lower().startswith(("<!doctype", "<html")):
        parser = ReferenceParser()
        try:
            parser.feed(content)
            references = parser.references
        except Exception:
            references = []
        references.extend(match.group(2) for match in URL_RE.finditer(content))
        return references
    if "text/css" in content_type or re.search(r"\.css(?:\?|$)", content_type):
        references = [match.group(2) for match in URL_RE.finditer(content)]
        references.extend(match.group(2) for match in IMPORT_RE.finditer(content))
        return references
    return []


def rewrite_references(content: str, page_url: str, page_file: Path, output: Path, host: str) -> str:
    def replace(value: str) -> str:
        normalized = normalize_url(value, page_url)
        if not normalized or not is_same_host(normalized, host):
            return value
        return relative_reference(page_file, local_path(normalized, output))

    def replace_url(match: re.Match[str]) -> str:
        quote, value = match.group(1), match.group(2)
        return f"url({quote}{replace(value)}{quote})"

    content = URL_RE.sub(replace_url, content)
    if "text/html" in (mimetypes.guess_type(page_file.name)[0] or "") or page_file.suffix.lower() in {".html", ".htm"}:
        def replace_attr(match: re.Match[str]) -> str:
            prefix, quote, value = match.group(1), match.group(2), match.group(3)
            return f"{prefix}{quote}{replace(value)}{quote}"

        content = re.sub(
            r"((?:href|src|poster|data-src|data-href|action)\s*=\s*)(['\"])(.*?)\2",
            replace_attr,
            content,
            flags=re.IGNORECASE,
        )

        def replace_srcset(match: re.Match[str]) -> str:
            prefix, quote, value = match.group(1), match.group(2), match.group(3)
            pieces = []
            for item in value.split(","):
                bits = item.strip().split(None, 1)
                pieces.append(" ".join([replace(bits[0]), *bits[1:]]) if len(bits) == 2 else replace(bits[0]))
            return f"{prefix}{quote}{', '.join(pieces)}{quote}"

        content = re.sub(
            r"(srcset\s*=\s*)(['\"])(.*?)\2",
            replace_srcset,
            content,
            flags=re.IGNORECASE,
        )
    return content


def decode_body(body: bytes, content_type: str) -> str | None:
    if not ("text/" in content_type or "javascript" in content_type or "json" in content_type):
        return None
    charset = "utf-8"
    match = re.search(r"charset=([^;\s]+)", content_type, re.IGNORECASE)
    if match:
        charset = match.group(1).strip('"\'')
    try:
        return body.decode(charset)
    except (LookupError, UnicodeDecodeError):
        return body.decode("utf-8", errors="replace")


def fetch(url: str) -> tuple[bytes, str, str]:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; Elythria reference mirror/1.0)",
            "Accept": "text/html, text/css, application/javascript, image/*, */*;q=0.8",
        },
    )
    with urlopen(request, timeout=8) as response:
        return response.read(), response.headers.get_content_type(), response.geturl()


def crawl(start_url: str, output: Path, max_files: int) -> int:
    parsed_start = urlparse(start_url)
    host = parsed_start.hostname or parsed_start.netloc
    start_url = urlunparse((parsed_start.scheme or "https", parsed_start.netloc, parsed_start.path or "/", "", parsed_start.query, ""))
    output.mkdir(parents=True, exist_ok=True)

    queue: deque[str] = deque([start_url])
    queued = {start_url}
    downloaded: dict[str, Path] = {}
    failures: list[tuple[str, str]] = []

    while queue and len(downloaded) < max_files:
        url = queue.popleft()
        target = local_path(url, output)
        try:
            body, content_type, final_url = fetch(url)
            normalized_final = normalize_url(final_url, start_url) or url
            if normalized_final != url:
                url = normalized_final
                target = local_path(url, output)
            target.parent.mkdir(parents=True, exist_ok=True)

            decoded = decode_body(body, content_type)
            if decoded is not None:
                decoded = rewrite_references(decoded, url, target, output, host)
                target.write_text(decoded, encoding="utf-8", newline="")
                refs = extract_references(decoded, content_type)
            else:
                target.write_bytes(body)
                refs = []

            downloaded[url] = target
            print(f"[{len(downloaded):03d}] {url} -> {target.relative_to(output)}")

            for reference in refs:
                child = normalize_url(reference, url)
                if child and is_same_host(child, host) and child not in queued:
                    queued.add(child)
                    queue.append(child)
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            failures.append((url, str(exc)))
            print(f"[skip] {url}: {exc}", file=sys.stderr)

    manifest = [
        f"# Lydels reference mirror",
        "",
        f"- Source: {start_url}",
        f"- Host scope: {host}",
        f"- Downloaded files: {len(downloaded)}",
        f"- Failed references: {len(failures)}",
        "",
        "The archive is for local design and layout reference. It is not part of the Astro build.",
    ]
    if failures:
        manifest.extend(["", "## Failed references", ""])
        manifest.extend(f"- `{url}` — {reason}" for url, reason in failures)
    (output / "MIRROR.md").write_text("\n".join(manifest) + "\n", encoding="utf-8")
    return len(downloaded)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", nargs="?", default="https://lydels.neocities.org/")
    parser.add_argument("--output", type=Path, default=Path("reference/lydels-site"))
    parser.add_argument("--max-files", type=int, default=1000)
    args = parser.parse_args()
    count = crawl(args.url, args.output, args.max_files)
    print(f"Mirrored {count} files into {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
