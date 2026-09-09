document.addEventListener('DOMContentLoaded', () => {
  const slides = [
    {
      title: "Playa El Sunzal",
      desc: "Ubicada en La Libertad, es un referente mundial para el surf. Destaca por su icónica formación rocosa en la orilla, sus imponentes olas, una vibrante vida nocturna y atardeceres espectaculares sobre el océano Pacífico.",
      img: "assets/slide_0.jpg"
    },
    {
      title: "Ruta de las Flores",
      desc: "Un encantador recorrido montañoso que conecta pintorescos pueblos llenos de color, murales artísticos, un clima fresco espectacular, cafetales tradicionales y la calidez inigualable de la gente local.",
      img: "assets/slide_1.jpg"
    },
    {
      title: "Puerta del Diablo",
      desc: "Un majestuoso lago de origen volcánico ubicado en Santa Ana, catalogado como uno de los más hermosos del mundo. Sus aguas cristalinas cambian periódicamente a un asombroso color azul turquesa.",
      img: "assets/slide_2.jpg"
    },
    {
      title: "Volcán de Santa Ana",
      desc: "También conocido como Ilamatepec, es el gigante de El Salvador. El sendero hacia su cima recompensa a los viajeros con una impresionante vista panorámica de la cordillera y una laguna color verde esmeralda en su cráter activo.",
      img: "assets/slide_3.jpg"
    }
  ];

  let currentIndex = 0;
  const AUTOPLAY_TIME = 4000;
  let autoplayInterval;

  const mainImage = document.getElementById('main-image');
  const slideTitle = document.getElementById('slide-title');
  const slideDesc = document.getElementById('slide-desc');
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  const bgLayers = [document.getElementById('bg-layer-1'), document.getElementById('bg-layer-2')];
  let activeBgLayer = 0;

  // Initial Background
  bgLayers[0].style.backgroundImage = `url(${slides[0].img})`;

  const renderThumbnails = () => {
    thumbnailsContainer.innerHTML = slides.map((slide, index) => `
      <button class="thumb-btn ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${slide.img}" alt="Miniatura ${index}">
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

    // 1. Update Main Image with Cross-fade
    mainImage.classList.add('fade-out');
    setTimeout(() => {
      mainImage.src = slide.img;
      mainImage.classList.remove('fade-out');
    }, 300);

    // 2. Update Text with brief fade
    const textContainer = document.querySelector('.slide-details');
    textContainer.style.opacity = '0';
    setTimeout(() => {
      slideTitle.textContent = slide.title;
      slideDesc.textContent = slide.desc;
      textContainer.style.opacity = '1';
    }, 300);

    // 3. Update Background Layer (Cross-fade)
    const nextBgLayer = 1 - activeBgLayer;
    bgLayers[nextBgLayer].style.backgroundImage = `url(${slide.img})`;
    bgLayers[nextBgLayer].classList.add('active');
    bgLayers[activeBgLayer].classList.remove('active');
    activeBgLayer = nextBgLayer;

    // 4. Update Thumbnails
    const thumbs = thumbnailsContainer.querySelectorAll('.thumb-btn');
    thumbs[prevIndex].classList.remove('active');
    thumbs[currentIndex].classList.add('active');
  };

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      updateSlide((currentIndex + 1) % slides.length);
    }, AUTOPLAY_TIME);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  renderThumbnails();
  startAutoplay();
});