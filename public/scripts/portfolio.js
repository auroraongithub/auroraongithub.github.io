function initPortfolioTabs() {
  document.querySelectorAll('[data-portfolio-showcase]').forEach((showcase) => {
    const tabs = [...showcase.querySelectorAll('[data-portfolio-tab]')];
    const panels = [...showcase.querySelectorAll('[data-portfolio-panel]')];

    const select = (category) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.portfolioTab === category;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.portfolioPanel !== category;
      });
    };

    tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.portfolioTab || 'content')));
  });
}

document.addEventListener('DOMContentLoaded', initPortfolioTabs, { once: true });
