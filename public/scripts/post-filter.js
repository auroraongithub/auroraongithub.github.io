import { API_BASE, dateFromBackend, escapeHtml, flattenPosts } from './site-api.js';

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  return String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function formatDate(value) {
  const date = dateFromBackend(value);
  return date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

function getPostPreview(post) {
  const source = post.description || post.excerpt || post.content || '';
  if (!source) return '';
  const template = document.createElement('template');
  template.innerHTML = String(source);
  const text = (template.content.textContent || '').replace(/\s+/g, ' ').trim();
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text;
}

function createPostCard(post, type) {
  const id = String(post.id ?? post._id ?? '');
  const title = String(post.title || 'Untitled');
  const description = getPostPreview(post);
  const tags = normalizeTags(post.tags);
  const prefix = type === 'story' ? '/stories/post/' : '/blogs/post/';
  const icon = type === 'story' ? 'bi-book-half' : 'bi-envelope-paper';
  const card = document.createElement('article');
  card.className = 'masonry-item post-card animate-in';
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

function readCardId(card) {
  if (card.dataset.postId) return card.dataset.postId;
  const href = card.querySelector('a')?.getAttribute('href') || '';
  try { return new URL(href, location.href).searchParams.get('id') || ''; } catch (_) { return ''; }
}

function syncTagFilters(filterBar, tags) {
  if (!filterBar) return;
  const nextTags = tags.map((tag) => tag.toLowerCase());
  const currentTags = [...filterBar.querySelectorAll('[data-tag-filter]')]
    .map((button) => button.dataset.tagFilter || '')
    .filter(Boolean);
  if (currentTags.length === nextTags.length && currentTags.every((tag, index) => tag === nextTags[index])) return;

  filterBar.innerHTML = '<button type="button" class="btn btn-ghost active" data-tag-filter="">All</button>';
  tags.forEach((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-ghost';
    button.dataset.tagFilter = tag.toLowerCase();
    button.textContent = tag;
    filterBar.append(button);
  });
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
  const empty = document.querySelector('[data-post-empty]');
  const filters = initFilters(grid);

  try {
    const response = await fetch(`${API_BASE}/post?type=${encodeURIComponent(type)}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const posts = flattenPosts(await response.json()).filter((post) => post && (post.id ?? post._id));
    if (!posts.length) {
      const fallbackCount = grid.querySelectorAll('[data-post-card]').length;
      filters.update();
      setEmptyState(empty, fallbackCount);
      return;
    }

    const tags = [...new Set(posts.flatMap((post) => normalizeTags(post.tags)))].sort((a, b) => a.localeCompare(b));
    syncTagFilters(filters.filterBar, tags);

    const liveIds = posts.map((post) => String(post.id ?? post._id ?? '')).filter(Boolean);
    const existingCards = [...grid.querySelectorAll('[data-post-card]')];
    const existingIds = existingCards.map(readCardId);
    const canReuseExistingCards = liveIds.length === existingIds.length
      && liveIds.every((id, index) => id === existingIds[index]);

    if (!canReuseExistingCards) {
      grid.querySelectorAll('[data-post-card], .year-header').forEach((element) => element.remove());
      posts.forEach((post) => grid.append(createPostCard(post, type)));
      window.dispatchEvent(new Event('posts:rendered'));
    }
    filters.update();
  } catch (error) {
    console.warn(`Live ${type} posts unavailable`, error);
    const fallbackCount = grid.querySelectorAll('[data-post-card]').length;
    if (!fallbackCount) grid.innerHTML = '<p class="text-muted">Unable to load posts right now.</p>';
    setEmptyState(empty, fallbackCount ? fallbackCount : 1);
  }
}

document.addEventListener('DOMContentLoaded', initLivePosts, { once: true });
