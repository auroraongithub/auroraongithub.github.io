import { API_BASE, cachedFetch, dateFromBackend, escapeHtml, flattenPosts } from './site-api.js';

function text(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const JIKAN_CACHE_TTL = 86_400_000;
const favoriteMetadataCache = new Map();
let lastJikanRequestAt = 0;
let favoritesLoadToken = 0;

function favoriteCardMarkup(item, index = 0) {
  const rank = String(index + 1).padStart(2, '0');
  const template = document.getElementById('favoriteCardTemplate');
  if (!template) {
    const imageMarkup = item.image ? `<img class="favorite-item-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">` : '';
    const infoMarkup = `<div class="favorite-info"><strong>${escapeHtml(item.title || 'Untitled')}</strong><div class="favorite-meta"><small data-favorite-year${item.year ? '' : ' hidden'}>${item.year ? escapeHtml(item.year) : ''}</small><small data-favorite-status hidden></small><small data-favorite-format hidden></small></div><div class="favorite-stats"><small class="favorite-score" data-favorite-score${item.score ? '' : ' hidden'}>${item.score ? `★ ${escapeHtml(item.score)}` : ''}</small><small data-favorite-api-rank hidden></small><small data-favorite-popularity hidden></small></div></div>`;
    return `<div class="carousel-item favorite-item"><span class="favorite-rank" data-favorite-list-rank aria-hidden="true">${rank}</span>${imageMarkup}${infoMarkup}</div>`;
  }

  const fragment = template.content.cloneNode(true);
  const card = fragment.firstElementChild;
  const image = card?.querySelector('[data-favorite-image]');
  const title = card?.querySelector('[data-favorite-title]');
  const year = card?.querySelector('[data-favorite-year]');
  const rankEl = card?.querySelector('[data-favorite-list-rank]');
  const status = card?.querySelector('[data-favorite-status]');
  const format = card?.querySelector('[data-favorite-format]');
  const score = card?.querySelector('[data-favorite-score]');
  if (!card || !title) return '';

  if (rankEl) rankEl.textContent = rank;
  title.textContent = item.title || 'Untitled';
  if (image) {
    if (item.image) {
      image.src = item.image;
      image.alt = item.title || 'Favorite';
    } else {
      image.remove();
    }
  }
  if (year) {
    year.textContent = item.year || '';
    year.hidden = !item.year;
  }
  if (status) {
    status.textContent = formatSavedStatus(item.status);
    status.hidden = !item.status;
  }
  if (format) format.hidden = true;
  if (score) {
    if (item.score) {
      score.className = 'favorite-score';
      score.textContent = `★ ${item.score}`;
      score.hidden = false;
    } else {
      score.textContent = '';
      score.hidden = true;
    }
  }
  return card.outerHTML;
}

function formatSavedStatus(status = '') {
  const labels = {
    completed: 'Complete',
    watching: 'Watching',
    playing: 'Playing',
    plan: 'Plan to watch',
    dropped: 'Dropped',
  };
  return labels[status] || status;
}

function favoriteExternalId(item) {
  return item?.mal_id ?? item?.malId ?? item?.myanimelist_id ?? item?.myanimelistId ?? null;
}

function compactCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(number >= 10_000_000 ? 0 : 1)}m`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(number >= 10_000 ? 0 : 1)}k`;
  return String(number);
}

function yearFromCatalog(data) {
  return data?.year
    || data?.aired?.from?.slice?.(0, 4)
    || data?.published?.from?.slice?.(0, 4)
    || '';
}

function compactCatalogStatus(status = '') {
  return status
    .replace('Currently Airing', 'Airing')
    .replace('Finished Airing', 'Finished')
    .replace('Currently Publishing', 'Publishing')
    .replace('Finished Publishing', 'Finished');
}

function catalogMetadata(data, category, item) {
  if (!data) {
    return {
      year: item.year || '',
      status: formatSavedStatus(item.status),
      score: item.score || '',
    };
  }

  const count = category === 'anime'
    ? (data.episodes ? `${data.episodes} eps` : '')
    : category === 'manga'
      ? (data.chapters ? `${data.chapters} ch` : data.volumes ? `${data.volumes} vols` : '')
      : '';
  const format = [data.type, count].filter(Boolean).join(' · ');
  const popularity = category === 'characters'
    ? (data.favorites ? `${compactCount(data.favorites)} fans` : '')
    : (data.members ? `${compactCount(data.members)} members` : '');

  return {
    year: yearFromCatalog(data) || item.year || '',
    status: compactCatalogStatus(data.status || '') || formatSavedStatus(item.status),
    format,
    score: data.score || item.score || '',
    apiRank: data.rank ? `#${data.rank}` : '',
    popularity,
    image: data.images?.jpg?.small_image_url || data.images?.jpg?.image_url || '',
  };
}

async function fetchJikanFavorite(category, id) {
  const endpointType = ['anime', 'manga', 'characters'].includes(category) ? category : '';
  if (!endpointType || !id) return null;
  const cacheKey = `${endpointType}:${id}`;
  if (favoriteMetadataCache.has(cacheKey)) return favoriteMetadataCache.get(cacheKey);

  const storageKey = `elythria.favorite-metadata.${cacheKey}`;
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (stored && Date.now() - stored.time < JIKAN_CACHE_TTL) {
      favoriteMetadataCache.set(cacheKey, stored.data);
      return stored.data;
    }
  } catch (_) {}

  const wait = Math.max(0, 350 - (Date.now() - lastJikanRequestAt));
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  lastJikanRequestAt = Date.now();

  try {
    const payload = await cachedFetch(`${JIKAN_BASE}/${endpointType}/${encodeURIComponent(id)}`, JIKAN_CACHE_TTL);
    const data = payload?.data || null;
    favoriteMetadataCache.set(cacheKey, data);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ time: Date.now(), data }));
    } catch (_) {}
    return data;
  } catch (error) {
    favoriteMetadataCache.set(cacheKey, null);
    return null;
  }
}

function setFavoriteField(row, selector, value) {
  const field = row.querySelector(selector);
  if (!field) return;
  field.textContent = value || '';
  field.hidden = !value;
}

function applyFavoriteMetadata(row, item, data, category) {
  if (!row) return;
  const metadata = catalogMetadata(data, category, item);
  setFavoriteField(row, '[data-favorite-year]', metadata.year);
  setFavoriteField(row, '[data-favorite-status]', metadata.status);
  setFavoriteField(row, '[data-favorite-format]', metadata.format);
  setFavoriteField(row, '[data-favorite-score]', metadata.score ? `★ ${metadata.score}` : '');
  setFavoriteField(row, '[data-favorite-api-rank]', metadata.apiRank);
  setFavoriteField(row, '[data-favorite-popularity]', metadata.popularity);

  const image = row.querySelector('[data-favorite-image]');
  if (image && !item.image && metadata.image) {
    image.src = metadata.image;
    image.alt = item.title || 'Favorite';
  }
}

async function enrichFavoriteRows(track, items, category, loadToken) {
  if (!['anime', 'manga', 'characters'].includes(category)) return;
  const rows = [...track.querySelectorAll('.favorite-item')];
  for (const [index, item] of items.entries()) {
    if (loadToken !== favoritesLoadToken) return;
    const data = await fetchJikanFavorite(category, favoriteExternalId(item));
    if (loadToken !== favoritesLoadToken) return;
    applyFavoriteMetadata(rows[index], item, data, category);
  }
}

async function loadStatus() {
  if (!document.getElementById('statusStrip')) return;
  try {
    const data = await cachedFetch('/site/status', 300_000);
    text('statusFeeling', data.feeling || 'Happy');
    text('statusDoing', data.doing || 'Vibing');
    text('marqueeText', data.currently_marquee || 'Welcome to elythria.dev!');
    const date = dateFromBackend(data.last_updated);
    if (date) text('statusUpdated', date.toLocaleDateString());
  } catch (error) {
    console.warn('Status unavailable', error);
    text('statusFeeling', 'Offline');
    text('statusDoing', 'API unavailable');
  }
}

async function loadNow() {
  const hasNow = document.getElementById('widgetWorkingOn') || document.getElementById('nowWorkingOn');
  if (!hasNow) return;
  try {
    const data = await cachedFetch('/site/now', 120_000);
    for (const id of ['widgetWorkingOn', 'nowWorkingOn', 'drawerWorkingOn']) text(id, data.working_on || 'Nothing listed');
    for (const id of ['widgetLearning', 'nowLearning', 'drawerLearning']) text(id, data.learning || 'Nothing listed');
    for (const id of ['widgetCollabs', 'nowCollabs', 'drawerCollabs']) text(id, data.open_to_collabs ? 'Yes' : 'No');
  } catch (error) {
    console.warn('Now panel unavailable', error);
  }
}

function changelogMarkup(entries) {
  return entries.map((entry) => {
    const date = dateFromBackend(entry.date);
    return `<div class="changelog-widget-entry ${entry.pinned ? 'pinned' : ''}"><div class="date">${date ? date.toLocaleDateString() : ''}</div>${entry.title ? `<strong class="title">${escapeHtml(entry.title)}</strong>` : ''}<div class="body">${escapeHtml(entry.body || '')}</div></div>`;
  }).join('');
}

async function loadChangelog() {
  try {
    const payload = await cachedFetch('/site/changelog?limit=5', 60_000);
    const entries = Array.isArray(payload) ? payload : (payload.entries || []);
    const widget = document.getElementById('widgetChangelog');
    if (widget) {
      const markup = entries.length ? changelogMarkup(entries) : '<p class="text-muted">No updates yet.</p>';
      const link = widget.querySelector('.widget-link');
      if (link) {
        while (widget.firstElementChild && widget.firstElementChild !== link) widget.firstElementChild.remove();
        link.insertAdjacentHTML('beforebegin', markup);
      } else {
        widget.innerHTML = markup;
      }
    }
    const modal = document.getElementById('changelogList');
    if (modal) modal.innerHTML = entries.length ? changelogMarkup(entries) : '<p class="text-muted">No updates yet.</p>';
    const drawer = document.getElementById('drawerChangelog');
    if (drawer) drawer.innerHTML = entries.length ? changelogMarkup(entries) : '<p class="text-muted">No updates yet.</p>';
  } catch (error) {
    console.warn('Changelog unavailable', error);
  }
}

async function loadStats() {
  if (!document.getElementById('statProjects')) return;
  try {
    const data = await cachedFetch('/site/stats', 120_000);
    text('statProjects', data.projects ?? data.projects_count ?? '0');
    text('statPosts', data.posts ?? data.posts_count ?? '0');
    text('statVisitors', data.visitors ?? data.online ?? data.online_now ?? '0');
    text('statPageviews', data.pageviews ?? data.total_visits ?? data.total ?? '0');
  } catch (error) {
    console.warn('Stats unavailable', error);
  }
}

async function loadSpotify() {
  const frame = document.getElementById('widgetSpotify');
  const box = document.getElementById('widgetSpotifyBox');
  if (!frame || !box) return;
  try {
    const data = await cachedFetch('/site/settings', 300_000);
    if (data.spotify_embed_url) {
      frame.src = data.spotify_embed_url;
      box.style.display = '';
    }
  } catch (error) {
    console.warn('Spotify widget unavailable', error);
  }
}

async function loadPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const fallback = grid.innerHTML;
  try {
    const payload = await cachedFetch('/site/projects', 300_000);
    const projects = Array.isArray(payload) ? payload : (payload.projects || []);
    if (!projects.length) return;
    grid.innerHTML = projects.map((project) => `<a href="${escapeHtml(project.github_url || project.url || '#')}" class="portfolio-item" target="_blank" rel="noopener noreferrer"><h4>${escapeHtml(project.name)}</h4><p>${escapeHtml(project.description || 'No description')}</p><div class="portfolio-meta">${project.language ? `<span class="language">${escapeHtml(project.language)}</span>` : ''}<span class="stars">★ ${Number(project.stars) || 0}</span><span class="forks">⑂ ${Number(project.forks) || 0}</span></div></a>`).join('');
  } catch (error) {
    console.warn('Portfolio unavailable', error);
    grid.innerHTML = fallback;
  }
}

let favoriteCategory = 'anime';
async function loadFavorites(category = favoriteCategory) {
  const track = document.getElementById('favoritesTrack');
  if (!track) return;
  const loadToken = ++favoritesLoadToken;
  favoriteCategory = category;
  track.innerHTML = '<div class="favorites-state loading-small">Loading favorites...</div>';
  try {
    const payload = await cachedFetch(`/site/favorites?category=${encodeURIComponent(category)}`, 120_000);
    const items = payload.items || [];
    if (loadToken !== favoritesLoadToken) return;
    track.innerHTML = items.length ? items.map((item, index) => favoriteCardMarkup(item, index)).join('') : '<p class="favorites-state text-muted">No favorites added yet.</p>';
    window.dispatchEvent(new Event('favorites:rendered'));
    void enrichFavoriteRows(track, items, category, loadToken);
  } catch (error) {
    console.warn('Favorites unavailable', error);
    if (loadToken !== favoritesLoadToken) return;
    track.innerHTML = '<p class="favorites-state text-muted">Failed to load favorites.</p>';
  }
}

window.switchFavoritesTab = (category) => {
  document.querySelectorAll('.fav-tab').forEach((button) => button.classList.toggle('active', button.dataset.category === category));
  loadFavorites(category);
};

function recentMarkup(posts, type) {
  return posts.slice(0, 3).map((post) => {
    const id = post.id ?? post._id ?? '';
    const title = post.title || 'Untitled';
    const date = dateFromBackend(post.date);
    return `<a class="recent-item recent-card" href="/post.html?id=${encodeURIComponent(id)}"><strong>${escapeHtml(title)}</strong>${date ? `<small>${date.toLocaleDateString()}</small>` : ''}</a>`;
  }).join('') || `<p class="text-muted">No ${type} posts yet.</p>`;
}

async function loadRecent() {
  for (const [type, id] of [['blog', 'recentBlogs'], ['story', 'recentStories']]) {
    const el = document.getElementById(id);
    if (!el) continue;
    const fallback = el.innerHTML;
    try {
      const payload = await cachedFetch(`/post?type=${type}`, 120_000);
      el.innerHTML = recentMarkup(flattenPosts(payload), type);
    } catch (error) {
      console.warn(`Recent ${type} posts unavailable`, error);
      el.innerHTML = fallback;
    }
  }
}

function initModals() {
  const bind = (modalId, openSelector, closeSelector) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    document.querySelectorAll(openSelector).forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); modal.classList.add('active'); }));
    document.querySelectorAll(closeSelector).forEach((button) => button.addEventListener('click', () => modal.classList.remove('active')));
  };
  bind('nowModal', '[data-now-open]', '[data-now-close]');
  bind('changelogModal', '[data-changelog-open]', '[data-changelog-close]');
}

function initMoreDrawer() {
  const drawer = document.getElementById('moreDrawer');
  if (!drawer) return;
  document.querySelector('[data-more-toggle]')?.addEventListener('click', (event) => {
    event.preventDefault();
    drawer.classList.add('active');
  });
  drawer.querySelectorAll('[data-more-close]').forEach((button) => button.addEventListener('click', () => drawer.classList.remove('active')));
  drawer.querySelectorAll('[data-drawer-scroll]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    drawer.classList.remove('active');
    document.getElementById(link.dataset.drawerScroll)?.scrollIntoView({ behavior: 'smooth' });
  }));
}

async function initWidgets() {
  initModals();
  initMoreDrawer();
  await Promise.allSettled([loadStatus(), loadNow(), loadChangelog(), loadStats(), loadSpotify(), loadPortfolio(), loadFavorites(), loadRecent()]);
}

document.addEventListener('DOMContentLoaded', initWidgets, { once: true });
export { API_BASE };
