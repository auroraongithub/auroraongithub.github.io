const state = new WeakMap();

function fallbackPerView() {
  if (window.innerWidth <= 600) return 2;
  if (window.innerWidth <= 900) return 3;
  return 5;
}

function layout(track) {
  const styles = getComputedStyle(track);
  const configuredVisible = Number.parseInt(styles.getPropertyValue('--per-view'), 10);
  const visible = Number.isFinite(configuredVisible) && configuredVisible > 0
    ? configuredVisible
    : fallbackPerView();
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  const item = track.querySelector('.carousel-item');

  return {
    visible,
    gap,
    itemWidth: item?.getBoundingClientRect().width || 0
  };
}

function move(track, direction) {
  const items = [...track.querySelectorAll('.carousel-item')];
  if (!items.length) return;
  const { visible, gap, itemWidth } = layout(track);
  const max = Math.max(0, items.length - visible);
  let index = state.get(track) || 0;
  index = Math.max(0, Math.min(max, index + direction));
  state.set(track, index);
  const width = itemWidth || items[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${index * (width + gap)}px)`;
}

function bind(prevSelector, nextSelector, track) {
  document.querySelector(prevSelector)?.addEventListener('click', () => move(track, -1));
  document.querySelector(nextSelector)?.addEventListener('click', () => move(track, 1));
}

function bindMangaShine() {
  document.querySelectorAll('.manga-section .manga-card').forEach((card) => {
    card.addEventListener('pointerenter', () => {
      if (!card.classList.contains('is-shining')) {
        card.classList.add('is-shining');
      }
    });

    card.addEventListener('animationend', (event) => {
      if (event.animationName === 'manga-card-shine') {
        card.classList.remove('is-shining');
      }
    });
  });
}

function initCarousels() {
  const series = document.getElementById('seriesTrack');
  if (series) bind('[data-carousel-prev]', '[data-carousel-next]', series);
  const favorites = document.getElementById('favoritesTrack');
  if (favorites) bind('[data-fav-carousel-prev]', '[data-fav-carousel-next]', favorites);
  window.addEventListener('resize', () => {
    for (const track of [series, favorites]) {
      if (!track) continue;
      state.set(track, 0);
      track.style.transform = 'translateX(0)';
    }
  });
  window.addEventListener('favorites:rendered', () => {
    if (!favorites) return;
    state.set(favorites, 0);
    favorites.style.transform = 'translateX(0)';
  });

  bindMangaShine();
}

document.addEventListener('DOMContentLoaded', initCarousels, { once: true });
