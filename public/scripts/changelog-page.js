import { cachedFetch, dateFromBackend, escapeHtml } from './site-api.js';

async function initChangelogPage() {
  const root = document.getElementById('fullChangelogList');
  if (!root) return;
  try {
    const payload = await cachedFetch('/site/changelog?limit=100', 60_000);
    const entries = Array.isArray(payload) ? payload : (payload.entries || []);
    root.innerHTML = entries.length ? entries.map((entry) => {
      const date = dateFromBackend(entry.date);
      return `<article class="changelog-entry ${entry.pinned ? 'pinned' : ''}"><div class="changelog-date">${date ? date.toLocaleDateString() : ''}</div>${entry.title ? `<h3>${escapeHtml(entry.title)}</h3>` : ''}<p>${escapeHtml(entry.body || '')}</p></article>`;
    }).join('') : '<p class="changelog-state text-muted">No updates yet.</p>';
  } catch (error) {
    root.innerHTML = '<p class="changelog-state text-muted">Changelog is temporarily unavailable.</p>';
  }
}

document.addEventListener('DOMContentLoaded', initChangelogPage, { once: true });
