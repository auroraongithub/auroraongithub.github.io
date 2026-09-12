export function spotifyToEmbed(rawUrl: string): string {
  const url = rawUrl.trim();
  if (!url) return '';
  if (url.includes('spotify.com/embed')) return url;

  const patterns = [
    /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/,
    /spotify:(track|album|playlist|artist|episode|show):([a-zA-Z0-9]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  return url;
}
