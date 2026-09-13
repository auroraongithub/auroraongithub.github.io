const animatedSelector = '.scroll-animate:not(.sidebar-animate), .masonry-item, .neo-box:not(.sidebar-animate)';
const unanimatedSelector = '.scroll-animate:not(.sidebar-animate):not(.animate-in), .masonry-item:not(.animate-in), .neo-box:not(.sidebar-animate):not(.animate-in)';
const animatedElements = document.querySelectorAll(animatedSelector);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('animate-in');
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  const observeUnanimated = () => document.querySelectorAll(unanimatedSelector).forEach((element) => observer.observe(element));
  observeUnanimated();
  window.addEventListener('posts:rendered', observeUnanimated);
} else {
  animatedElements.forEach((element) => element.classList.add('animate-in'));
  window.addEventListener('posts:rendered', () => {
    document.querySelectorAll(unanimatedSelector).forEach((element) => element.classList.add('animate-in'));
  });
}
