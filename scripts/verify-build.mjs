import { access, readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const required = [
  'index.html',
  'about/index.html',
  'portfolio/index.html',
  'blogs/index.html',
  'stories/index.html',
  'experiments/index.html',
  'resources/index.html',
  'changelog/index.html',
  'admin/index.html',
  'admin/login.html',
  'assets/styles.css',
  'img/favicon.ico',
  'blogs.html',
  'stories.html',
  'resources.html',
  'changelog.html',
  'post.html',
  '.nojekyll'
];

for (const file of required) await access(join(dist, file));

async function countGeneratedPosts(section) {
  const sectionDir = join(dist, section);
  const entries = await readdir(sectionDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).length;
}

const blogCount = await countGeneratedPosts('blogs');
const storyCount = await countGeneratedPosts('stories');
if (blogCount < 1) throw new Error('No generated blog detail routes were built.');
if (storyCount < 1) throw new Error('No generated story detail routes were built.');

const forbiddenPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/
];

async function walk(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const path = join(dir, item.name);
    if (item.isDirectory()) {
      await walk(path);
      continue;
    }
    if (/^\.env(?:\.|$)/.test(item.name)) throw new Error(`Environment file leaked into dist: ${relative(dist, path)}`);
    if (!/\.(?:html|js|mjs|css|json|txt|xml)$/i.test(item.name)) continue;
    const info = await stat(path);
    if (info.size > 2_000_000) continue;
    const text = await readFile(path, 'utf8');
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(text)) throw new Error(`Potential secret leaked into ${relative(dist, path)}`);
    }
  }
}

await walk(dist);
console.log(`[verify-build] required output present; ${blogCount} blog routes, ${storyCount} story routes; no forbidden secret patterns found.`);
