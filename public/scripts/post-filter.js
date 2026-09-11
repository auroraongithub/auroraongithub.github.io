function initPostFilter() {
  const input = document.querySelector('[data-post-search]');
  const buttons = [...document.querySelectorAll('[data-tag-filter]')];
  const cards = [...document.querySelectorAll('[data-post-card]')];
  if (!cards.length) return;
  let activeTag = '';

  const update = () => {
    const query = String(input?.value || '').trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matchesQuery = !query || card.dataset.title.includes(query) || card.dataset.tags.includes(query) || card.textContent.toLowerCase().includes(query);
      const matchesTag = !activeTag || card.dataset.tags.split(/\s+/).includes(activeTag);
      const show = matchesQuery && matchesTag;
      card.hidden = !show;
      if (show) visible += 1;
    }
    const empty = document.querySelector('[data-post-empty]');
    if (empty) empty.hidden = visible !== 0;
  };

  input?.addEventListener('input', update);
  buttons.forEach((button) => button.addEventListener('click', () => {
    activeTag = button.dataset.tagFilter || '';
    buttons.forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    update();
  }));
}

document.addEventListener('DOMContentLoaded', initPostFilter, { once: true });
