const THEME_KEY = 'theme';
const COLOR_KEY = 'color';
const validColors = new Set(['default', 'pink', 'purple', 'green', 'orange', 'blue', 'red', 'yellow', 'teal']);

function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
  document.querySelectorAll('[data-toggle-theme] i').forEach((icon) => {
    icon.className = next === 'dark' ? 'bi bi-moon-stars' : 'bi bi-brightness-high';
  });
  document.querySelectorAll('[data-theme-mode-label]').forEach((label) => {
    label.textContent = next === 'dark' ? 'Dark mode' : 'Light mode';
  });
  document.querySelectorAll('[data-theme-toggle-label]').forEach((label) => {
    label.textContent = next === 'dark' ? 'Use light mode' : 'Use dark mode';
  });
  document.querySelectorAll('[data-toggle-theme]').forEach((button) => {
    const label = next === 'dark' ? 'Use light mode' : 'Use dark mode';
    button.title = label;
    button.setAttribute('aria-label', label);
  });
}

function applyColor(color) {
  const migrated = color === 'cyan' ? 'default' : color;
  const next = validColors.has(migrated) ? migrated : 'default';
  document.documentElement.dataset.color = next;
  try { localStorage.setItem(COLOR_KEY, next); } catch (_) {}
  document.querySelectorAll('.color-option').forEach((option) => {
    const active = option.dataset.color === next;
    option.classList.toggle('active', active);
    option.setAttribute('aria-pressed', String(active));
  });
}

function initThemeControls() {
  let storedTheme = 'light';
  let storedColor = 'default';
  try {
    storedTheme = localStorage.getItem(THEME_KEY) || document.documentElement.dataset.theme || 'light';
    storedColor = localStorage.getItem(COLOR_KEY) || document.documentElement.dataset.color || 'default';
  } catch (_) {}
  applyTheme(storedTheme);
  applyColor(storedColor);

  document.querySelectorAll('[data-toggle-theme]').forEach((button) => button.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }));

  const modal = document.querySelector('[data-color-modal]');
  const close = () => modal?.classList.remove('active');
  document.querySelectorAll('[data-color-picker]').forEach((button) => button.addEventListener('click', () => modal?.classList.add('active')));
  document.querySelectorAll('[data-color-close]').forEach((button) => button.addEventListener('click', close));
  modal?.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.querySelectorAll('.color-option').forEach((option) => option.addEventListener('click', () => {
    applyColor(option.dataset.color || 'default');
    close();
  }));
}

document.addEventListener('DOMContentLoaded', initThemeControls, { once: true });
