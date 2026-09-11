import { API_BASE } from './site-api.js';

async function initKudos() {
  const root = document.querySelector('[data-kudos-root]');
  if (!root) return;
  const postId = root.dataset.postId;
  const button = root.querySelector('[data-kudos-button]');
  const count = root.querySelector('[data-kudos-count]');
  const key = 'likedPosts';
  let liked = [];
  try { liked = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}

  try {
    const response = await fetch(`${API_BASE}/post/${encodeURIComponent(postId)}/kudos`);
    const data = await response.json();
    if (count) count.textContent = data.kudos || 0;
  } catch (_) {}

  if (liked.includes(postId)) button?.classList.add('active');
  button?.addEventListener('click', async () => {
    if (liked.includes(postId)) return;
    button.disabled = true;
    try {
      const response = await fetch(`${API_BASE}/post/${encodeURIComponent(postId)}/kudos`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to add kudos');
      if (count) count.textContent = data.kudos || 0;
      liked.push(postId);
      localStorage.setItem(key, JSON.stringify(liked));
      button.classList.add('active');
    } finally {
      button.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', initKudos, { once: true });
