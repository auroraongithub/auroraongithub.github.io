function initBubblegumBrand() {
  document.querySelectorAll('.site-banner .brand-text').forEach((brandText) => {
    if (brandText.dataset.bubblegumReady) return;

    const letters = [...(brandText.textContent || '')].map((character) => {
      const letter = document.createElement('span');
      letter.className = 'brand-letter';
      letter.textContent = character;
      if (character === ' ') letter.classList.add('brand-space');
      return letter;
    });

    brandText.replaceChildren(...letters);
    brandText.dataset.bubblegumReady = 'true';

    const brandLink = brandText.closest('.brand');
    let paused = false;
    const bubble = () => {
      if (paused || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const available = letters.filter((letter) => !letter.classList.contains('is-bubbling'));
      const letter = available[Math.floor(Math.random() * available.length)];
      if (!letter) return;
      letter.classList.remove('is-bubbling');
      void letter.offsetWidth;
      letter.classList.add('is-bubbling');
      window.setTimeout(() => letter.classList.remove('is-bubbling'), 780);
    };

    brandLink?.addEventListener('mouseenter', () => { paused = true; });
    brandLink?.addEventListener('mouseleave', () => { paused = false; });
    brandLink?.addEventListener('focusin', () => { paused = true; });
    brandLink?.addEventListener('focusout', () => { paused = false; });
    window.setInterval(bubble, 1100);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBubblegumBrand, { once: true });
} else {
  initBubblegumBrand();
}
