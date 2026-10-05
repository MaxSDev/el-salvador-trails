import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

function createElement() {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();

  return {
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: '',
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value),
      contains: value => classes.has(value),
      toggle(value, force) {
        if (typeof force === 'boolean') {
          if (force) classes.add(value);
          else classes.delete(value);
          return force;
        }
        if (classes.has(value)) {
          classes.delete(value);
          return false;
        }
        classes.add(value);
        return true;
      }
    },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const handler of listeners.get(type) || []) handler(event);
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: name => attributes.get(name),
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    contains: () => false
  };
}

async function mountCarousel() {
  const source = await read('js/script.js');
  const tabs = Array.from({ length: 4 }, (_, index) => {
    const tab = createElement();
    tab.setAttribute('data-carousel-tab', index);
    return tab;
  });
  const details = createElement();
  const elements = new Map([
    ['main-image', createElement()],
    ['slide-title', createElement()],
    ['slide-desc', createElement()],
    ['thumbnails-container', createElement()],
    ['bg-layer-1', createElement()],
    ['bg-layer-2', createElement()],
    ['carousel-pause-btn', createElement()],
    ['carousel-counter', createElement()],
    ['destination-carousel', createElement()]
  ]);
  const documentListeners = new Map();
  const document = {
    hidden: false,
    addEventListener(type, handler) {
      const handlers = documentListeners.get(type) || [];
      handlers.push(handler);
      documentListeners.set(type, handlers);
    },
    getElementById: id => elements.get(id) || null,
    querySelector: selector => selector === '.slide-details' ? details : null,
    querySelectorAll: selector => selector === '[data-carousel-tab]' ? tabs : []
  };
  const window = {
    matchMedia: () => ({ matches: false }),
    setInterval: () => 1,
    clearInterval: () => {}
  };

  vm.runInNewContext(source, {
    document,
    window,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
    setTimeout: handler => handler(),
    isNaN,
    parseInt
  });
  for (const handler of documentListeners.get('DOMContentLoaded') || []) handler();

  return { elements, tabs };
}

test('la Home reserva un video principal y tres historias sin simular reproducción', async () => {
  const html = await read('index.html');
  const mainPlaceholders = html.match(/data-video-placeholder="main"/g) || [];
  const storyPlaceholders = html.match(/data-video-placeholder="story"/g) || [];

  assert.equal(mainPlaceholders.length, 1);
  assert.equal(storyPlaceholders.length, 3);
  assert.match(html, /video-placeholder--main/);
  assert.match(html, /story-video-card/);
  assert.doesNotMatch(html, /<video\b|\bautoplay\b/i);
});

test('la presentación pública de la Home no incluye cifras demo ni reseñas hardcodeadas', async () => {
  const html = await read('index.html');

  assert.match(html, /testimonials-section/);
  assert.match(html, /testimonials\.js/);
  assert.doesNotMatch(html, /data-count=|stats-row/);
  assert.doesNotMatch(html, /Sarah Jenkins|Usuario de Prueba Pendiente/);
  assert.doesNotMatch(html, /5\.0 en reseñas|#1 en TripAdvisor|20\+ años/i);
});

test('el carrusel permite pausar y reanudar su rotación', async () => {
  const source = await read('js/script.js');
  const elements = new Map([
    ['main-image', createElement()],
    ['slide-title', createElement()],
    ['slide-desc', createElement()],
    ['thumbnails-container', createElement()],
    ['bg-layer-1', createElement()],
    ['bg-layer-2', createElement()],
    ['carousel-pause-btn', createElement()],
    ['destination-carousel', createElement()]
  ]);
  const documentListeners = new Map();
  const document = {
    hidden: false,
    addEventListener(type, handler) {
      const handlers = documentListeners.get(type) || [];
      handlers.push(handler);
      documentListeners.set(type, handlers);
    },
    getElementById: id => elements.get(id) || null,
    querySelector: selector => selector === '.slide-details' ? createElement() : null,
    querySelectorAll: () => []
  };
  let nextTimer = 1;
  const activeTimers = new Set();
  const window = {
    matchMedia: () => ({ matches: false }),
    setInterval(handler) {
      const id = nextTimer++;
      activeTimers.add(id);
      return id;
    },
    clearInterval(id) {
      activeTimers.delete(id);
    }
  };

  vm.runInNewContext(source, {
    document,
    window,
    setInterval: window.setInterval,
    clearInterval: window.clearInterval,
    setTimeout: handler => handler(),
    isNaN,
    parseInt
  });
  for (const handler of documentListeners.get('DOMContentLoaded') || []) handler();

  const pauseButton = elements.get('carousel-pause-btn');
  assert.equal(activeTimers.size, 1);

  pauseButton.dispatch('click');
  assert.equal(activeTimers.size, 0);
  assert.equal(pauseButton.getAttribute('aria-pressed'), 'true');

  pauseButton.dispatch('click');
  assert.equal(activeTimers.size, 1);
  assert.equal(pauseButton.getAttribute('aria-pressed'), 'false');
});

test('el hero conserva cuatro destinos, miniaturas, pausa y CTA al volverse inmersivo', async () => {
  const [html, source] = await Promise.all([
    read('index.html'),
    read('js/script.js')
  ]);

  assert.equal((html.match(/data-carousel-tab=/g) || []).length, 4);
  assert.equal((source.match(/titleKey:\s*"slide\d\.title"/g) || []).length, 4);
  assert.match(html, /id="thumbnails-container"/);
  assert.match(html, /id="carousel-pause-btn"/);
  assert.match(html, /class="cta-btn"/);
  assert.match(html, /id="carousel-counter"[^>]*aria-live="polite"[^>]*>\s*01\s*\/\s*04\s*</);
});

test('el hero usa la fotografía como lienzo y no conserva el marco de tarjeta', async () => {
  const cinematic = await read('css/home-cinematic.css');

  assert.match(
    cinematic,
    /\.home-cinematic \.home-hero-section \.destination-card\s*\{[^}]*min-height:\s*(?:9[2-9]|100)svh/s
  );
  assert.match(
    cinematic,
    /\.home-cinematic \.home-hero-section \.destination-card\s*\{[^}]*border:\s*0[^}]*box-shadow:\s*none/s
  );
  assert.match(
    cinematic,
    /\.home-cinematic \.home-hero-section \.main-image-wrapper\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/s
  );
  assert.match(
    cinematic,
    /\.home-cinematic \.home-hero-section \.main-image-wrapper img\s*\{[^}]*object-fit:\s*cover/s
  );
  assert.match(
    cinematic,
    /\.home-cinematic \.home-hero-section \.text-column\s*\{[^}]*position:\s*absolute[^}]*bottom:/s
  );
});

test('el contador comunica el destino visible al cambiar de pestaña', async () => {
  const { elements, tabs } = await mountCarousel();
  const counter = elements.get('carousel-counter');
  assert.equal(counter.textContent, '01 / 04');

  tabs[3].dispatch('click');
  assert.equal(counter.textContent, '04 / 04');
});

test('un gesto horizontal cambia el destino sin interferir con el desplazamiento vertical', async () => {
  const { elements } = await mountCarousel();
  const carousel = elements.get('destination-carousel');
  const counter = elements.get('carousel-counter');

  carousel.dispatch('touchstart', {
    touches: [{ clientX: 300, clientY: 120 }]
  });
  carousel.dispatch('touchend', {
    changedTouches: [{ clientX: 160, clientY: 130 }]
  });

  assert.equal(counter.textContent, '02 / 04');

  carousel.dispatch('touchstart', {
    touches: [{ clientX: 160, clientY: 130 }]
  });
  carousel.dispatch('touchend', {
    changedTouches: [{ clientX: 155, clientY: 260 }]
  });

  assert.equal(counter.textContent, '02 / 04');
});

async function mountHome() {
  const source = await read('js/home.js');
  const elements = new Map([
    ['home-featured-day', createElement()],
    ['home-featured-pkg', createElement()],
    ['home-quote', createElement()],
    ['home-quote-dest', createElement()],
    ['home-quote-date', createElement()],
    ['home-quote-group', createElement()]
  ]);
  const documentListeners = new Map();
  const document = {
    addEventListener(type, handler) {
      const handlers = documentListeners.get(type) || [];
      handlers.push(handler);
      documentListeners.set(type, handlers);
    },
    getElementById: id => elements.get(id) || null
  };
  let currentLang = 'es';
  const opened = [];
  const translations = {
    es: {
      'home.featured.quote': 'Cotización personalizada',
      'tour.viewTour': 'Ver tour'
    },
    en: {
      'home.featured.quote': 'Personalized quote',
      'tour.viewTour': 'View tour'
    }
  };
  const window = {
    __TOURS_DATA: {
      tours: [
        {
          category: 'day',
          title: { es: 'Tour principal', en: 'Lead tour' },
          images: ['assets/img/slide_0.jpg'],
          duration: { es: '8 horas', en: '8 hours' },
          groupSize: { es: 'Grupo pequeño', en: 'Small group' },
          pickup: { es: 'Recojo en hotel', en: 'Hotel pickup' }
        },
        {
          category: 'day',
          title: { es: 'Tour secundario uno', en: 'Secondary tour one' },
          images: ['assets/img/slide_1.jpg'],
          duration: { es: '9 horas', en: '9 hours' },
          groupSize: { es: 'Grupo pequeño', en: 'Small group' },
          pickup: { es: 'Recojo en hotel', en: 'Hotel pickup' }
        },
        {
          category: 'day',
          title: { es: 'Tour secundario dos', en: 'Secondary tour two' },
          images: ['assets/img/slide_2.jpg'],
          duration: { es: '7 horas', en: '7 hours' },
          groupSize: { es: 'Grupo pequeño', en: 'Small group' },
          pickup: { es: 'Recojo en hotel', en: 'Hotel pickup' }
        },
        {
          category: 'package',
          title: { es: 'Paquete', en: 'Package' },
          images: ['assets/img/slide_3.jpg'],
          duration: { es: '6 días', en: '6 days' },
          groupSize: { es: 'Grupo pequeño', en: 'Small group' },
          pickup: { es: 'Recojo en hotel', en: 'Hotel pickup' }
        }
      ]
    },
    __estI18n: {
      getLang: () => currentLang,
      t: key => (translations[currentLang] && translations[currentLang][key]) || key,
      setLang(nextLang) {
        currentLang = nextLang;
      }
    },
    open(url, target) {
      opened.push({ url, target });
    }
  };

  vm.runInNewContext(source, {
    document,
    window,
    setTimeout: handler => handler(),
    encodeURIComponent
  });
  for (const handler of documentListeners.get('DOMContentLoaded') || []) handler();

  return { elements, opened, window };
}

test('la apertura editorial permanece dentro de Tours y el cotizador conserva sus tres campos', async () => {
  const html = await read('index.html');

  assert.match(html, /class="[^"]*home-tours-section[^"]*"[^>]*data-ghost="El Salvador"/);
  assert.match(html, /class="tours-editorial-intro"/);
  assert.match(html, /class="tours-editorial-portrait"[\s\S]*?<picture>[\s\S]*?city-tour-san-salvador/);
  assert.match(html, /id="home-quote-dest"/);
  assert.match(html, /id="home-quote-date"[^>]*type="date"|type="date"[^>]*id="home-quote-date"/);
  assert.match(html, /id="home-quote-group"/);
  assert.match(html, /class="fa-brands fa-whatsapp/);
});

test('el render destacado produce un único tour principal y conserva la jerarquía al cambiar idioma', async () => {
  const { elements, window } = await mountHome();
  const day = elements.get('home-featured-day');
  const pkg = elements.get('home-featured-pkg');
  const initialMarkup = day.innerHTML + pkg.innerHTML;

  assert.equal((initialMarkup.match(/tour-card--lead/g) || []).length, 1);
  assert.equal((initialMarkup.match(/tour-card--secondary/g) || []).length, 3);
  assert.match(initialMarkup, /Tour principal/);

  window.__estI18n.setLang('en');
  const translatedMarkup = day.innerHTML + pkg.innerHTML;

  assert.equal((translatedMarkup.match(/tour-card--lead/g) || []).length, 1);
  assert.match(translatedMarkup, /Lead tour/);
  assert.match(translatedMarkup, /Personalized quote/);
});

test('el cotizador sigue enviando destino, fecha, grupo e idioma a WhatsApp', async () => {
  const { elements, opened } = await mountHome();
  const form = elements.get('home-quote');
  elements.get('home-quote-dest').value = 'Tour principal';
  elements.get('home-quote-date').value = '2026-11-14';
  elements.get('home-quote-group').value = 'Grupo 4-6';

  let prevented = false;
  form.dispatch('submit', {
    preventDefault() {
      prevented = true;
    }
  });

  assert.equal(prevented, true);
  assert.equal(opened.length, 1);
  assert.equal(opened[0].target, '_blank');
  const decodedUrl = decodeURIComponent(opened[0].url);
  assert.match(decodedUrl, /^https:\/\/wa\.me\/50370000000\?text=/);
  assert.match(decodedUrl, /Tour principal/);
  assert.match(decodedUrl, /2026-11-14/);
  assert.match(decodedUrl, /Grupo 4-6/);
  assert.match(decodedUrl, /Español/);
});
