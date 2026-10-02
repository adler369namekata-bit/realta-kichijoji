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
