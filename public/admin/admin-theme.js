/*
 * Admin theme controls
 *
 * Mark the control wrapper with data-admin-theme and reuse the homepage
 * markup (data-color-picker, data-color-modal, data-color-close,
 * data-toggle-theme, and .color-option). This file auto-initializes on DOM
 * ready, or the explicit hook can be called after an admin shell is mounted:
 *   window.initAdminThemeControls(document.querySelector('[data-admin-theme]'));
 *
 * The helper intentionally shares the site's `theme` and `color` storage keys
 * and root data attributes. Calling it more than once is safe.
 */
(function (window, document) {
  'use strict';

  const THEME_KEY = 'theme';
  const COLOR_KEY = 'color';
  const VALID_COLORS = new Set(['cyan', 'pink', 'purple', 'green', 'orange', 'blue', 'red', 'yellow', 'teal']);
  const ROOT = document.documentElement;

  function read(key, fallback) {
    try { return window.localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  }

  function persist(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) { /* storage can be blocked */ }
  }

  function setTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    ROOT.dataset.theme = next;
    persist(THEME_KEY, next);
    document.querySelectorAll('[data-toggle-theme]').forEach((button) => {
      const label = next === 'dark' ? 'Use light mode' : 'Use dark mode';
      const icon = button.querySelector('i');
      if (icon) icon.className = next === 'dark' ? 'bi bi-moon-stars' : 'bi bi-brightness-high';
      button.title = label;
      button.setAttribute('aria-label', label);
    });
    document.querySelectorAll('[data-theme-mode-label]').forEach((label) => {
      label.textContent = next === 'dark' ? 'Dark mode' : 'Light mode';
    });
  }

  function setColor(color) {
    const next = VALID_COLORS.has(color) ? color : 'cyan';
    ROOT.dataset.color = next;
    persist(COLOR_KEY, next);
    document.querySelectorAll('.color-option').forEach((option) => {
      const active = option.dataset.color === next;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
  }

  function ensureThemeModeRow(modal) {
    if (!modal || modal.querySelector('[data-toggle-theme]')) return;
    const row = document.createElement('div');
    row.className = 'theme-mode-row';
    row.innerHTML = `
      <div class="theme-mode-copy">
        <span class="theme-mode-kicker"><i class="bi bi-circle-half" aria-hidden="true"></i> Display mode</span>
        <small data-theme-mode-label>Light mode</small>
      </div>
      <button class="theme-toggle" type="button" title="Use dark mode" aria-label="Use dark mode" data-toggle-theme>
        <i class="bi bi-brightness-high" aria-hidden="true"></i>
        <span data-theme-toggle-label>Use dark mode</span>
      </button>`;
    const options = modal.querySelector('.color-picker-options');
    if (options) options.insertAdjacentElement('afterend', row);
    else modal.querySelector('.color-picker-content')?.append(row);
  }

  function initAdminThemeControls(scope) {
    const target = scope && scope.querySelectorAll ? scope : document;
    const modal = target.querySelector('[data-color-modal]') || document.querySelector('[data-color-modal]');
    ensureThemeModeRow(modal);
    const pickers = target.querySelectorAll('[data-color-picker]');
    const toggles = modal ? modal.querySelectorAll('[data-toggle-theme]') : target.querySelectorAll('[data-toggle-theme]');
    const options = target.querySelectorAll('.color-option');
    const closeButtons = target.querySelectorAll('[data-color-close]');
    if (!modal && !pickers.length && !toggles.length && !options.length) return false;

    setTheme(read(THEME_KEY, ROOT.dataset.theme || 'light'));
    setColor(read(COLOR_KEY, ROOT.dataset.color || 'cyan'));
    if (target.__adminThemeCleanup) target.__adminThemeCleanup();

    let lastFocus = null;
    const listeners = [];
    const listen = (element, event, handler) => {
      element.addEventListener(event, handler);
      listeners.push(() => element.removeEventListener(event, handler));
    };
    const close = () => {
      if (!modal) return;
      modal.classList.remove('active');
      document.body.classList.remove('admin-theme-modal-open');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };
    const open = (event) => {
      if (!modal) return;
      lastFocus = event.currentTarget;
      modal.classList.add('active');
      document.body.classList.add('admin-theme-modal-open');
      const first = modal.querySelector('[data-color-close], .color-option, [data-toggle-theme]');
      if (first) window.requestAnimationFrame(() => first.focus());
    };
    const onKeydown = (event) => { if (event.key === 'Escape' && modal?.classList.contains('active')) close(); };
    const onThemeClick = () => setTheme(ROOT.dataset.theme === 'dark' ? 'light' : 'dark');
    const onOptionClick = (event) => { setColor(event.currentTarget.dataset.color); close(); };

    pickers.forEach((button) => listen(button, 'click', open));
    toggles.forEach((button) => listen(button, 'click', onThemeClick));
    closeButtons.forEach((button) => listen(button, 'click', close));
    options.forEach((option) => listen(option, 'click', onOptionClick));
    if (modal) listen(modal, 'click', (event) => { if (event.target === modal) close(); });
    listen(document, 'keydown', onKeydown);
    target.__adminThemeCleanup = () => listeners.splice(0).forEach((remove) => remove());
    return true;
  }

  window.initAdminThemeControls = initAdminThemeControls;
  const boot = () => initAdminThemeControls(document.querySelector('[data-admin-theme]') || document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}(window, document));
