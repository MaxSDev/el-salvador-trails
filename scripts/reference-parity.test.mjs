import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

async function readOptional(path) {
  try {
    return await read(path);
  } catch (error) {
    if (error && error.code === 'ENOENT') return '';
    throw error;
  }
}

test('la Home carga una capa cinematográfica aislada después del carrusel', async () => {
  const [html, cinematic] = await Promise.all([
    read('index.html'),
    readOptional('css/home-cinematic.css')
  ]);
  const carouselIndex = html.indexOf('href="css/carrousel.css"');
  const cinematicIndex = html.indexOf('href="css/home-cinematic.css"');

  assert.match(html, /<body class="[^"]*\bhome-cinematic\b/);
  assert.ok(carouselIndex >= 0, 'la hoja base del carrusel debe seguir cargada');
  assert.ok(cinematicIndex > carouselIndex, 'la capa cinematográfica debe cargar después del carrusel');
  assert.match(cinematic, /\.home-cinematic\s*\{/);
});

test('la capa facelift rechazada no permanece en los archivos compartidos', async () => {
  const [html, shared, carousel] = await Promise.all([
    read('index.html'),
    read('css/styles.css'),
    read('css/carrousel.css')
  ]);

  assert.doesNotMatch(html, /\bfacelift-/);
  assert.doesNotMatch(shared, /FACELIFT HOME|\.facelift-/);
  assert.doesNotMatch(carousel, /FACELIFT HOME|\.facelift-/);
});

test('el menú inmersivo conserva los cinco destinos del sitio como un índice accesible', async () => {
  const html = await read('index.html');
  const menuLinks = html.match(/data-menu-link/g) || [];

  assert.match(html, /<nav class="mobile-menu" id="mobile-menu"[^>]*aria-hidden="true"/);
  assert.match(html, /class="menu-shell"/);
  assert.match(html, /class="menu-footer"/);
  assert.equal(menuLinks.length, 5);
  assert.doesNotMatch(html, /data-menu-link[\s\S]*#feedback|#feedback" data-menu-link/);
});

test('el sistema compartido define los estados transparente, sólido e inmersivo', async () => {
  const shared = await read('css/styles.css');

  assert.match(shared, /\.has-photo-hero nav\.fixed-nav-light\s*\{[^}]*background:\s*transparent/s);
  assert.match(shared, /\.has-photo-hero nav\.fixed-nav-light\.is-scrolled\s*\{/);
  assert.match(shared, /\.site-immersive \.mobile-menu\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(shared, /\.site-immersive \.mobile-menu\.open\s*\{/);
  assert.match(shared, /\.site-immersive\.is-menu-open\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(shared, /\.site-immersive\.is-menu-open \.wa-float\s*\{[^}]*pointer-events:\s*none/s);
});

test('las categorías forman un mosaico con dos escalas sin perder ninguno de sus enlaces', async () => {
  const html = await read('index.html');
  const categoryCards = html.match(/class="cat-card cat-card--(?:wide|compact)"/g) || [];
  const wideCards = html.match(/class="cat-card cat-card--wide"/g) || [];
  const compactCards = html.match(/class="cat-card cat-card--compact"/g) || [];

  assert.match(html, /class="category-mosaic home-reveal"/);
  assert.equal(categoryCards.length, 4);
  assert.equal(wideCards.length, 2);
  assert.equal(compactCards.length, 2);
});

test('la mitad inferior alterna capítulos amplios y siluetas editoriales', async () => {
  const html = await read('index.html');
  const photoChapters = html.match(/data-photo-chapter="[^"]+"/g) || [];
  const layouts = [...html.matchAll(/data-home-layout="([^"]+)"/g)].map(match => match[1]);

  assert.ok(photoChapters.length >= 3, 'deben existir al menos tres capítulos fotográficos amplios');
  assert.ok(layouts.length >= 6, 'las secciones principales deben declarar su silueta');

  let repeated = 1;
  let longestRun = 1;
  for (let index = 1; index < layouts.length; index += 1) {
    repeated = layouts[index] === layouts[index - 1] ? repeated + 1 : 1;
    longestRun = Math.max(longestRun, repeated);
  }
  assert.ok(longestRun <= 2, 'no deben repetirse más de dos siluetas consecutivas');
});

test('planificación y pasos se expresan como índices semánticos, no como otra cuadrícula de tarjetas', async () => {
  const html = await read('index.html');
  const planningItems = html.match(/class="planning-item"/g) || [];
  const stepItems = html.match(/class="step-card home-reveal"/g) || [];

  assert.match(html, /<ol class="planning-index"/);
  assert.equal(planningItems.length, 4);
  assert.match(html, /<ol class="steps-path"/);
  assert.equal(stepItems.length, 3);
});

test('el cierre conserva contenido real y adopta capítulos diferenciados', async () => {
  const html = await read('index.html');
  const faqItems = html.match(/<details class="faq-item/g) || [];
  const socialLinks = html.match(/class="social-connect-icon"/g) || [];

  assert.match(html, /class="guide-preview[^"]*home-reveal"/);
  assert.match(html, /href="about\.html"/);
  assert.equal(faqItems.length, 5);
  assert.match(html, /class="final-cta-media"/);
  assert.equal(socialLinks.length, 5);
});

test('los revelados y el menú quedan utilizables con movimiento reducido', async () => {
  const [cinematic, shared] = await Promise.all([
    read('css/home-cinematic.css'),
    read('css/styles.css')
  ]);

  assert.match(cinematic, /@keyframes home-reveal[\s\S]*opacity:\s*0[\s\S]*transform:\s*translateY/);
  assert.match(cinematic, /animation-timeline:\s*view\(\)/);
  assert.match(cinematic, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.home-reveal[\s\S]*animation:\s*none\s*!important/);
  assert.match(
    shared,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?transition-delay:\s*0s\s*!important/
  );
  assert.match(
    shared,
    /\.site-immersive \.mobile-menu\.open a\s*\{[^}]*visibility:\s*visible\s*!important/s
  );
});
