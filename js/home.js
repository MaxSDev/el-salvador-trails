/* El Salvador Trails — Home expandido: destacados, cotizador, stats, resumen reseñas
   Reusa data/tours-data.js + data/reviews-data.js (funciona en file://) */
(function () {
  'use strict';

  function lang() { return window.__estI18n ? window.__estI18n.getLang() : 'es'; }
  function t(k) { return window.__estI18n ? window.__estI18n.t(k) : k; }
  function pick(o) { var l = lang(); return (o && (o[l] || o.es)) || ''; }

  function tours() {
    if (window.__TOURS_DATA && window.__TOURS_DATA.tours) return window.__TOURS_DATA.tours;
    return [];
  }

  function stars(r) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < Math.round(r || 5) ? '★' : '☆';
    return s;
  }

  function cardHTML(tour) {
    var title = pick(tour.title);
    var img = (tour.images && tour.images[0]) || 'assets/img/slide_0.jpg';
    var imageMarkup = window.ESTMedia
      ? window.ESTMedia.picture(img, {
          alt: title,
          className: 'w-full h-full object-cover',
          sizes: '(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 25vw',
          loading: 'lazy'
        })
      : '<img src="' + img + '" alt="' + title + '" loading="lazy" class="w-full h-full object-cover">';
    var dur = pick(tour.duration);
    var grp = pick(tour.groupSize);
    var badge = tour.badge ? pick(tour.badge) : '';
    var rc = tour.ratingCount || 0;
    var ratingLine = rc > 0
      ? '<span class="meta-stars" aria-hidden="true">' + stars(tour.rating) + '</span> <strong>' + (tour.rating || 5).toFixed(1) + '</strong> (' + rc + ')'
      : '<span class="meta-new">' + t('tour.meta.new') + '</span>';
    return (
      '<article class="tour-card flex flex-col">' +
        '<div class="aspect-[16/10] w-full overflow-hidden relative">' +
          imageMarkup +
          (badge ? '<span class="trail-sign dest-tile-sign" style="position:absolute"><span class="material-symbols-outlined" aria-hidden="true">star</span><span class="trail-sign-label">' + badge + '</span></span>' : '') +
        '</div>' +
        '<div class="p-6 flex flex-col flex-grow">' +
          '<h3 class="font-display text-xl font-bold mb-2 text-brand">' + title + '</h3>' +
          '<p class="home-meta">' + dur + ' · ' + grp + '</p>' +
          '<p class="home-meta home-rating">' + ratingLine + ' · ' + pick(tour.pickup) + '</p>' +
          '<p class="home-from">' + t('tour.meta.from') + '</p>' +
          '<a href="tours.html" class="btn-accent w-full py-3 mt-4 rounded-lg flex items-center justify-center gap-2 text-sm"><span>' + t('tour.viewTour') + '</span><span class="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span></a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderFeatured() {
    var day = document.getElementById('home-featured-day');
    var pkg = document.getElementById('home-featured-pkg');
    if (!day && !pkg) return;
    var all = tours();
    if (!all.length) {
      if (day) day.innerHTML = '<p class="text-muted text-center w-full"><a href="tours.html" class="text-brand font-semibold">Ver catálogo →</a></p>';
      return;
    }
    var days = all.filter(function (x) { return x.category === 'day'; }).slice(0, 4);
    var pkgs = all.filter(function (x) { return x.category === 'package'; }).slice(0, 2);
    if (day) day.innerHTML = days.map(cardHTML).join('');
    if (pkg) pkg.innerHTML = pkgs.map(cardHTML).join('');
  }

  function initQuote() {
    var form = document.getElementById('home-quote');
    if (!form) return;
    var sel = document.getElementById('home-quote-dest');
    var date = document.getElementById('home-quote-date');
    var grp = document.getElementById('home-quote-group');
    var all = tours();
    if (sel) {
      sel.innerHTML = all.map(function (x) {
        return '<option value="' + pick(x.title) + '">' + pick(x.title) + '</option>';
      }).join('');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dest = sel ? sel.value : '';
      var d = date && date.value ? date.value : 'Por definir';
      var g = grp ? grp.value : '2 adultos';
      var l = lang() === 'pt' ? 'Português' : (lang() === 'en' ? 'English' : 'Español');
      var msg = '¡Hola Mario! Quiero cotizar: ' + dest + '\n• Fecha estimada: ' + d + '\n• Grupo: ' + g + '\n• Idioma: ' + l;
      window.open('https://wa.me/50370000000?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  function initCounters() {
    var nums = document.querySelectorAll('.stat-num[data-count]');
    if (!nums.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suf = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target + suf; return; }
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (0.2 + 0.8 * p)) + (p === 1 ? suf : '');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suf;
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  var KW = [
    { label: { es: 'seguridad', en: 'safety', pt: 'segurança' }, words: ['seguridad', 'seguro', 'segura', 'segurança', 'safety', 'safe'] },
    { label: { es: 'guía Mario', en: 'Mario the guide', pt: 'guia Mario' }, words: ['mario'] },
    { label: { es: 'gastronomía', en: 'local food', pt: 'gastronomia' }, words: ['gastronomía', 'gastronomia', 'comida', 'food', 'pupusa', 'café', 'cafe', 'coffee'] },
    { label: { es: 'historia y cultura', en: 'history & culture', pt: 'história e cultura' }, words: ['historia', 'história', 'history', 'cultura', 'culture'] },
    { label: { es: 'volcanes', en: 'volcanoes', pt: 'vulcões' }, words: ['volcán', 'volcan', 'vulcão', 'volcano', 'ilamatepec', 'cráter', 'crater'] },
    { label: { es: 'portugués', en: 'Portuguese spoken', pt: 'português' }, words: ['portugués', 'portugues', 'português', 'portuguese', 'brasil'] }
  ];

  function initSummary() {
    var box = document.getElementById('review-keywords');
    if (!box) return;
    var data = (window.__REVIEWS_DATA && window.__REVIEWS_DATA.reviews) || [];
    var approved = data.filter(function (r) { return r.moderation && r.moderation.status === 'approved'; });
    if (!approved.length) return;
    var text = approved.map(function (r) { return (r.comment || '').toLowerCase(); }).join(' ');
    var scored = KW.map(function (k) {
      var n = 0;
      k.words.forEach(function (w) { var m = text.match(new RegExp(w, 'g')); if (m) n += m.length; });
      return { k: k, n: n };
    }).filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
    if (!scored.length) return;
    var l = lang();
    box.innerHTML = scored.map(function (x) { return '<span class="kw-pill">' + (x.k.label[l] || x.k.label.es) + '</span>'; }).join('');
  }

  function rerender() { renderFeatured(); initSummary(); }

  document.addEventListener('DOMContentLoaded', function () {
    renderFeatured();
    initQuote();
    initCounters();
    initSummary();
    // Re-render al cambiar idioma
    if (window.__estI18n) {
      var orig = window.__estI18n.setLang;
      window.__estI18n.setLang = function (l) {
        orig.call(window.__estI18n, l);
        setTimeout(rerender, 60);
      };
    }
  });
})();
