/* ==========================================================================
   El Salvador Trails — Carrusel de Testimonios & Feedback Modal
   - Consume content/reviews.json (Single Source of Truth)
   - Filtro estricto: status === 'approved' && featured === true
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
        dot.setAttribute('aria-label', `Ir al testimonio ${idx + 1}`);
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
    trackEl.innerHTML = '';

    if (!list || list.length === 0) {
      trackEl.innerHTML = '<p class="text-center w-full py-8 text-[var(--text-muted)]">No hay testimonios disponibles en este momento.</p>';
      return;
    }

    list.forEach(function (review) {
      var slide = document.createElement('div');
      slide.className = 'testimonial-slide';

      var initials = getInitials(review.author ? review.author.name : 'EST');
      var avatarHtml = '';
      if (review.author && review.author.avatarUrl) {
        avatarHtml = `<img src="${review.author.avatarUrl}" alt="${review.author.name}" class="w-11 h-11 rounded-full object-cover border-2 border-[var(--accent)] flex-shrink-0" onerror="this.outerHTML='<div class=\\'testimonial-avatar-fallback\\'>${initials}</div>';">`;
      } else {
        avatarHtml = `<div class="testimonial-avatar-fallback">${initials}</div>`;
      }

      var photoBadge = '';
      if (review.photos && review.photos.length > 0) {
        photoBadge = `
          <div class="testimonial-photo-badge" title="${review.photos[0].caption || 'Foto del viaje'}">
            <span class="material-symbols-outlined text-sm">photo_camera</span>
            <span>${review.photos.length} foto${review.photos.length > 1 ? 's' : ''}</span>
          </div>
        `;
      }

      slide.innerHTML = `
        <article class="testimonial-card">
          <span class="testimonial-quote-icon">“</span>
          
          <div class="testimonial-stars" aria-label="${review.rating} de 5 estrellas">
            ${renderStars(review.rating)}
          </div>

          <p class="testimonial-comment">"${review.comment}"</p>

          <div>
            ${photoBadge}
            <div class="testimonial-author-meta">
              ${avatarHtml}
              <div>
                <h4 class="testimonial-author-name">${review.author ? review.author.name : 'Viajero Anónimo'}</h4>
                <div class="testimonial-author-country">
                  <span class="material-symbols-outlined text-xs">public</span>
                  <span>${review.author && review.author.country ? review.author.country : 'Viajero internacional'}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;

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
    var successMsg = document.getElementById('feedback-form-success');

    if (!modal) return;

    function openModal() {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (form) form.reset();
      if (successMsg) successMsg.classList.add('hidden');
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';
        }

        // Simulación de envío con creación en estado PENDIENTE
        setTimeout(function () {
          if (successMsg) successMsg.classList.remove('hidden');
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar para revisión';
          }
          setTimeout(closeModal, 3000);
        }, 800);
      });
    }
  }

  function loadReviews() {
    fetch('content/reviews.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(function (data) {
        // FILTRO DE VISIBILIDAD INVIOLABLE:
        // Solo mostramos reseñas que estén APROBADAS y marcadas como DESTACADAS para el home
        var list = (data && data.reviews) ? data.reviews : [];
        reviewsData = list.filter(function (r) {
          return r.moderation && r.moderation.status === 'approved' && r.moderation.featured === true;
        });

        renderTestimonials(reviewsData);
        startAutoplay();
      })
      .catch(function (err) {
        console.warn('No se pudo cargar reviews.json:', err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    trackEl = document.getElementById('testimonials-track');
    dotsContainerEl = document.getElementById('testimonials-dots');
    initCarouselEvents();
    initFeedbackModal();
    loadReviews();
  });
})();
