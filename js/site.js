/* El Salvador Trails — UI compartida: menú móvil + modal tutorial */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    // Menú principal
    var nav = document.querySelector('nav.fixed-nav-light');
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
      function menuLabel(key, fallback) {
        return window.__estI18n ? window.__estI18n.t(key) : fallback;
      }

      function setMenuState(open, restoreFocus) {
        menu.classList.toggle('open', open);
        menu.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.classList.toggle('is-menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('data-i18n-aria', open ? 'nav.closeMenu' : 'nav.menu');
        toggle.setAttribute('aria-label', open
          ? menuLabel('nav.closeMenu', 'Cerrar menú')
          : menuLabel('nav.menu', 'Abrir menú'));
        var icon = toggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = open ? 'close' : 'menu';
        if (open) {
          var firstLink = menu.querySelector('a');
          if (firstLink) {
            window.requestAnimationFrame(function () {
              if (menu.classList.contains('open')) firstLink.focus();
            });
          }
        }
        if (!open && restoreFocus) toggle.focus();
      }

      setMenuState(false, false);
      toggle.addEventListener('click', function () {
        setMenuState(!menu.classList.contains('open'), false);
      });
      toggle.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setMenuState(!menu.classList.contains('open'), false);
        }
      });
      toggle.addEventListener('keyup', function (event) {
        if (
          (event.key === 'Enter' || event.key === ' ') &&
          menu.classList.contains('open')
        ) {
          var firstLink = menu.querySelector('a');
          window.setTimeout(function () {
            if (firstLink && menu.classList.contains('open')) firstLink.focus();
          }, 0);
        }
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          setMenuState(false, false);
        });
      });
      menu.addEventListener('click', function (event) {
        if (event.target === menu) setMenuState(false, true);
      });
      document.addEventListener('click', function (event) {
        if (
          menu.classList.contains('open') &&
          !menu.contains(event.target) &&
          !toggle.contains(event.target) &&
          !(nav && nav.contains(event.target))
        ) {
          setMenuState(false, false);
        }
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu.classList.contains('open')) {
          setMenuState(false, true);
        }
      });
    }

    if (nav) {
      function updateNavState() {
        nav.classList.toggle('is-scrolled', window.scrollY > 72);
      }
      updateNavState();
      window.addEventListener('scroll', updateNavState, { passive: true });
    }

    // Modal tutorial
    var modal = document.querySelector('[data-help-modal]');
    function openHelp() { if (modal) { modal.classList.add('open'); var b = modal.querySelector('[data-help-close]'); if (b) b.focus(); } }
    function closeHelp() { if (modal) modal.classList.remove('open'); }
    document.querySelectorAll('[data-help-open]').forEach(function (b) { b.addEventListener('click', openHelp); });
    var c = document.querySelector('[data-help-close]');
    if (c) c.addEventListener('click', closeHelp);
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeHelp(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeHelp(); });
  });
})();
