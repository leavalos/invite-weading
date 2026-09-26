export function installScrollReveals() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = [...document.querySelectorAll('.illustration, .collage, .rings, .spotify-player')];

  elements.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.dataset.revealDirection = ['left', 'up', 'right'][index % 3];
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });

  elements.forEach(element => observer.observe(element));
}
