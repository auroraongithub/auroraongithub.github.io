const animatedElements = document.querySelectorAll('.scroll-animate:not(.sidebar-animate), .masonry-item, .neo-box:not(.sidebar-animate)');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('animate-in');
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  animatedElements.forEach((element) => observer.observe(element));
} else {
  animatedElements.forEach((element) => element.classList.add('animate-in'));
}
