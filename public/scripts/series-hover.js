const hover = document.getElementById('seriesHover');
const items = [...document.querySelectorAll('.manga-card[data-series]')];

if (hover && items.length) {
  const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const readDetails = (item) => ({
    title: item.dataset.seriesTitle,
    status: item.dataset.seriesStatus,
    rating: item.dataset.seriesRating,
    bookmarks: item.dataset.seriesBookmarks,
    tags: item.dataset.seriesTags?.split('|').filter(Boolean) || [],
    description: item.dataset.seriesDescription
  });

  const render = (details) => {
    hover.innerHTML = `
      <div class="hover-card-kicker">MANGADEX / SERIES INFO</div>
      <div class="title">${escapeHTML(details.title)}</div>
      <div class="meta">
        <span><b>STATUS</b> ${escapeHTML(details.status)}</span>
        <span><b>RATING</b> ★ ${escapeHTML(details.rating)}</span>
        <span><b>BOOKMARKS</b> ${escapeHTML(details.bookmarks)}</span>
      </div>
      <div class="tags">${details.tags.map((tag) => `<span class="hover-tag">${escapeHTML(tag)}</span>`).join('')}</div>
      <div class="desc">${escapeHTML(details.description)}</div>
      <div class="hover-card-hint">OPEN ON MANGADEX ↗</div>
    `;
  };

  const move = (event) => {
    const padding = 14;
    const offset = 16;
    const { width, height } = hover.getBoundingClientRect();
    let left = event.clientX + offset;
    let top = event.clientY + offset;

    if (left + width > window.innerWidth - padding) left = event.clientX - width - offset;
    if (top + height > window.innerHeight - padding) top = event.clientY - height - offset;

    hover.style.left = `${Math.max(padding, Math.min(left, window.innerWidth - width - padding))}px`;
    hover.style.top = `${Math.max(padding, Math.min(top, window.innerHeight - height - padding))}px`;
  };

  const show = (event, item) => {
    render(readDetails(item));
    hover.style.display = 'block';
    move(event);
  };

  const hide = () => {
    hover.style.display = 'none';
  };

  items.forEach((item) => {
    item.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') show(event, item);
    });
    item.addEventListener('pointermove', (event) => {
      if (hover.style.display === 'block') move(event);
    });
    item.addEventListener('pointerleave', hide);
    item.addEventListener('focus', () => {
      const rect = item.getBoundingClientRect();
      show({ clientX: rect.right, clientY: rect.top }, item);
    });
    item.addEventListener('blur', hide);
  });

  window.addEventListener('scroll', hide, { passive: true });
}
