import { API_BASE, dateFromBackend, escapeHtml, flattenPosts } from './site-api.js';
import { initKudos } from './post-kudos.js';

function formatDate(value) {
  const date = dateFromBackend(value);
  return date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date unavailable';
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  return String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function postId(post) {
  return String(post?.id ?? post?._id ?? '');
}

function postHref(type, id) {
  const prefix = type === 'story' ? '/stories/post/' : '/blogs/post/';
  return `${prefix}?id=${encodeURIComponent(id)}`;
}

function renderNavigation(navigation, type, posts, currentId) {
  const sorted = [...posts].sort((a, b) => (dateFromBackend(b.date)?.valueOf() || 0) - (dateFromBackend(a.date)?.valueOf() || 0));
  const index = sorted.findIndex((post) => postId(post) === currentId);
  const older = index >= 0 ? sorted[index + 1] : null;
  const newer = index > 0 ? sorted[index - 1] : null;
  const backLabel = type === 'story' ? 'Back to Stories' : 'Back to Blogs';
  const backHref = type === 'story' ? '/stories/' : '/blogs/';
  const link = (post, direction) => post
    ? `<a href="${escapeHtml(postHref(type, postId(post)))}">${direction === 'older' ? '<i class="bi bi-arrow-left"></i> ' : ''}${escapeHtml(post.title || 'Untitled')}${direction === 'newer' ? ' <i class="bi bi-arrow-right"></i>' : ''}</a>`
    : '<span></span>';

  navigation.innerHTML = `${link(older, 'older')}<a href="${backHref}">${backLabel}</a>${link(newer, 'newer')}`;
}

async function initLivePost() {
  const content = document.querySelector('[data-live-post-content]');
  if (!content) return;
  const type = content.dataset.postType === 'story' ? 'story' : 'blog';
  const collectionHref = type === 'story' ? '/stories/' : '/blogs/';
  const currentId = new URL(window.location.href).searchParams.get('id') || '';
  const titleElement = document.querySelector('.live-post .article-header h1');
  const meta = document.querySelector('[data-live-post-meta]');
  const navigation = document.querySelector('[data-live-post-navigation]');
  const kudosPlaceholder = document.querySelector('[data-live-post-kudos]');

  if (!currentId) {
    window.location.replace(collectionHref);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/post/${encodeURIComponent(currentId)}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const payload = await response.json();
    const post = payload?.data ?? payload;
    const title = String(post.title || 'Untitled');
    const tags = normalizeTags(post.tags);

    if (titleElement) titleElement.textContent = title;
    document.title = `${title} · elythria.dev`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', String(post.description || ''));
    if (meta) {
      meta.innerHTML = `<span><b>DATE</b> <i class="bi bi-calendar3"></i> ${escapeHtml(formatDate(post.date))}</span>${tags.length ? `<span><b>TAG</b> ${escapeHtml(tags.join(' · '))}</span>` : ''}`;
    }
    content.innerHTML = post.content ? String(post.content) : '<p class="text-muted">This post has no content yet.</p>';

    if (kudosPlaceholder) {
      kudosPlaceholder.innerHTML = `<div class="post-kudos" data-kudos-root data-post-id="${escapeHtml(currentId)}"><button class="btn btn-ghost" type="button" data-kudos-button><i class="bi bi-heart"></i> Kudos <span data-kudos-count>0</span></button></div>`;
      await initKudos(kudosPlaceholder.querySelector('[data-kudos-root]'));
    }

    if (navigation) {
      try {
        const postsResponse = await fetch(`${API_BASE}/post?type=${encodeURIComponent(type)}`, {
          cache: 'no-store',
          headers: { accept: 'application/json' }
        });
        if (postsResponse.ok) renderNavigation(navigation, type, flattenPosts(await postsResponse.json()), currentId);
        else renderNavigation(navigation, type, [], currentId);
      } catch (_) {
        renderNavigation(navigation, type, [], currentId);
      }
    }
  } catch (error) {
    console.warn(`Live ${type} post unavailable`, error);
    if (titleElement) titleElement.textContent = 'Post unavailable';
    if (meta) meta.innerHTML = '<span>Unable to load this post right now.</span>';
    content.innerHTML = `<p class="text-muted">The post could not be loaded. <a href="${collectionHref}">Back to ${type === 'story' ? 'Stories' : 'Blogs'}</a></p>`;
  }
}

document.addEventListener('DOMContentLoaded', initLivePost, { once: true });
