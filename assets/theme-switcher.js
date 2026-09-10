(() => {
  const THEME_KEY = 'theme';
  const COLOR_KEY = 'color';

  function syncColorState(color) {
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.toggle('active', option.dataset.color === color);
    });
  }

  function syncModeState(theme) {
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      const active = button.dataset.themeChoice === theme;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      const label = theme === button.dataset.themeChoice ? '◉' : '○';
      const name = button.dataset.themeChoice === 'dark' ? 'Dark' : 'Light';
      button.textContent = `${label} ${name}`;
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('.theme-toggle i').forEach(icon => {
      icon.className = theme === 'dark' ? 'bi bi-moon-stars' : 'bi bi-brightness-high';
    });
    syncModeState(theme);
  }

  function buildModePicker() {
    const options = document.querySelector('.color-picker-options');
    if (!options || document.querySelector('.theme-switcher-mode')) return;

    const mode = document.createElement('div');
    mode.className = 'theme-switcher-mode';
    mode.innerHTML = `
      <span class="theme-switcher-mode-label">Mode:</span>
      <button type="button" class="theme-mode-option" data-theme-choice="light">○ Light</button>
      <button type="button" class="theme-mode-option" data-theme-choice="dark">○ Dark</button>
    `;
    options.insertAdjacentElement('afterend', mode);
    syncModeState(document.documentElement.getAttribute('data-theme') || 'light');
  }

  document.addEventListener('DOMContentLoaded', buildModePicker);

  document.addEventListener('click', event => {
    const colorOption = event.target.closest('.color-option');
    if (colorOption && colorOption.closest('[data-color-modal]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const color = colorOption.dataset.color;
      document.documentElement.setAttribute('data-color', color);
      localStorage.setItem(COLOR_KEY, color);
      syncColorState(color);
      return;
    }

    const modeOption = event.target.closest('[data-theme-choice]');
    if (modeOption) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setTheme(modeOption.dataset.themeChoice);
    }
  }, true);

  const observer = new MutationObserver(() => {
    syncModeState(document.documentElement.getAttribute('data-theme') || 'light');
    syncColorState(document.documentElement.getAttribute('data-color') || 'cyan');
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-color']
  });
})();
