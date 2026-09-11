import { API_BASE, cachedFetch, dateFromBackend, escapeHtml, flattenPosts } from './site-api.js';

function text(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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
    for (const id of ['widgetWorkingOn', 'nowWorkingOn']) text(id, data.working_on || 'Nothing listed');
    for (const id of ['widgetLearning', 'nowLearning']) text(id, data.learning || 'Nothing listed');
    for (const id of ['widgetCollabs', 'nowCollabs']) text(id, data.open_to_collabs ? 'Yes' : 'No');
  } catch (error) {
    console.warn('Now panel unavailable', error);
  }
}

function changelogMarkup(entries) {
  return entries.map((entry) => {
    const date = dateFromBackend(entry.date);
    return `<div class="changelog-widget-item ${entry.pinned ? 'pinned' : ''}"><div class="changelog-widget-date">${date ? date.toLocaleDateString() : ''}</div>${entry.title ? `<strong>${escapeHtml(entry.title)}</strong>` : ''}<div>${escapeHtml(entry.body || '')}</div></div>`;
  }).join('');
}

async function loadChangelog() {
  try {
    const payload = await cachedFetch('/site/changelog?limit=5', 60_000);
    const entries = Array.isArray(payload) ? payload : (payload.entries || []);
    const widget = document.getElementById('widgetChangelog');
    if (widget) widget.innerHTML = entries.length ? changelogMarkup(entries) : '<p class="text-muted">No updates yet.</p>';
    const modal = document.getElementById('changelogList');
    if (modal) modal.innerHTML = entries.length ? changelogMarkup(entries) : '<p class="text-muted">No updates yet.</p>';
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
  favoriteCategory = category;
  track.innerHTML = '<div class="loading-small" style="text-align:center;padding:40px;">Loading favorites...</div>';
  try {
    const payload = await cachedFetch(`/site/favorites?category=${encodeURIComponent(category)}`, 120_000);
    const items = payload.items || [];
    track.innerHTML = items.length ? items.map((item) => `<div class="carousel-item favorite-item">${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}<div class="favorite-info"><strong>${escapeHtml(item.title)}</strong>${item.year ? `<small>${escapeHtml(item.year)}</small>` : ''}${item.score ? `<small>★ ${escapeHtml(item.score)}</small>` : ''}</div></div>`).join('') : '<p class="text-muted" style="padding:40px;">No favorites added yet.</p>';
    window.dispatchEvent(new Event('favorites:rendered'));
  } catch (error) {
    console.warn('Favorites unavailable', error);
    track.innerHTML = '<p class="text-muted" style="padding:40px;">Failed to load favorites.</p>';
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
    return `<a class="recent-item" href="/post.html?id=${encodeURIComponent(id)}"><strong>${escapeHtml(title)}</strong>${date ? `<small>${date.toLocaleDateString()}</small>` : ''}</a>`;
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

async function initWidgets() {
  initModals();
  await Promise.allSettled([loadStatus(), loadNow(), loadChangelog(), loadStats(), loadSpotify(), loadPortfolio(), loadFavorites(), loadRecent()]);
}

document.addEventListener('DOMContentLoaded', initWidgets, { once: true });
export { API_BASE };
