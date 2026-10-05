document.addEventListener('DOMContentLoaded', () => {
  // Slide data using i18n keys — title/desc are resolved at render time
  const slides = [
    { titleKey: "slide0.title", descKey: "slide0.desc", img: "assets/img/slide_0.jpg" },
    { titleKey: "slide1.title", descKey: "slide1.desc", img: "assets/img/slide_1.jpg" },
    { titleKey: "slide2.title", descKey: "slide2.desc", img: "assets/img/slide_2.jpg" },
    { titleKey: "slide3.title", descKey: "slide3.desc", img: "assets/img/slide_3.jpg" }
  ];

  /** Resolve slide text via i18n helper if available, fallback to ES */
  function slideText(key) {
    if (window.__estI18n && typeof window.__estI18n.t === 'function') {
      return window.__estI18n.t(key);
    }
    // Fallback: very first dictionary entry (ES)
    const fallback = {
      "slide0.title": "Playa El Sunzal",
      "slide0.desc": "Ubicada en La Libertad, es un referente mundial para el surf. Destaca por su icónica formación rocosa en la orilla, sus imponentes olas, una vibrante vida nocturna y atardeceres espectaculares sobre el océano Pacífico.",
      "slide1.title": "Ruta de las Flores",
      "slide1.desc": "Un encantador recorrido montañoso que conecta pintorescos pueblos llenos de color, murales artísticos, un clima fresco espectacular, cafetales tradicionales y la calidez inigualable de la gente local.",
      "slide2.title": "Puerta del Diablo",
      "slide2.desc": "Un majestuoso lago de origen volcánico ubicado en Santa Ana, catalogado como uno de los más hermosos del mundo. Sus aguas cristalinas cambian periódicamente a un asombroso color azul turquesa.",
      "slide3.title": "Centro Histórico",
      "slide3.desc": "Un lugar ideal para recorrer la historia, la arquitectura y la vida cultural de San Salvador. Sus plazas, edificios emblemáticos y espacios renovados ofrecen una visita agradable para quienes desean conocer un poco más del corazón de la ciudad.",
      "carousel.pause": "Pausar",
      "carousel.play": "Reanudar"
    };
    return fallback[key] || key;
  }

  let currentIndex = 0;
  const AUTOPLAY_TIME = 4000;
  let autoplayInterval;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userPaused = Boolean(reducedMotion);
  let interactionPaused = false;

  const mainImage = document.getElementById('main-image');
  const slideTitle = document.getElementById('slide-title');
  const slideDesc = document.getElementById('slide-desc');
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  const bgLayers = [document.getElementById('bg-layer-1'), document.getElementById('bg-layer-2')];
  const pauseButton = document.getElementById('carousel-pause-btn');
  const carouselCounter = document.getElementById('carousel-counter');
  const carouselRegion = document.getElementById('destination-carousel');
  let activeBgLayer = 0;
  let touchStartX = null;
  let touchStartY = null;

  function responsivePicture(src, alt) {
    if (window.ESTMedia) {
      return window.ESTMedia.picture(src, {
        alt: alt,
        className: 'w-full h-full object-cover',
        sizes: '96px',
        loading: 'lazy'
      });
    }
    return '<img src="' + src + '" alt="' + alt + '">';
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

  function backgroundSource(src) {
    return window.ESTMedia
      ? window.ESTMedia.preferredSource(src, { format: 'webp', maxWidth: 1200 })
      : src;
  }

  function syncCarouselCounter() {
    if (!carouselCounter) return;
    const visible = String(currentIndex + 1).padStart(2, '0');
    const total = String(slides.length).padStart(2, '0');
    carouselCounter.textContent = visible + ' / ' + total;
  }

  /** Re-render slide text for current index (no image swap, no fade) */
  function refreshSlideText() {
    if (!slideTitle || !slideDesc) return;
    const slide = slides[currentIndex];
    slideTitle.textContent = slideText(slide.titleKey);
    slideDesc.textContent = slideText(slide.descKey);
  }

  // Initial Background
  bgLayers[0].style.backgroundImage = `url(${backgroundSource(slides[0].img)})`;

  const renderThumbnails = () => {
    thumbnailsContainer.innerHTML = slides.map((slide, index) => `
      <button class="thumb-btn ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="${slideText('carousel.thumb')} ${index + 1}" aria-current="${index === 0 ? 'true' : 'false'}">
        ${responsivePicture(slide.img, slideText('carousel.thumb') + ' ' + (index + 1))}
      </button>
    `).join('');

    thumbnailsContainer.querySelectorAll('.thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        if (index !== currentIndex) {
          updateSlide(index);
          resetAutoplay();
        }
      });
    });
  };

  const updateSlide = (index) => {
    const slide = slides[index];
    const prevIndex = currentIndex;
    currentIndex = index;
    syncCarouselCounter();

    // 1. Update Main Image with Cross-fade
    mainImage.classList.add('fade-out');
    setTimeout(() => {
      updateResponsiveImage(mainImage, slide.img);
      mainImage.classList.remove('fade-out');
    }, 300);

    // 2. Update Text with brief fade — resolve via i18n
    const textContainer = document.querySelector('.slide-details');
    textContainer.style.opacity = '0';
    setTimeout(() => {
      slideTitle.textContent = slideText(slide.titleKey);
      slideDesc.textContent = slideText(slide.descKey);
      textContainer.style.opacity = '1';
    }, 300);

    // 3. Update Background Layer (Cross-fade)
    const nextBgLayer = 1 - activeBgLayer;
    bgLayers[nextBgLayer].style.backgroundImage = `url(${backgroundSource(slide.img)})`;
    bgLayers[nextBgLayer].classList.add('active');
    bgLayers[activeBgLayer].classList.remove('active');
    activeBgLayer = nextBgLayer;

    // 4. Update Thumbnails + tabs
    const thumbs = thumbnailsContainer.querySelectorAll('.thumb-btn');
    if (thumbs[prevIndex]) thumbs[prevIndex].classList.remove('active');
    if (thumbs[currentIndex]) thumbs[currentIndex].classList.add('active');
    if (thumbs[prevIndex]) thumbs[prevIndex].setAttribute('aria-current', 'false');
    if (thumbs[currentIndex]) thumbs[currentIndex].setAttribute('aria-current', 'true');
    document.querySelectorAll('[data-carousel-tab]').forEach(function (tab) {
      var idx = parseInt(tab.getAttribute('data-carousel-tab'), 10);
      tab.classList.toggle('active', idx === currentIndex);
      tab.setAttribute('aria-current', idx === currentIndex ? 'true' : 'false');
    });
  };

  const stopAutoplay = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (userPaused || interactionPaused || reducedMotion || document.hidden) return;
    autoplayInterval = setInterval(() => {
      updateSlide((currentIndex + 1) % slides.length);
    }, AUTOPLAY_TIME);
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  function syncPauseButton() {
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    var labelKey = userPaused ? 'carousel.play' : 'carousel.pause';
    pauseButton.setAttribute('aria-label', slideText(labelKey));
    var label = pauseButton.querySelector('[data-carousel-pause-label]');
    var icon = pauseButton.querySelector('.material-symbols-outlined');
    if (label) label.textContent = slideText(labelKey);
    if (icon) icon.textContent = userPaused ? 'play_arrow' : 'pause';
  }

  // Tabs superiores ahora sí cambian el slide (antes eran botones muertos)
  document.querySelectorAll('[data-carousel-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var index = parseInt(tab.getAttribute('data-carousel-tab'), 10);
      if (!isNaN(index) && index !== currentIndex) {
        updateSlide(index);
        resetAutoplay();
      }
    });
  });

  if (pauseButton) {
    pauseButton.addEventListener('click', function () {
      userPaused = !userPaused;
      syncPauseButton();
      if (userPaused) stopAutoplay();
      else startAutoplay();
    });
  }

  if (carouselRegion) {
    carouselRegion.addEventListener('mouseenter', function () {
      interactionPaused = true;
      stopAutoplay();
    });
    carouselRegion.addEventListener('mouseleave', function () {
      interactionPaused = false;
      startAutoplay();
    });
    carouselRegion.addEventListener('focusin', function () {
      interactionPaused = true;
      stopAutoplay();
    });
    carouselRegion.addEventListener('focusout', function (event) {
      if (event.relatedTarget && carouselRegion.contains(event.relatedTarget)) return;
      interactionPaused = false;
      startAutoplay();
    });
    carouselRegion.addEventListener('touchstart', function (event) {
      if (!event.touches || event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });
    carouselRegion.addEventListener('touchend', function (event) {
      if (touchStartX === null || touchStartY === null || !event.changedTouches || !event.changedTouches[0]) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      const direction = deltaX < 0 ? 1 : -1;
      updateSlide((currentIndex + direction + slides.length) % slides.length);
      resetAutoplay();
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  renderThumbnails();
  syncCarouselCounter();
  syncPauseButton();
  startAutoplay();

  // ── Fix #5: re-render slide text immediately on language change ──
  if (window.__estI18n) {
    const origSetLang = window.__estI18n.setLang;
    window.__estI18n.setLang = function (lang) {
      origSetLang.call(window.__estI18n, lang);
      // Immediately update visible slide text (no wait for autoplay)
      setTimeout(function () {
        refreshSlideText();
        syncPauseButton();
      }, 30);
    };
  }
});
