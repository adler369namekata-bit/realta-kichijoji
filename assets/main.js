'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const mobileViewport = window.matchMedia('(max-width: 1000px)');

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.hidden = mobileViewport.matches && !open;
  menuButton.querySelector('span').textContent = open ? 'CLOSE' : 'MENU';
}
function syncNavigation() {
  menuButton.hidden = !mobileViewport.matches;
  setMenuOpen(false);
}
menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a') && mobileViewport.matches) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuButton.focus();
  }
});
mobileViewport.addEventListener('change', syncNavigation);
syncNavigation();

// One observer, no scroll handlers; reveal each visible content block once.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const targets = document.querySelectorAll([
    '.section-label', '.about-body > p', '.about-body > h2', '.about-facts',
    '.story-heading', '.story-prose > p', '.section-heading > *',
    '.drinks-copy h3', '.drinks-copy p', '.store-photo',
    '.experience-artwork-image', '.info-layout > h2', '.info-list',
    '.access-layout > div > *', '.contact > *'
  ].join(','));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('scroll-pending');
      // Commit the final photo scale independently of the animation lifecycle.
      const photo = entry.target.matches('.experience-artwork-image')
        ? entry.target : entry.target.querySelector('.store-photo-frame img');
      if (photo) photo.classList.add('photo-zoomed');
      entry.target.classList.add('scroll-enter');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

  for (const target of targets) {
    if (target.closest('[inert], [aria-hidden="true"]')) continue;
    const rect = target.getBoundingClientRect();
    // Keep the initial viewport and restored scroll position immediately readable.
    if (!rect.width || !rect.height || rect.top < window.innerHeight) continue;
    const isImage = target.matches('.store-photo, .experience-artwork-image');
    const isHeading = target.matches('h2, h3, .section-label, .eyebrow, .story-heading');
    target.style.setProperty('--reveal-delay', isImage ? '140ms' : isHeading ? '0ms' : '70ms');
    target.classList.add('scroll-pending');
    observer.observe(target);
  }

  // Retire the finished zoom so a later media change cannot restart it at 1.
  document.addEventListener('animationend', (event) => {
    if (event.animationName !== 'quiet-photo-zoom') return;
    const entered = event.target.closest('.scroll-enter');
    if (entered) entered.classList.remove('scroll-enter');
  });

  // Keyboard users must never focus invisible links during the entrance delay.
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest('.scroll-pending');
    if (!target) return;
    target.classList.remove('scroll-pending');
    observer.unobserve(target);
  });
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    observer.disconnect();
    for (const target of targets) target.classList.remove('scroll-pending', 'scroll-enter');
  });
}
