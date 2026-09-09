/* ==========================================================================
   El Salvador Trails — Cambio de tema (Claro / Oscuro)

   Comportamiento:
   - Por defecto sigue la preferencia del sistema (prefers-color-scheme).
   - Si el usuario elige manualmente, su decisión se guarda en localStorage
     y tiene prioridad sobre el sistema.
   - El ícono del botón muestra el modo al que se cambiará:
       sol  (light_mode) → el tema activo es oscuro
       luna (dark_mode)  → el tema activo es claro
   - Se aplica en <head> (síncrono) para evitar parpadeo al cargar.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'est-theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setStored(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* almacenamiento no disponible */ }
  }

  function systemPrefersDark() {
    return media ? media.matches : false;
  }

  function resolveTheme() {
    var stored = getStored();
    if (stored === 'dark' || stored === 'light') return stored;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function updateButton(theme) {
    var btn = document.getElementById('theme-toggle');
    var icon = document.getElementById('theme-toggle-icon');
    if (!btn || !icon) return;
    var isDark = theme === 'dark';

    // Si i18n está disponible, usar sus traducciones; si no, usar español por defecto
    var labelKey = isDark ? 'theme.toggle.light' : 'theme.toggle.dark';
    var iconKey   = isDark ? 'theme.icon.light'  : 'theme.icon.dark';

    if (window.__estI18n) {
      icon.textContent = window.__estI18n.t(iconKey);
      btn.setAttribute('aria-label', window.__estI18n.t(labelKey));
      btn.setAttribute('title', window.__estI18n.t(labelKey));
    } else {
      icon.textContent = isDark ? 'light_mode' : 'dark_mode';
      btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      btn.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
  }

  function applyTheme(theme) {
    root.classList.toggle('dark', theme === 'dark');
    updateButton(theme);
  }

  /* Puente i18n ↔ tema: i18n.js llama esta función tras cambiar idioma
     para que el botón de tema muestre las etiquetas traducidas. */
  window.__estUpdateThemeLabels = function () {
    applyTheme(root.classList.contains('dark') ? 'dark' : 'light');
  };

  // Aplicar antes del primer pintado para evitar un flash del tema incorrecto
  applyTheme(resolveTheme());

  // Toggle manual
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.classList.contains('dark') ? 'light' : 'dark';
        setStored(next);
        applyTheme(next);
      });
    }
  });

  // Seguir al sistema solo mientras no haya decisión manual guardada
  if (media) {
    var onSystemChange = function (e) {
      if (!getStored()) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (media.addEventListener) {
      media.addEventListener('change', onSystemChange);
    } else if (media.addListener) {
      media.addListener(onSystemChange); // Safari < 14
    }
  }
})();
