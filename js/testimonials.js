/* ==========================================================================
   El Salvador Trails — Carrusel de Testimonios & Feedback Modal
   - Consume únicamente reseñas públicas aprobadas por el servidor
   - Los estados privados se filtran en el servidor
   - Fallback a monograma/iniciales si no hay foto de autor
   - Pausa en hover / focus / touch
   - Respeta prefers-reduced-motion
   - Soporte touch / swipe en móvil
   - Modal de envío de reseñas públicas (status: 'pending' por defecto)
   ========================================================================== */
(function () {
  'use strict';

  var reviewsData = [];
  var currentIndex = 0;
  var page = 0;
  var moreButton;
  var pageLoading = false;
  function t(key) { return window.__estI18n ? window.__estI18n.t(key) : key; }
  var autoplayTimer = null;
  var AUTOPLAY_INTERVAL = 6000;
  var trackEl = null;
  var dotsContainerEl = null;
  var isHovered = false;
  var touchStartX = 0;
  var touchEndX = 0;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getInitials(name) {
    if (!name) return 'EST';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderStars(rating) {
    var stars = '';
    var count = Math.min(Math.max(parseInt(rating, 10) || 5, 1), 5);
    for (var i = 0; i < 5; i++) {
      stars += `<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${i < count ? 1 : 0};">${i < count ? 'star' : 'star_border'}</span>`;
    }
    return stars;
  }

  function getCardsPerView() {
    var width = window.innerWidth;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }

  function getMaxIndex() {
    var perView = getCardsPerView();
    return Math.max(0, reviewsData.length - perView);
  }

  function updateTrackPosition() {
    if (!trackEl) return;
    var perView = getCardsPerView();
    var percentPerCard = 100 / perView;
    var offset = -(currentIndex * percentPerCard);
    trackEl.style.transform = `translateX(${offset}%)`;

    // Actualizar dots
    if (dotsContainerEl) {
      var dots = dotsContainerEl.querySelectorAll('.testimonial-dot');
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }
  }

  function renderDots() {
    if (!dotsContainerEl) return;
    dotsContainerEl.innerHTML = '';
    var max = getMaxIndex() + 1;
    if (max <= 1) return;

    for (var i = 0; i < max; i++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (idx === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', t('testimonials.goTo') + ' ' + (idx + 1));
        dot.addEventListener('click', function () {
          currentIndex = idx;
          updateTrackPosition();
          resetAutoplay();
        });
        dotsContainerEl.appendChild(dot);
      })(i);
    }
  }

  function nextSlide() {
    var max = getMaxIndex();
    if (currentIndex >= max) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateTrackPosition();
  }

  function prevSlide() {
    var max = getMaxIndex();
    if (currentIndex <= 0) {
      currentIndex = max;
    } else {
      currentIndex--;
    }
    updateTrackPosition();
  }

  function startAutoplay() {
    if (prefersReducedMotion()) return; // Accesibilidad
    stopAutoplay();
    autoplayTimer = setInterval(function () {
      if (!isHovered) {
        nextSlide();
      }
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function renderTestimonials(list) {
    if (!trackEl) return;
    trackEl.replaceChildren();
    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'text-center w-full py-8';
      empty.textContent = t('testimonials.empty');
      trackEl.appendChild(empty);
    }
    list.forEach(function (review) {
      var slide = document.createElement('div');
      slide.className = 'testimonial-slide';
      slide.appendChild(window.ESTReviewView.card(review, t));
      trackEl.appendChild(slide);
    });
    renderDots();
    updateTrackPosition();
  }

  function initCarouselEvents() {
    var viewport = document.getElementById('testimonials-viewport');
    var btnPrev = document.getElementById('testimonials-prev-btn');
    var btnNext = document.getElementById('testimonials-next-btn');

    if (btnPrev) {
      btnPrev.addEventListener('click', function () {
        prevSlide();
        resetAutoplay();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', function () {
        nextSlide();
        resetAutoplay();
      });
    }

    if (viewport) {
      viewport.addEventListener('mouseenter', function () {
        isHovered = true;
      });
      viewport.addEventListener('mouseleave', function () {
        isHovered = false;
      });
      viewport.addEventListener('focusin', function () {
        isHovered = true;
      });
      viewport.addEventListener('focusout', function () {
        isHovered = false;
      });

      // Touch / Swipe
      viewport.addEventListener('touchstart', function (e) {
        isHovered = true;
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      viewport.addEventListener('touchend', function (e) {
        isHovered = false;
        touchEndX = e.changedTouches[0].screenX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          resetAutoplay();
        }
      }, { passive: true });
    }

    window.addEventListener('resize', function () {
      var max = getMaxIndex();
      if (currentIndex > max) currentIndex = max;
      renderDots();
      updateTrackPosition();
    });
  }

  function initFeedbackModal() {
    var modal = document.getElementById('feedback-modal');
    var openBtn = document.getElementById('open-feedback-btn');
    var closeBtn = document.getElementById('close-feedback-btn');
    var form = document.getElementById('feedback-form');
    var ratingStars = form && form.querySelector('.rating-stars');
    var success = document.getElementById('feedback-form-success');
    var error = document.getElementById('feedback-form-error');
    var submit = form && form.querySelector('button[type="submit"]');
    var token = '';
    var widget = null;
    function paintRating(value) {
      if (!ratingStars) return;
      var rating = Number(value) || 0;
      ratingStars.querySelectorAll('.rating-star-input').forEach(function (input) {
        input.classList.toggle('is-filled', Number(input.value) <= rating);
      });
    }
    if (ratingStars) {
      ratingStars.addEventListener('change', function (event) {
        if (event.target.matches('.rating-star-input')) paintRating(event.target.value);
      });
      ratingStars.addEventListener('pointerover', function (event) {
        var input = event.target.closest('.rating-star-input');
        if (input) paintRating(input.value);
      });
      ratingStars.addEventListener('pointerleave', function () {
        paintRating(ratingStars.querySelector(':checked')?.value);
      });
    }
    var busy = false;
    var submissionId = crypto.randomUUID();
    var priorFocus;
    var config = window.ESTReviewsConfig || {};
    var local = config.localPreview && ['127.0.0.1', 'localhost'].includes(location.hostname);
    var resultStatus = '';
    if (!modal || !form) return;

    function showError(code) {
      var key = 'feedback.error.' + code;
      var text = t(key);
      error.textContent = text === key ? t('feedback.error.unavailable') : text;
      error.hidden = false;
      error.focus();
    }
    function renderTours() {
      var select = document.getElementById('feedback-tour');
      var value = select.value;
      select.replaceChildren();
      var first = document.createElement('option'); first.value = ''; first.textContent = t('feedback.form.noTour');
      select.appendChild(first);
      ((window.__TOURS_DATA || {}).tours || []).forEach(function (tour) {
        var option = document.createElement('option'); option.value = tour.slug || tour.id;
        option.textContent = tour.title[(window.__estI18n || {}).getLang ? window.__estI18n.getLang() : 'es'] || tour.title.es;
        select.appendChild(option);
      });
      select.value = value;
    }
    function resetCaptcha() {
      token = local ? 'local-test' : '';
      if (widget != null && window.turnstile) window.turnstile.reset(widget);
    }
    function initializeCaptcha() {
      if (local) { token = 'local-test'; document.getElementById('feedback-local-notice').hidden = false; return; }
      if (!window.ESTReviews.configured() || !config.turnstileSiteKey) { submit.disabled = true; showError('configuration'); return; }
      if (widget != null) return;
      function render() {
        widget = window.turnstile.render('#feedback-captcha', {
          sitekey: config.turnstileSiteKey, action: 'review',
          callback: function (value) { token = value; },
          'expired-callback': function () { token = ''; },
          'error-callback': function () { token = ''; showError('captcha'); }
        });
      }
      if (window.turnstile) { render(); return; }
      var existing = document.getElementById('review-turnstile-script');
      if (existing) return;
      var script = document.createElement('script'); script.id = 'review-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true; script.onload = render;
      script.onerror = function () { script.remove(); showError('captcha'); };
      document.head.appendChild(script);
    }
    function openModal() {
      priorFocus = document.activeElement;
      success.classList.add('hidden'); resultStatus = '';
      modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (!resultStatus) error.hidden = true;
      initializeCaptcha(); renderTours();
      form.elements.name.focus();
    }
    function closeModal() {
      modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (priorFocus) priorFocus.focus();
    }
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    modal.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeModal(); return; }
      if (event.key !== 'Tab') return;
      var nodes = Array.from(modal.querySelectorAll('button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select, textarea, a[href], iframe')).filter(function (node) { return node.getClientRects().length; });
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      error.hidden = true;
      var files = Array.from(form.elements.photos.files);
      if (files.length > 4) { showError('photo-count'); return; }
      if (files.some(function (file) { return file.size > 5 * 1024 * 1024 || !file.size; })) { showError('photo-size'); return; }
      if (files.some(function (file) { return !['image/jpeg', 'image/png', 'image/webp'].includes(file.type); })) { showError('photo-format'); return; }
      if (!token) { showError('captcha'); return; }
      var data = new FormData(form);
      // Omit the browser's empty file placeholder; Deno parses it as a text field.
      data.delete('photos');
      files.forEach(function (file) { data.append('photos', file, file.name); });
      data.set('consent', form.elements.consent.checked ? 'true' : 'false');
      data.set('lang', window.__estI18n.getLang());
      data.set('submissionId', submissionId);
      data.set('turnstileToken', token);
      busy = true; submit.disabled = true; submit.textContent = t('feedback.form.sending');
      success.classList.add('hidden'); resultStatus = '';
      try {
        var result = await window.ESTReviews.submit(data);
        resultStatus = result.status;
        success.textContent = t('feedback.form.' + result.status);
        success.classList.remove('hidden');
        form.reset(); paintRating(0); submissionId = crypto.randomUUID();
        closeModal();
        if (result.status === 'published') await loadReviews(true);
      } catch (failure) {
        showError(failure.code || 'unavailable');
        // A changed form needs a fresh ID; a network retry keeps the original ID.
        if (failure.code === 'submission-conflict') submissionId = crypto.randomUUID();
      } finally {
        busy = false; submit.disabled = !window.ESTReviews.configured();
        submit.textContent = t('feedback.form.submit'); resetCaptcha();
      }
    });
    document.addEventListener('est:language-changed', function () {
      renderTours();
      if (resultStatus) success.textContent = t('feedback.form.' + resultStatus);
      if (!busy) submit.textContent = t('feedback.form.submit');
    });
  }

  async function loadReviews(reset) {
    if (pageLoading) return;
    if (!window.ESTReviews.configured()) {
      reviewsData = []; renderTestimonials(reviewsData); return;
    }
    pageLoading = true; if (moreButton) moreButton.disabled = true;
    try {
      var nextPage = reset ? 0 : page;
      var data = await window.ESTReviews.list(nextPage);
      var priorLength = reviewsData.length;
      reviewsData = reset ? data.reviews : reviewsData.concat(data.reviews);
      if (reset) currentIndex = 0;
      else if (nextPage > 0) currentIndex = Math.min(priorLength, Math.max(0, reviewsData.length - getCardsPerView()));
      page = nextPage + 1;
      renderTestimonials(reviewsData);
      moreButton.hidden = !data.hasMore; moreButton.textContent = t('testimonials.more');
      startAutoplay();
    } catch (_) {
      if (!reviewsData.length) {
        trackEl.replaceChildren();
        var message = document.createElement('p'); message.textContent = t('testimonials.unavailable');
        trackEl.appendChild(message);
      }
      moreButton.hidden = false; moreButton.textContent = t('testimonials.retry');
    } finally { pageLoading = false; if (moreButton) moreButton.disabled = false; }
  }
  document.addEventListener('DOMContentLoaded', function () {
    trackEl = document.getElementById('testimonials-track');
    dotsContainerEl = document.getElementById('testimonials-dots');
    moreButton = document.createElement('button'); moreButton.type = 'button'; moreButton.className = 'reviews-load-more'; moreButton.hidden = true;
    document.getElementById('testimonials-viewport').parentNode.appendChild(moreButton);
    moreButton.addEventListener('click', function () { loadReviews(false); });
    initCarouselEvents(); initFeedbackModal(); loadReviews(true);
    document.addEventListener('est:language-changed', function () { renderTestimonials(reviewsData); moreButton.textContent = t('testimonials.more'); });
  });
})();
