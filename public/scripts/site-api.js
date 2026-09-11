export const API_BASE = 'https://nijikade-backend.vercel.app/api';

const cache = new Map();

export async function cachedFetch(path, ttl = 60_000) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < ttl) return cached.data;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const data = await response.json();
  cache.set(url, { time: Date.now(), data });
  return data;
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

export function flattenPosts(payload) {
  const root = payload?.posts ?? payload;
  if (!Array.isArray(root)) return [];
  return root.flatMap((entry) => Array.isArray(entry?.posts) ? entry.posts : [entry]).filter(Boolean);
}

export function dateFromBackend(value) {
  if (!value) return null;
  if (typeof value === 'object' && '_seconds' in value) return new Date(value._seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}
