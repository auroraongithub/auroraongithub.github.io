import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const API_BASE = process.env.ELYTHRIA_API_BASE || 'https://nijikade-backend.vercel.app/api';
const ROOT = new URL('../', import.meta.url).pathname;

function slugify(value) {
  return String(value || 'untitled')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'untitled';
}

function plainText(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(value) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.valueOf()) ? parsed.toISOString() : '1970-01-01T00:00:00.000Z';
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(',').map((tag) => tag.trim()).filter(Boolean);
}

function flattenPosts(payload) {
  const root = payload?.posts ?? payload;
  if (!Array.isArray(root)) return [];
  return root.flatMap((entry) => Array.isArray(entry?.posts) ? entry.posts : [entry]).filter(Boolean);
}

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${path}`);
  return response.json();
}

async function resetGeneratedDir(collection) {
  const dir = join(ROOT, 'src', 'content', collection, '_generated');
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir)) {
    if (name.endsWith('.md')) await rm(join(dir, name));
  }
  return dir;
}

async function syncPosts(type, collection) {
  const generatedDir = await resetGeneratedDir(collection);
  const listing = await request(`/post?type=${encodeURIComponent(type)}`);
  const summaries = flattenPosts(listing);
  let count = 0;

  for (const summary of summaries) {
    const id = summary.id ?? summary._id;
    if (!id) continue;

    const detailPayload = await request(`/post/${encodeURIComponent(id)}`);
    const post = detailPayload?.data ?? detailPayload;
    const title = post.title || summary.title || 'Untitled';
    const content = post.content || '';
    const tags = normalizeTags(post.tags ?? summary.tags);
    const date = normalizeDate(post.date ?? summary.date);
    const description = plainText(content).slice(0, 180);
    const slug = `${slugify(title)}-${slugify(id)}`;
    const frontmatter = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `description: ${JSON.stringify(description)}`,
      `date: ${JSON.stringify(date)}`,
      `tags: ${JSON.stringify(tags)}`,
      `backendId: ${JSON.stringify(String(id))}`,
      'draft: false',
      '---',
      ''
    ].join('\n');

    await writeFile(join(generatedDir, `${slug}.md`), `${frontmatter}${content}\n`, 'utf8');
    count += 1;
  }

  console.log(`[content] synced ${count} ${collection}`);
}

async function syncProjects() {
  const generatedDir = await resetGeneratedDir('projects');
  const payload = await request('/site/projects');
  const projects = Array.isArray(payload) ? payload : (payload?.projects || []);
  let count = 0;

  for (const [index, project] of projects.entries()) {
    if (!project?.name) continue;
    const id = project.id ?? project._id ?? index;
    const slug = `${slugify(project.name)}-${slugify(id)}`;
    const lines = [
      '---',
      `name: ${JSON.stringify(String(project.name))}`,
      `description: ${JSON.stringify(String(project.description || ''))}`,
      project.github_url ? `githubUrl: ${JSON.stringify(String(project.github_url))}` : null,
      project.url ? `url: ${JSON.stringify(String(project.url))}` : null,
      project.image ? `image: ${JSON.stringify(String(project.image))}` : null,
      project.language ? `language: ${JSON.stringify(String(project.language))}` : null,
      `stars: ${Number(project.stars) || 0}`,
      `forks: ${Number(project.forks) || 0}`,
      `order: ${Number(project.order) || index}`,
      '---',
      ''
    ].filter(Boolean);
    await writeFile(join(generatedDir, `${slug}.md`), `${lines.join('\n')}\n`, 'utf8');
    count += 1;
  }

  console.log(`[content] synced ${count} projects`);
}

const jobs = [
  ['blogs', () => syncPosts('blog', 'blogs')],
  ['stories', () => syncPosts('story', 'stories')],
  ['projects', syncProjects]
];

let failed = false;
for (const [label, job] of jobs) {
  try {
    await job();
  } catch (error) {
    failed = true;
    console.warn(`[content] ${label} sync unavailable; keeping existing generated content.`, error.message);
  }
}

if (failed) {
  console.warn('[content] One or more backend syncs were unavailable. The Astro build will continue with collection content already present.');
}
