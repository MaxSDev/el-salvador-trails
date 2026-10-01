/* El Salvador Trails — UI compartida: menú móvil + modal tutorial */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    // Menú móvil
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.getElementById('mobile-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        var icon = toggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = open ? 'close' : 'menu';
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          var icon = toggle.querySelector('.material-symbols-outlined');
          if (icon) icon.textContent = 'menu';
        });
      });
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
