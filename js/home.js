/* El Salvador Trails — Home: tours destacados y cotización rápida.
   Reusa data/tours-data.js y mantiene la presentación libre de cifras demo. */
(function () {
  'use strict';

  function lang() { return window.__estI18n ? window.__estI18n.getLang() : 'es'; }
  function t(k) { return window.__estI18n ? window.__estI18n.t(k) : k; }
  function pick(o) { var l = lang(); return (o && (o[l] || o.es)) || ''; }

  function tours() {
    if (window.__TOURS_DATA && window.__TOURS_DATA.tours) return window.__TOURS_DATA.tours;
    return [];
  }

  function cardHTML(tour, index) {
    var title = pick(tour.title);
    var img = (tour.images && tour.images[0]) || 'assets/img/slide_0.jpg';
    var isLead = index === 0;
    var variantClass = isLead ? 'tour-card--lead' : 'tour-card--secondary';
    var imageMarkup = window.ESTMedia
      ? window.ESTMedia.picture(img, {
          alt: title,
          className: 'tour-card-image',
          sizes: isLead
            ? '(max-width: 767px) 100vw, 62vw'
            : '(max-width: 767px) 100vw, 38vw',
          loading: 'lazy'
        })
      : '<img src="' + img + '" alt="' + title + '" loading="lazy" class="tour-card-image">';
    var dur = pick(tour.duration);
    var grp = pick(tour.groupSize);
    return (
      '<article class="tour-card home-tour-card ' + variantClass + '">' +
        '<div class="tour-card-media">' +
          imageMarkup +
        '</div>' +
        '<div class="tour-card-content">' +
          '<p class="tour-card-duration">' + dur + '</p>' +
          '<h3>' + title + '</h3>' +
          '<p class="home-meta">' + grp + ' · ' + pick(tour.pickup) + '</p>' +
          '<p class="home-from">' + t('home.featured.quote') + '</p>' +
          '<a href="tours.html" class="btn-accent tour-card-link"><span>' + t('tour.viewTour') + '</span><span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>' +
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
    var days = all.filter(function (x) { return x.category === 'day'; }).slice(0, 3);
    var pkgs = all.filter(function (x) { return x.category === 'package'; }).slice(0, 1);
    if (day) day.innerHTML = days.map(function (tour, index) {
      return cardHTML(tour, index);
    }).join('');
    if (pkg) pkg.innerHTML = pkgs.map(function (tour, index) {
      return cardHTML(tour, index + days.length);
    }).join('');
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

  function rerender() { renderFeatured(); }

  document.addEventListener('DOMContentLoaded', function () {
    renderFeatured();
    initQuote();
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
