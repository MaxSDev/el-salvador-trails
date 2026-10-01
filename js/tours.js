/* ==========================================================================
   El Salvador Tours — Catálogo Data-Driven
   
   - Lee js/tours.json (fuente de verdad)
   - Renderiza vista de categorías → lista de tours → modal detalle
   - Conecta con i18n para traducciones dinámicas
   - Arquitectura dashboard-ready: datos → UI pura
   ========================================================================== */
(function() {
  'use strict';

  /* ── Estado global ── */
  let toursData = null;
  let currentView = 'categories'; // 'categories' | 'list' | 'detail'
  let currentCategory = null; // 'day' | 'package'
  let currentTourId = null;
  let modalOpen = false;

  function mediaPicture(src, alt, options) {
    options = Object.assign({ alt: alt }, options || {});
    if (window.ESTMedia) return window.ESTMedia.picture(src, options);
    return '<img src="' + src + '" alt="' + alt + '"'
      + (options.id ? ' id="' + options.id + '"' : '')
      + (options.className ? ' class="' + options.className + '"' : '')
      + (options.loading ? ' loading="' + options.loading + '"' : '')
      + '>';
  }

  function updateResponsiveImage(image, src) {
    if (!image) return;
    var data = window.ESTMedia ? window.ESTMedia.sourceData(src) : null;
    var picture = image.closest('picture');
    if (data && picture) {
      var avif = picture.querySelector('source[type="image/avif"]');
      var webp = picture.querySelector('source[type="image/webp"]');
      if (avif) avif.srcset = data.avif;
      if (webp) webp.srcset = data.webp;
      image.width = data.width;
      image.height = data.height;
    }
    image.src = src;
  }

  /* ── Elementos DOM ── */
  const mainContent = document.querySelector('main');
  const categoriesSection = document.getElementById('categories-grid')
    || document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
  const categoriesWrap = document.getElementById('categories-wrap');
  const tourListContainer = document.getElementById('tour-list-container');
  const tourDetailContainer = document.getElementById('tour-detail-container');

  /* ── Inicialización ── */
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      await loadToursData();
      setupEventListeners();
      renderCurrentView();
      applyTranslations();
    } catch (error) {
      console.error('Error initializing tours catalog:', error);
    }
  }

  /* ── Carga de datos (funciona en http:// y en file://) ── */
  async function loadToursData() {
    // 1. Fallback embebido primero (siempre disponible aunque se abra con doble clic)
    if (window.__TOURS_DATA && window.__TOURS_DATA.tours) {
      toursData = window.__TOURS_DATA;
      // Intentar refrescar desde json si hay servidor (no rompe en file://)
      try {
        const response = await fetch('data/tours.json');
        if (response.ok) toursData = await response.json();
      } catch (_) { /* file://: nos quedamos con el fallback embebido */ }
      return;
    }
    // 2. Sin fallback: fetch normal (requiere servidor local)
    const response = await fetch('data/tours.json');
    if (!response.ok) throw new Error('Failed to load tours data');
    toursData = await response.json();
  }

  /* ── Event listeners ── */
  function setupEventListeners() {
    // Botones "Ver más" de categorías
    document.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        showCategoryList(category);
      });
    });

    // Botón "Volver" (se creará dinámicamente)
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-back-to-categories]')) {
        showCategoriesView();
      }
    });

    // Clic en tarjeta de tour
    document.addEventListener('click', (e) => {
      const tourCard = e.target.closest('[data-tour-id]');
      if (tourCard) {
        const tourId = tourCard.dataset.tourId;
        showTourDetail(tourId);
      }
    });

    // Teclado en tarjetas: Enter/Space abre detalle (Fix #4)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tourCard = e.target.closest('[data-tour-id]');
        if (tourCard) {
          e.preventDefault();
          showTourDetail(tourCard.dataset.tourId);
        }
      }
    });

    // Cierre de modal (botón X, fondo overlay, o cualquier elemento con [data-close-modal])
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-modal]') ||
          e.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });

    // Tecla Escape para cerrar modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    });

    // Monitorear cambios de idioma via i18n
    if (window.__estI18n) {
      const originalSetLang = window.__estI18n.setLang;
      window.__estI18n.setLang = function(lang) {
        originalSetLang.call(window.__estI18n, lang);
        // Re-render vista actual cuando cambia el idioma
        setTimeout(() => renderCurrentView(), 50);
      };
    }
  }

  /* ── Renderizado principal ── */
  function renderCurrentView() {
    switch (currentView) {
      case 'categories':
        showCategoriesView();
        break;
      case 'list':
        showCategoryList(currentCategory);
        break;
      case 'detail':
        showTourDetail(currentTourId);
        break;
    }
  }

  /* ── Vista de categorías ── */
  function showCategoriesView() {
    currentView = 'categories';
    currentCategory = null;
    currentTourId = null;

    // Mostrar sección de categorías
    if (categoriesSection) {
      categoriesSection.style.display = '';
    }
    if (categoriesWrap) {
      categoriesWrap.style.display = '';
    }

    // Ocultar vistas de lista y detalle
    hideElement(tourListContainer);
    hideElement(tourDetailContainer);

    // Actualizar botones "Ver más"
    updateCategoryButtons();
  }

  /* ── Vista de lista por categoría ── */
  function showCategoryList(category) {
    if (category === 'personalized') return; // ahora es enlace WhatsApp, no vista
    if (!toursData) {
      console.warn('Tours data aún no cargada');
      return;
    }
    
    currentView = 'list';
    currentCategory = category;
    currentTourId = null;

    // Ocultar categorías y detalle
    hideElement(categoriesSection);
    hideElement(categoriesWrap);
    hideElement(tourDetailContainer);

    // Filtrar tours por categoría
    const filteredTours = toursData.tours.filter(tour => tour.category === category);
    
    // Renderizar lista
    renderTourList(filteredTours, category);
  }

  function renderTourList(tours, category) {
    if (!tourListContainer) return;

    const isPackage = category === 'package';
    const isDay = category === 'day';
    const titleKey = isPackage ? 'tourPackages.heading' : 'dayTours.heading';
    const title = getTranslation(titleKey);

    let html = `
      <div class="w-full max-w-[1360px] mx-auto px-8 md:px-12 py-8">
        <div class="flex items-center gap-4 mb-8">
          <button data-back-to-categories class="flex items-center gap-2 text-brand hover:text-brand-dark transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
            <span data-i18n="catalog.back">Volver</span>
          </button>
          <h2 class="font-display text-3xl font-bold text-brand">${title}</h2>
        </div>
    `;

    if (isDay) {
      // Day Tours: galería mosaico de destinos — cada tile abre el modal de su tour
      html += `<div class="dest-gallery">`;
      tours.forEach((tour, index) => {
        html += renderDestTile(tour, index);
      });
      html += `</div>`;
    } else {
      html += `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
      `;
      tours.forEach(tour => {
        html += renderTourCard(tour);
      });
      html += `</div>`;
    }

    html += `
      </div>
    `;

    tourListContainer.innerHTML = html;
    tourListContainer.style.display = 'block';
    
    // Aplicar traducciones a elementos dinámicos
    applyTranslationsToElement(tourListContainer);
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderTourCard(tour) {
    const lang = window.__estI18n ? window.__estI18n.getLang() : 'es';
    const title = tour.title[lang] || tour.title.es || '';
    const shortDesc = tour.shortDescription[lang] || tour.shortDescription.es || '';
    const image = tour.images[0] || 'assets/img/slide_0.jpg';
    
    // Tomar los primeros 2 highlights para la tarjeta
    const highlightsRaw = tour.highlights[lang];
    const highlights = (highlightsRaw && highlightsRaw.length) ? highlightsRaw : (tour.highlights.es || []);
    const displayHighlights = highlights.slice(0, 2);

    return `
      <article class="tour-card flex flex-col cursor-pointer" data-tour-id="${tour.id}" tabindex="0" role="button" aria-label="${title}">
        <div class="aspect-[16/10] w-full overflow-hidden">
          ${mediaPicture(image, title, {
            className: 'w-full h-full object-cover transition-transform duration-700 hover:scale-105',
            sizes: '(max-width: 767px) 100vw, 50vw',
            loading: 'lazy'
          })}
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <h3 class="font-display text-xl font-bold mb-3 text-brand">${title}</h3>
          <p class="text-sm text-[var(--text-muted)] mb-4 line-clamp-3">${shortDesc}</p>
          ${displayHighlights.length > 0 ? `
            <ul class="text-sm space-y-2 mb-4 flex-grow">
              ${displayHighlights.map(h => `
                <li class="flex items-start gap-2">
                  <span class="text-accent font-bold mt-1">✶</span>
                  <span>${h}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
          <div class="mb-4 pt-3 border-t flex items-center gap-1.5 text-xs text-muted" style="border-color:var(--border);">
            <span class="material-symbols-outlined text-sm text-accent">price_check</span>
            <span class="font-medium" data-i18n="tour.pricing.heading">Precios y condiciones: contáctenos</span>
          </div>
          <button class="btn-accent w-full py-3 rounded-lg flex items-center justify-center gap-2 font-label uppercase tracking-widest text-sm mt-auto">
            <span data-i18n="tour.viewDetails">Ver detalles</span>
            <span class="material-symbols-outlined text-base">info</span>
          </button>
        </div>
      </article>
    `;
  }

  /* ── Tile galería mosaico (Day Tours): señal con nombre + botón siempre visible ──
     Feedback Ellen (mayores): CTA explícito, no solo flecha en hover. */
  function renderDestTile(tour, index) {
    const lang = window.__estI18n ? window.__estI18n.getLang() : 'es';
    const t = window.__estI18n ? window.__estI18n.t : function(k){return k;};
    const title = tour.title[lang] || tour.title.es || '';
    const label = (tour.galleryLabel && (tour.galleryLabel[lang] || tour.galleryLabel.es)) || title;
    const image = tour.images[0] || 'assets/img/slide_0.jpg';
    const delay = (index * 90) + 'ms';
    const ctaText = t('tour.viewTour') !== 'tour.viewTour' ? t('tour.viewTour') : 'Presiona aquí para ver el tour';

    return `
      <article class="dest-tile dest-tile-${index + 1}" data-tour-id="${tour.id}" tabindex="0" role="button" aria-label="${title} — ${ctaText}" style="--d:${delay}">
        ${mediaPicture(image, title, {
          className: 'dest-tile-img',
          sizes: '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw',
          loading: 'lazy'
        })}
        <div class="dest-tile-overlay" aria-hidden="true"></div>
        <div class="dest-tile-sign" aria-hidden="true">
          <span class="trail-sign"><span class="material-symbols-outlined">signpost</span><span class="trail-sign-label">${label}</span></span>
        </div>
        <div class="dest-tile-label">
          <span class="dest-tile-name">${label}</span>
          <span class="dest-tile-cta">
            <span class="dest-tile-cta-text">${ctaText}</span>
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </span>
        </div>
      </article>
    `;
  }

  /* ── Modal de detalle ── */
  function showTourDetail(tourId) {
    if (!toursData || !tourId) return;
    
    const tour = toursData.tours.find(t => t.id === tourId);
    if (!tour) return;

    currentView = 'detail';
    currentTourId = tourId;
    modalOpen = true;

    // Renderizar contenido del modal
    renderTourModal(tour);
    
    // Mostrar modal
    if (tourDetailContainer) {
      tourDetailContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Focus en el modal para accesibilidad
      setTimeout(() => {
        const closeBtn = tourDetailContainer.querySelector('[data-close-modal]');
        if (closeBtn) closeBtn.focus();
      }, 100);
    }
  }

  function renderTourModal(tour) {
    if (!tourDetailContainer) return;

    const lang = window.__estI18n ? window.__estI18n.getLang() : 'es';
    const t = window.__estI18n ? window.__estI18n.t : function(k){return k;};
    const title = tour.title[lang] || tour.title.es || '';
    const fullDesc = tour.fullDescription[lang] || tour.fullDescription.es || '';
    const images = tour.images || [];
    const isPackage = tour.category === 'package';

    // Array helpers — empty-array fallback to ES
    const includedRaw = tour.included ? tour.included[lang] : null;
    const includedItems = (includedRaw && includedRaw.length) ? includedRaw : (tour.included ? (tour.included.es || []) : null);
    const highlightsRaw = tour.highlights[lang];
    const highlightsItems = (highlightsRaw && highlightsRaw.length) ? highlightsRaw : (tour.highlights.es || []);

    let html = `
      <div class="modal-overlay">
        <div class="modal-content rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4 my-8 shadow-2xl" style="background:var(--surface-raised);color:var(--text);border:1px solid var(--border);" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <!-- Header del modal -->
          <div class="sticky top-0 border-b p-6 flex justify-between items-center z-10" style="background:var(--surface-raised);border-color:var(--border);">
            <h2 id="modal-title" class="font-display text-2xl font-bold text-brand pr-8">${title}</h2>
            <button data-close-modal class="p-2 rounded-full transition-colors" style="color:var(--brand);" aria-label="${t('tour.modal.close')}">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <!-- Contenido del modal -->
          <div class="p-6">
            <!-- Galería de imágenes -->
            ${images.length > 0 ? `
              <div class="mb-8">
                <div class="relative rounded-xl overflow-hidden aspect-video">
                  ${mediaPicture(images[0], title, {
                    id: 'modal-main-image',
                    className: 'w-full h-full object-cover',
                    sizes: '(max-width: 900px) 100vw, 820px',
                    loading: 'eager'
                  })}
                  ${images.length > 1 ? `
                    <button class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors" data-gallery-prev aria-label="${t('tour.modal.prev')}">
                      <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors" data-gallery-next aria-label="${t('tour.modal.next')}">
                      <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      ${images.map((_, i) => `
                        <button class="w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}" data-gallery-dot="${i}" aria-label="${t('tour.modal.imgN')} ${i + 1}"></button>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- Descripción completa -->
            <div class="prose prose-lg max-w-none mb-8" style="color:var(--text);">
              ${formatDescription(fullDesc)}
            </div>
            
            <!-- Itinerario (solo para packages) -->
            ${isPackage && tour.itinerary ? `
              <div class="mb-8">
                <h3 class="font-display text-xl font-bold mb-4 text-brand" data-i18n="tour.itinerary">Itinerario</h3>
                <div class="space-y-4">
                  ${tour.itinerary.map(day => `
                    <div class="border-l-4 border-brand pl-4 py-2">
                      <h4 class="font-bold text-lg mb-2">${day.day}: ${day.title[lang] || day.title.es || ''}</h4>
                      <p style="color:var(--text-muted);">${day.text[lang] || day.text.es || ''}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Incluido (solo para packages) -->
            ${isPackage && includedItems ? `
              <div class="mb-8">
                <h3 class="font-display text-xl font-bold mb-4 text-brand" data-i18n="tour.included">Incluido</h3>
                <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  ${includedItems.map(item => `
                    <li class="flex items-start gap-3">
                      <span class="text-green-500 mt-1">
                        <span class="material-symbols-outlined text-xl">check_circle</span>
                      </span>
                      <span>${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            <!-- Highlights -->
            <div class="mb-8">
              <h3 class="font-display text-xl font-bold mb-4 text-brand" data-i18n="tour.highlights">Destacados</h3>
              <ul class="space-y-3">
                ${highlightsItems.map(h => `
                  <li class="flex items-start gap-3">
                    <span class="text-accent font-bold mt-1">✶</span>
                    <span>${h}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- Ficha rápida: duración, grupo, recojo, rating -->
            <div class="mb-8 p-4 rounded-xl border grid grid-cols-2 md:grid-cols-4 gap-4" style="background:var(--brand-soft);border-color:var(--border);">
              <div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-accent">schedule</span><span>${tour.duration ? (tour.duration[lang] || tour.duration.es || '') : ''}</span></div>
              <div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-accent">group</span><span>${tour.groupSize ? (tour.groupSize[lang] || tour.groupSize.es || '') : ''}</span></div>
              <div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-accent">pin_drop</span><span>${tour.pickup ? (tour.pickup[lang] || tour.pickup.es || '') : ''}</span></div>
              <div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-accent">star</span><span><strong>${(tour.rating || 5).toFixed(1)}</strong>${tour.ratingCount ? ' (' + tour.ratingCount + ')' : ''}</span></div>
            </div>

            <!-- Punto de encuentro con foto -->
            ${tour.meetingPoint ? `
              <div class="mb-8 p-4 rounded-xl border flex flex-col sm:flex-row items-start gap-4" style="background:var(--surface);border-color:var(--border);">
                ${mediaPicture(tour.meetingPoint.photo || images[0] || '', t('tour.meeting.title'), {
                  className: 'rounded-lg w-full sm:w-40 h-28 object-cover flex-none',
                  sizes: '(max-width: 639px) 100vw, 160px',
                  loading: 'lazy'
                })}
                <div class="flex-grow">
                  <h4 class="font-bold text-sm text-brand mb-1" data-i18n="tour.meeting.title">${t('tour.meeting.title')}</h4>
                  <p class="text-sm text-muted mb-2">${tour.meetingPoint.address ? (tour.meetingPoint.address[lang] || tour.meetingPoint.address.es || '') : ''}</p>
                  ${tour.meetingPoint.mapUrl ? `<a href="${tour.meetingPoint.mapUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm font-semibold text-brand"><span class="material-symbols-outlined text-base">map</span><span data-i18n="tour.meeting.map">${t('tour.meeting.map')}</span></a>` : ''}
                </div>
              </div>
            ` : ''}

            <!-- Video en Redes Sociales (TikTok / Instagram) -->
            ${tour.socialVideo ? `
              <div class="mb-8 p-4 rounded-xl flex items-center justify-between gap-4 border" style="background:var(--brand-soft);border-color:var(--border);">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-2xl text-accent">play_circle</span>
                  <div>
                    <h4 class="font-bold text-sm text-brand" data-i18n="tour.video.button">Ver video del tour</h4>
                    <p class="text-xs text-muted">Disponible en ${tour.socialVideo.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</p>
                  </div>
                </div>
                <a href="${tour.socialVideo.url}" target="_blank" rel="noopener noreferrer" class="btn-accent px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider inline-flex items-center gap-2">
                  <i class="fa-brands fa-${tour.socialVideo.platform}"></i>
                  <span data-i18n="tour.video.${tour.socialVideo.platform}">${tour.socialVideo.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</span>
                  <span class="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            ` : ''}

            <!-- Precios y Condiciones: Contáctenos -->
            <div class="p-6 md:p-8 rounded-xl border mt-8" style="background:var(--surface);border-color:var(--accent);">
              <div class="flex items-start gap-4 mb-4">
                <span class="material-symbols-outlined text-3xl text-accent">request_quote</span>
                <div>
                  <h3 class="font-display text-xl md:text-2xl font-bold text-brand" data-i18n="tour.pricing.heading">Precios y condiciones: contáctenos</h3>
                  <p class="text-sm mt-2 leading-relaxed text-muted" data-i18n="tour.pricing.notice">
                    Nuestras tarifas se adaptan al tamaño y necesidades específicas de su grupo (los niños menores de 12 años gozan de tarifa especial al 50%). Permítanos diseñar su cotización personalizada.
                  </p>
                </div>
              </div>

              <!-- Selector interactivo de grupo -->
              <div class="mt-6 pt-6 border-t" style="border-color:var(--border);">
                <h4 class="text-xs font-semibold uppercase tracking-wider mb-4 text-brand" data-i18n="tour.pricing.groupTitle">Indique la composición de su grupo para cotizar:</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label class="block text-xs font-medium mb-1 text-muted" data-i18n="tour.pricing.adults">Adultos</label>
                    <input type="number" id="quote-adults" min="1" max="50" value="2" class="w-full px-3 py-2 rounded-lg border text-sm" style="background:var(--surface-raised);border-color:var(--border);color:var(--text);">
                  </div>
                  <div>
                    <label class="block text-xs font-medium mb-1 text-muted" data-i18n="tour.pricing.children">Niños (<12 años - 50%)</label>
                    <input type="number" id="quote-children" min="0" max="50" value="0" class="w-full px-3 py-2 rounded-lg border text-sm" style="background:var(--surface-raised);border-color:var(--border);color:var(--text);">
                  </div>
                  <div>
                    <label class="block text-xs font-medium mb-1 text-muted" data-i18n="tour.pricing.date">Fecha estimada</label>
                    <input type="date" id="quote-date" class="w-full px-3 py-2 rounded-lg border text-sm" style="background:var(--surface-raised);border-color:var(--border);color:var(--text);">
                  </div>
                </div>

                <!-- Botones de acción directa con mensaje pre-armado -->
                <div class="flex flex-col sm:flex-row gap-4">
                  <button type="button" id="btn-quote-whatsapp" class="btn-accent flex-1 py-3 px-6 rounded-lg font-label uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <i class="fa-brands fa-whatsapp text-lg"></i>
                    <span data-i18n="tour.pricing.whatsappBtn">Cotizar por WhatsApp</span>
                  </button>
                  <button type="button" id="btn-quote-email" class="btn-secondary flex-1 py-3 px-6 rounded-lg font-label uppercase tracking-widest text-xs flex items-center justify-center gap-2 border" style="border-color:var(--border);">
                    <span class="material-symbols-outlined text-lg">mail</span>
                    <span data-i18n="tour.pricing.emailBtn">Cotizar por Correo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    tourDetailContainer.innerHTML = html;
    
    // Configurar galería de imágenes
    if (images.length > 1) {
      setupImageGallery(images);
    }
    
    // Aplicar traducciones
    applyTranslationsToElement(tourDetailContainer);

    // Configurar acciones de cotización por WhatsApp y Correo
    setupQuotationActions(tour, title);

    // ── Focus trap (Fix #4) ──
    setupFocusTrap();
  }

  /* ── Galería de imágenes ── */
  function setupImageGallery(images) {
    let currentImageIndex = 0;
    const mainImage = document.getElementById('modal-main-image');
    const dots = tourDetailContainer.querySelectorAll('[data-gallery-dot]');
    
    function updateGallery(index) {
      currentImageIndex = index;
      if (mainImage) {
        updateResponsiveImage(mainImage, images[index]);
      }
      dots.forEach((dot, i) => {
        dot.classList.toggle('bg-white', i === index);
        dot.classList.toggle('bg-white/50', i !== index);
      });
    }

    // Botones de navegación
    tourDetailContainer.querySelector('[data-gallery-prev]')?.addEventListener('click', () => {
      const newIndex = (currentImageIndex - 1 + images.length) % images.length;
      updateGallery(newIndex);
    });

    tourDetailContainer.querySelector('[data-gallery-next]')?.addEventListener('click', () => {
      const newIndex = (currentImageIndex + 1) % images.length;
      updateGallery(newIndex);
    });

    // Puntos de navegación
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => updateGallery(index));
    });
  }

  /* ── Acciones de Cotización Personalizada (WhatsApp / Email) ── */
  function setupQuotationActions(tour, tourTitle) {
    const whatsappBtn = document.getElementById('btn-quote-whatsapp');
    const emailBtn = document.getElementById('btn-quote-email');
    const adultsInput = document.getElementById('quote-adults');
    const childrenInput = document.getElementById('quote-children');
    const dateInput = document.getElementById('quote-date');

    function getQuoteData() {
      const adults = adultsInput ? parseInt(adultsInput.value, 10) || 1 : 1;
      const children = childrenInput ? parseInt(childrenInput.value, 10) || 0 : 0;
      const dateVal = dateInput && dateInput.value ? dateInput.value : 'Por definir';
      const lang = window.__estI18n ? window.__estI18n.getLang() : 'es';
      const langName = lang === 'pt' ? 'Português' : (lang === 'en' ? 'English' : 'Español');
      return { adults, children, date: dateVal, langName };
    }

    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        const q = getQuoteData();
        const text = `¡Hola Mario! Me gustaría cotizar el tour: ${tourTitle}.\n` +
                     `• Adultos: ${q.adults}\n` +
                     `• Niños (<12 años - 50%): ${q.children}\n` +
                     `• Fecha estimada: ${q.date}\n` +
                     `• Idioma de preferencia: ${q.langName}`;
        const url = `https://wa.me/50370000000?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      });
    }

    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        const q = getQuoteData();
        const subject = `Solicitud de Cotización: ${tourTitle} - El Salvador Trails`;
        const body = `Hola Mario y Ellen,\n\n` +
                     `Deseo solicitar una cotización personalizada para el siguiente tour:\n` +
                     `• Tour: ${tourTitle}\n` +
                     `• Adultos: ${q.adults}\n` +
                     `• Niños (<12 años): ${q.children}\n` +
                     `• Fecha estimada de viaje: ${q.date}\n` +
                     `• Idioma de preferencia: ${q.langName}\n\n` +
                     `Quedo a la espera de sus comentarios.\n\nSaludos cordiales,`;
        window.location.href = `mailto:info@elsalvadortrails.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    }
  }

  /* ── Utilidades ── */
  function hideElement(el) {
    if (el) el.style.display = 'none';
  }

  function getTranslation(key) {
    if (window.__estI18n && window.__estI18n.t) {
      return window.__estI18n.t(key);
    }
    return key;
  }

  function applyTranslations() {
    if (window.__estI18n && window.__estI18n.applyTranslations) {
      window.__estI18n.applyTranslations();
    }
  }

  function applyTranslationsToElement(container) {
    // Aplicar data-i18n a elementos dentro del contenedor
    container.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = getTranslation(key);
    });
  }

  function formatDescription(text) {
    if (!text) return '';
    // Convertir saltos de línea en párrafos
    return text.split('\n\n').map(p => `<p class="mb-4">${p}</p>`).join('');
  }

  function updateCategoryButtons() {
    // Actualizar estado de botones "Ver más"
    document.querySelectorAll('[data-category]').forEach(btn => {
      const category = btn.dataset.category;
      const hasTours = toursData?.tours.some(t => t.category === category);
      btn.disabled = !hasTours;
      
      if (category === 'personalized') {
        // Personalized Experience: deshabilitado con label "Próximamente"
        const span = btn.querySelector('[data-i18n]');
        if (span) {
          span.setAttribute('data-i18n', 'personalized.comingSoon');
          span.textContent = getTranslation('personalized.comingSoon');
        }
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    });
  }

  /* ── API pública ── */
  window.__estTours = {
    showCategoryList,
    showTourDetail,
    showCategoriesView,
    getCurrentView: () => currentView,
    getCurrentCategory: () => currentCategory,
    getCurrentTourId: () => currentTourId
  };

  // Exponer función para cerrar modal desde HTML
  window.closeTourModal = closeModal;

  /* ── Focus trap (Fix #4) ── */
  let focusTrapHandler = null;

  function setupFocusTrap() {
    const dialog = tourDetailContainer.querySelector('[role="dialog"]');
    if (!dialog) return;

    focusTrapHandler = function(e) {
      if (e.key !== 'Tab') return;

      const focusable = dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', focusTrapHandler);
  }

  function removeFocusTrap() {
    if (focusTrapHandler) {
      document.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  function closeModal() {
    modalOpen = false;
    removeFocusTrap();
    hideElement(tourDetailContainer);
    document.body.style.overflow = '';
    
    // Volver a vista de lista si estamos en detalle
    if (currentView === 'detail') {
      currentView = 'list';
    }
    
    // Focus de vuelta al botón que abrió el modal
    if (currentTourId) {
      const tourCard = document.querySelector(`[data-tour-id="${currentTourId}"]`);
      if (tourCard) tourCard.focus();
    }
  }

})();
