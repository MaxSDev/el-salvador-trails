/* El Salvador Trails — Bienes Raíces / Socios multi-negocio
   - Lee data/real-estate.json (soporta N socios, Art Haus es solo el primero)
   - Renderiza grid de cards con imagen, badge socio, descripción y CTA externo
   - Si json vacío o falla, muestra estado Próximamente sin romper la página */
(function () {
  'use strict';
  var container = null;

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    container = document.getElementById('partners-grid');
    if (!container) return;
    // Fallback embebido para file:// (doble clic sin servidor)
    if (window.__REAL_ESTATE_DATA && window.__REAL_ESTATE_DATA.partners) {
      var fb = window.__REAL_ESTATE_DATA.partners || [];
      if (!fb.length) { renderEmpty(); return; }
      renderPartners(fb);
      try {
        var res = await fetch('data/real-estate.json');
        if (res.ok) {
          var data = await res.json();
          var partners = (data && data.partners) || [];
          if (partners.length) renderPartners(partners);
        }
      } catch (_) { /* file://: mantener fallback */ }
      if (window.__estI18n && typeof window.__estI18n.applyTranslations === 'function') {
        try { window.__estI18n.applyTranslations(); } catch (_) {}
      }
      return;
    }
    try {
      var res2 = await fetch('data/real-estate.json');
      if (!res2.ok) throw new Error('no json');
      var data2 = await res2.json();
      var partners2 = (data2 && data2.partners) || [];
      if (!partners2.length) { renderEmpty(); return; }
      renderPartners(partners2);
    } catch (e) {
      renderEmpty();
    }
    if (window.__estI18n && typeof window.__estI18n.applyTranslations === 'function') {
      try { window.__estI18n.applyTranslations(); } catch (_) {}
    }
  }

  function lang() { return window.__estI18n ? window.__estI18n.getLang() : 'es'; }
  function t(k) { return window.__estI18n ? window.__estI18n.t(k) : k; }
  function pick(obj) {
    var l = lang();
    return (obj && (obj[l] || obj.es)) || '';
  }

  function renderEmpty() {
    container.innerHTML =
      '<div class="coming-soon-icon"><span class="material-symbols-outlined">construction</span></div>' +
      '<h2 class="coming-soon-title" data-i18n="realestate.empty">' + t('realestate.empty') + '</h2>' +
      '<p class="coming-soon-message" data-i18n="realestate.emptyMsg">' + t('realestate.emptyMsg') + '</p>';
  }

  function renderPartners(partners) {
    var html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">';
    partners.forEach(function (p) {
      var name = pick(p.name);
      var tag = pick(p.tagline);
      var desc = pick(p.description);
      var loc = pick(p.location);
      var img = (p.images && p.images[0]) || 'assets/img/slide_2.jpg';
      var imageMarkup = window.ESTMedia
        ? window.ESTMedia.picture(img, {
            alt: name,
            className: 'w-full h-full object-cover transition-transform duration-700 hover:scale-105',
            sizes: '(max-width: 767px) 100vw, 50vw',
            loading: 'lazy'
          })
        : '<img src="' + img + '" alt="' + name + '" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105">';
      html +=
        '<article class="tour-card flex flex-col">' +
          '<div class="aspect-[16/10] w-full overflow-hidden relative">' +
            imageMarkup +
            '<span class="trail-sign dest-tile-sign" style="position:absolute"><span class="material-symbols-outlined">handshake</span><span class="trail-sign-label" data-i18n="realestate.partner">' + t('realestate.partner') + '</span></span>' +
          '</div>' +
          '<div class="p-8 flex flex-col flex-grow">' +
            '<h2 class="font-display text-2xl font-bold mb-2 text-brand">' + name + '</h2>' +
            (tag ? '<p class="text-sm font-semibold mb-3 text-brand">' + tag + '</p>' : '') +
            (loc ? '<p class="text-xs uppercase tracking-widest mb-3 text-muted">' + loc + '</p>' : '') +
            (desc ? '<p class="text-sm leading-relaxed mb-6 flex-grow text-muted">' + desc + '</p>' : '') +
            '<div class="flex flex-col gap-3 mt-auto">' +
              (p.url ? '<a href="' + p.url + '" target="_blank" rel="noopener" class="btn-accent w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm"><span data-i18n="realestate.visit">' + t('realestate.visit') + '</span><span class="material-symbols-outlined text-base">open_in_new</span></a>' : '') +
              '<button type="button" class="btn-accent w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm" style="background:transparent;border:1.4px solid var(--brand);color:var(--brand)" data-partner-contact="' + name + '"><span class="material-symbols-outlined text-base">mail</span><span data-i18n="realestate.contact">' + t('realestate.contact') + '</span></button>' +
            '</div>' +
          '</div>' +
        '</article>';
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('[data-partner-contact]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-partner-contact') || '';
        var msg = '¡Hola! Me interesa el negocio aliado: ' + name + '. ¿Podrían contarme más?';
        window.open('https://wa.me/50370000000?text=' + encodeURIComponent(msg), '_blank');
      });
    });
  }
})();
