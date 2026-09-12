const PORTFOLIO_PAGE_SIZE = 4;

function initPortfolioPagination(panel) {
  const pagination = panel.querySelector('[data-portfolio-pagination]');
  if (!pagination) return;
  if (panel.portfolioPaginationRender) {
    panel.portfolioPaginationRender();
    return;
  }

  const previous = pagination.querySelector('[data-portfolio-prev]');
  const next = pagination.querySelector('[data-portfolio-next]');
  const pageInfo = pagination.querySelector('[data-portfolio-page-info]');
  let page = 0;

  const render = () => {
    const items = [...panel.querySelectorAll('[data-portfolio-item]')];
    const totalPages = Math.max(1, Math.ceil(items.length / PORTFOLIO_PAGE_SIZE));
    page = Math.min(page, totalPages - 1);
    const start = page * PORTFOLIO_PAGE_SIZE;
    items.forEach((item, index) => { item.hidden = index < start || index >= start + PORTFOLIO_PAGE_SIZE; });
    pagination.hidden = totalPages <= 1;
    if (previous) previous.disabled = page === 0;
    if (next) next.disabled = page >= totalPages - 1;
    if (pageInfo) pageInfo.textContent = `${page + 1} / ${totalPages}`;
  };

  panel.portfolioPaginationRender = render;
  previous?.addEventListener('click', () => { if (page > 0) { page -= 1; render(); } });
  next?.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(panel.querySelectorAll('[data-portfolio-item]').length / PORTFOLIO_PAGE_SIZE));
    if (page < totalPages - 1) { page += 1; render(); }
  });
  render();
}

function initPortfolioTabs() {
  document.querySelectorAll('[data-portfolio-showcase]').forEach((showcase) => {
    const tabs = [...showcase.querySelectorAll('[data-portfolio-tab]')];
    const panels = [...showcase.querySelectorAll('[data-portfolio-panel]')];

    panels.forEach(initPortfolioPagination);

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
window.addEventListener('portfolio:rendered', () => {
  document.querySelectorAll('[data-portfolio-panel]').forEach(initPortfolioPagination);
});
