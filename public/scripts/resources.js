import { cachedFetch, escapeHtml } from './site-api.js';

let category = new URLSearchParams(location.search).get('cat') || 'scanlation';

function renderPanels(panels) {
  const root = document.getElementById('resourcePanels');
  if (!root) return;
  if (!panels.length) {
    root.innerHTML = '<p class="text-muted text-center">No resources available yet.</p>';
    return;
  }
  root.innerHTML = panels.map((panel, index) => `<div class="resource-panel"><h3 class="resource-panel-header" data-resource-toggle="${index}">${escapeHtml(panel.title || 'Resource')}<i class="bi bi-chevron-down resource-panel-icon"></i></h3><div class="resource-panel-body" data-resource-panel="${index}" hidden><div class="resource-content">${panel.content || ''}</div>${Array.isArray(panel.links) && panel.links.length ? `<div class="resource-links">${panel.links.map((link) => `<a href="${escapeHtml(link.url || '#')}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label || link.title || link.url || 'Link')}</a>`).join('')}</div>` : ''}</div></div>`).join('');
  root.querySelectorAll('[data-resource-toggle]').forEach((header) => header.addEventListener('click', () => {
    const body = root.querySelector(`[data-resource-panel="${header.dataset.resourceToggle}"]`);
    if (!body) return;
    body.hidden = !body.hidden;
    header.classList.toggle('open', !body.hidden);
  }));
}

async function load(nextCategory) {
  category = nextCategory;
  const root = document.getElementById('resourcePanels');
  if (root) root.innerHTML = '<div class="loading">Loading...</div>';
  document.querySelectorAll('[data-resource-category]').forEach((button) => button.classList.toggle('active', button.dataset.resourceCategory === category));
  const url = new URL(location.href);
  url.searchParams.set('cat', category);
  history.replaceState({}, '', url);
  try {
    const data = await cachedFetch(`/site/resources?category=${encodeURIComponent(category)}`, 120_000);
    renderPanels(data.panels || []);
  } catch (error) {
    if (root) root.innerHTML = '<p class="text-muted text-center">Resources are temporarily unavailable.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-resource-category]').forEach((button) => button.addEventListener('click', () => load(button.dataset.resourceCategory)));
  load(category);
}, { once: true });
