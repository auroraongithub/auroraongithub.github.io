import { API_BASE, dateFromBackend, escapeHtml, flattenPosts } from './site-api.js';

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  return String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function formatDate(value) {
  const date = dateFromBackend(value);
  return date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

function createPostCard(post, type) {
  const id = String(post.id ?? post._id ?? '');
  const title = String(post.title || 'Untitled');
  const description = String(post.description || post.excerpt || '');
  const tags = normalizeTags(post.tags);
  const prefix = type === 'story' ? '/stories/post/' : '/blogs/post/';
  const icon = type === 'story' ? 'bi-book-half' : 'bi-envelope-paper';
  const card = document.createElement('article');
  card.className = 'masonry-item post-card';
  card.dataset.postCard = '';
  card.dataset.title = title.toLowerCase();
  card.dataset.tags = JSON.stringify(tags.map((tag) => tag.toLowerCase()));
  const date = formatDate(post.date);
  card.innerHTML = `
    <a class="post-card-link" href="${escapeHtml(`${prefix}?id=${encodeURIComponent(id)}`)}" aria-label="Read ${escapeHtml(title)}">
      <div class="item-header">
        <span class="post-card-icon" aria-hidden="true"><i class="bi ${icon}"></i></span>
        <h3>${escapeHtml(title)}</h3>
        <i class="post-card-arrow bi bi-arrow-up-right" aria-hidden="true"></i>
      </div>
      <div class="item-content">
        ${description ? `<p class="post-card-description">${escapeHtml(description)}</p>` : ''}
        <div class="item-meta">
          ${date ? `<span class="post-date"><i class="bi bi-calendar3"></i> ${escapeHtml(date)}</span>` : ''}
          ${tags.length ? `<span class="post-tags">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join('')}</span>` : ''}
        </div>
      </div>
    </a>`;
  return card;
}

function setEmptyState(empty, visible) {
  if (empty) empty.hidden = visible !== 0;
}

function readCardTags(card) {
  try { return JSON.parse(card.dataset.tags || '[]'); } catch (_) {}
  return String(card.dataset.tags || '').split('|').map((tag) => tag.trim()).filter(Boolean);
}

function initFilters(grid) {
  const input = document.querySelector('[data-post-search]');
  const filterBar = document.querySelector('[data-tag-filters]');
  const empty = document.querySelector('[data-post-empty]');
  let activeTag = '';

  const update = () => {
    const query = String(input?.value || '').trim().toLowerCase();
    let visible = 0;
    grid.querySelectorAll('[data-post-card]').forEach((card) => {
      const tags = readCardTags(card);
      const matchesQuery = !query || card.dataset.title.includes(query) || tags.some((tag) => tag.includes(query)) || card.textContent.toLowerCase().includes(query);
      const matchesTag = !activeTag || tags.includes(activeTag);
      const show = matchesQuery && matchesTag;
      card.hidden = !show;
      if (show) visible += 1;
    });
    setEmptyState(empty, visible);
  };

  input?.addEventListener('input', update);
  filterBar?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tag-filter]');
    if (!button) return;
    activeTag = button.dataset.tagFilter || '';
    filterBar.querySelectorAll('[data-tag-filter]').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    update();
  });

  return { update, filterBar };
}

async function initLivePosts() {
  const grid = document.querySelector('[data-post-grid][data-live-posts]');
  if (!grid) return;
  const type = grid.dataset.livePosts || 'blog';
  const loading = grid.querySelector('[data-post-loading]');
  const empty = document.querySelector('[data-post-empty]');
  const filters = initFilters(grid);

  try {
    const response = await fetch(`${API_BASE}/post?type=${encodeURIComponent(type)}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const posts = flattenPosts(await response.json()).filter((post) => post && (post.id ?? post._id));
    loading?.remove();
    grid.querySelectorAll('[data-post-card], .year-header').forEach((element) => element.remove());
    if (!posts.length) {
      setEmptyState(empty, 0);
      return;
    }

    const tags = [...new Set(posts.flatMap((post) => normalizeTags(post.tags)))].sort((a, b) => a.localeCompare(b));
    if (filters.filterBar) {
      filters.filterBar.innerHTML = '<button type="button" class="btn btn-ghost active" data-tag-filter="">All</button>';
      tags.forEach((tag) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-ghost';
        button.dataset.tagFilter = tag.toLowerCase();
        button.textContent = tag;
        filters.filterBar.append(button);
      });
    }
    posts.forEach((post) => grid.append(createPostCard(post, type)));
    filters.update();
    window.dispatchEvent(new Event('posts:rendered'));
  } catch (error) {
    console.warn(`Live ${type} posts unavailable`, error);
    loading?.remove();
    const fallbackCount = grid.querySelectorAll('[data-post-card]').length;
    if (!fallbackCount) grid.innerHTML = '<p class="text-muted">Unable to load posts right now.</p>';
    setEmptyState(empty, fallbackCount ? fallbackCount : 1);
  }
}

document.addEventListener('DOMContentLoaded', initLivePosts, { once: true });
