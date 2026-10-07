import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = ['index.html', 'tours.html', 'about.html', 'real-estate.html', 'payment.html', 'privacy.html', 'terms.html'];

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('las páginas públicas comparten la tipografía oficial simplificada', async () => {
  const documents = await Promise.all(pages.map(read));

  for (const [index, html] of documents.entries()) {
    assert.doesNotMatch(html, /Fira\+Sans|Fira Sans|EB\+Garamond|EB Garamond/, pages[index]);
    assert.match(html, /"body":\s*\["Work Sans",\s*"sans-serif"\]/, pages[index]);
    assert.match(html, /"display":\s*\["Fraunces",\s*"serif"\]/, pages[index]);
  }
});

test('las páginas cargan solo el subconjunto de símbolos que utiliza el sitio', async () => {
  const documents = await Promise.all(pages.map(read));
  const requiredIcons = [
    'arrow_forward',
    'arrow_outward',
    'close',
    'dark_mode',
    'light_mode',
    'menu',
    'pause',
    'play_arrow'
  ];

  for (const [index, html] of documents.entries()) {
    const match = html.match(/family=Material\+Symbols\+Outlined:[^&]+&amp;icon_names=([^&]+)/);
    assert.ok(match, pages[index]);
    const icons = decodeURIComponent(match[1]).split(',');
    for (const icon of requiredIcons) assert.ok(icons.includes(icon), `${pages[index]}: ${icon}`);
  }
});

test('la navegación se mantiene compacta sin un CTA de cotización añadido', async () => {
  const documents = await Promise.all(pages.map(read));

  for (const [index, html] of documents.entries()) {
    assert.doesNotMatch(html, /data-nav-quote|nav-quote-link|mobile-quote-link/, pages[index]);
  }
});

test('el CSS compartido define tokens, componentes y accesibilidad táctil', async () => {
  const css = await read('css/styles.css');

  for (const token of ['--font-display', '--font-body', '--font-label', '--font-brand', '--radius-control', '--touch-target']) {
    assert.match(css, new RegExp(`${token}\\s*:`), token);
  }

  assert.match(css, /body\s*\{[^}]*font-family:\s*var\(--font-body\)/s);
  assert.doesNotMatch(css, /\.nav-quote-link|\.mobile-quote-link/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('el lavado visual comparte ritmo, superficies y marcos editoriales', async () => {
  const css = await read('css/styles.css');

  for (const token of ['--section-space', '--section-space-compact', '--image-radius']) {
    assert.match(css, new RegExp(`${token}\\s*:`), token);
  }

  assert.match(css, /\.surface-cream\s*\{/);
  assert.match(css, /\.surface-wine\s*\{/);
  assert.match(css, /\.editorial-frame\s*\{/);
});

test('los componentes compartidos adoptan el acabado editorial', async () => {
  const css = await read('css/styles.css');

  assert.match(css, /nav\.fixed-nav-light\s*\{[^}]*border-bottom:\s*1px solid/s);
  assert.match(css, /\.tour-card\s*\{[^}]*border-radius:\s*var\(--image-radius\)/s);
  assert.match(css, /\.btn-accent\s*\{[^}]*box-shadow:/s);
  assert.match(css, /\.form-control\s*\{[^}]*box-shadow:/s);
});

test('los campos editables usan el componente de formulario compartido', async () => {
  const sources = await Promise.all(['index.html', 'js/tours.js'].map(read));

  for (const [index, source] of sources.entries()) {
    const controls = source.match(/<(?:input|select|textarea)\b[^>]*>/g) || [];
    // Star ratings have their own accessible radio control instead of a text-field surface.
    const editableControls = controls.filter(control => !/type="file"/.test(control) && !(/type="radio"/.test(control) && /class="[^"]*\brating-star-input\b/.test(control)));
    assert.ok(editableControls.length > 0, ['index.html', 'js/tours.js'][index]);
    for (const control of editableControls) {
      assert.match(control, /class="[^"]*\bform-control\b/, control);
    }
  }
});

test('las páginas públicas comparten navegación inmersiva y utilidades funcionales', async () => {
  const documents = await Promise.all(pages.map(read));

  for (const [index, html] of documents.entries()) {
    assert.match(html, /<body[^>]*class="[^"]*\bsite-immersive\b/, pages[index]);
    assert.match(html, /<nav class="mobile-menu" id="mobile-menu"[^>]*aria-hidden="true"/, pages[index]);
    assert.match(html, /class="menu-shell"/, pages[index]);
    assert.equal((html.match(/data-menu-link/g) || []).length, 5, pages[index]);
    assert.match(html, /data-help-open/, pages[index]);
    assert.match(html, /data-help-modal/, pages[index]);
    assert.match(html, /id="theme-toggle"/, pages[index]);
    assert.equal((html.match(/data-lang="(?:es|en|pt)"/g) || []).length, 3, pages[index]);
    assert.match(html, /<script src="js\/site\.js"><\/script>/, pages[index]);
  }
});

test('solo las páginas con hero fotográfico usan navegación superpuesta', async () => {
  const documents = await Promise.all(pages.map(read));
  const named = Object.fromEntries(pages.map((name, index) => [name, documents[index]]));

  for (const name of ['index.html', 'tours.html', 'about.html']) {
    assert.match(named[name], /<body[^>]*class="[^"]*\bhas-photo-hero\b/, name);
  }
  for (const name of ['real-estate.html', 'payment.html', 'privacy.html', 'terms.html']) {
    assert.doesNotMatch(named[name], /\bhas-photo-hero\b/, name);
    assert.match(named[name], /<body[^>]*class="[^"]*\bpage-solid-header\b/, name);
  }
});

test('Tours abre con fotografía editorial y conserva categorías, datos y detalle', async () => {
  const html = await read('tours.html');

  assert.match(html, /<section class="secondary-photo-hero tours-photo-hero"/);
  assert.match(html, /<picture class="secondary-hero-media">[\s\S]*type="image\/avif"[\s\S]*type="image\/webp"/);
  assert.equal((html.match(/data-category="(?:day|package)"/g) || []).length, 2);
  assert.match(html, /id="tour-list-container"/);
  assert.match(html, /id="tour-detail-container"/);
  assert.match(html, /<script src="data\/tours-data\.js"><\/script>/);
  assert.match(html, /<script src="js\/tours\.js"><\/script>/);
});

test('About conserva el sendero narrativo dentro de una entrada fotográfica', async () => {
  const html = await read('about.html');

  assert.match(html, /<section class="hero secondary-photo-hero about-photo-hero"/);
  assert.match(html, /<picture class="secondary-hero-media">/);
  assert.match(html, /id="fundador"/);
  assert.equal((html.match(/class="stop stop--weave/g) || []).length, 3);
  assert.match(html, /<ol class="trail">/);
});

test('Bienes Raíces permanece como una promesa editorial sin publicar socios provisionales', async () => {
  const html = await read('real-estate.html');

  assert.match(html, /class="editorial-coming-soon"/);
  assert.match(html, /data-i18n="realestate\.empty">Próximamente</);
  assert.doesNotMatch(html, /id="partners-grid"/);
  assert.doesNotMatch(html, /data\/real-estate-data\.js|js\/real-estate\.js/);
});

test('Pago en Línea permanece como una promesa editorial sin pasarela inventada', async () => {
  const html = await read('payment.html');

  assert.match(html, /class="editorial-coming-soon"/);
  assert.match(html, /data-i18n="payment\.empty">Próximamente</);
  assert.doesNotMatch(html, /stripe|paypal|wompi/i);
});

test('la Home conserva el mural de Feedback con envío moderado', async () => {
  const html = await read('index.html');
  const quoteIndex = html.indexOf('id="home-quote"');
  const feedbackIndex = html.indexOf('id="feedback"');
  const toursIndex = html.indexOf('id="home-featured-day"');
  const categoriesIndex = html.indexOf('home-categories-chapter');
  const storiesIndex = html.indexOf('home-stories-chapter');

  assert.match(html, /id="feedback"/);
  assert.match(html, /id="testimonials-track"/);
  assert.match(html, /id="open-feedback-btn"/);
  assert.match(html, /id="feedback-modal"/);
  assert.match(html, /<script src="js\/testimonials\.js"><\/script>/);
  assert.ok(quoteIndex > -1 && feedbackIndex > quoteIndex, 'el mural debe ir después del cotizador');
  assert.ok(toursIndex > quoteIndex && categoriesIndex > toursIndex, 'los tours y categorías deben preceder a las reseñas');
  assert.ok(feedbackIndex > categoriesIndex && feedbackIndex < storiesIndex, 'el mural debe ir después de las categorías y antes de las historias');
  const navLinks = html.match(/<ul class="nav-links-list">[\s\S]*?<\/ul>/);
  assert.ok(navLinks);
  assert.doesNotMatch(navLinks[0], /feedback/i);
});

test('el pie legal comparte privacidad, términos y contacto sin WhatsApp en footer-links', async () => {
  const documents = await Promise.all(pages.map(read));

  for (const [index, html] of documents.entries()) {
    const block = html.match(/<div class="footer-links[\s\S]*?<\/div>/);
    assert.ok(block, pages[index]);
    assert.match(block[0], /footer\.privacy/, pages[index]);
    assert.match(block[0], /footer\.terms/, pages[index]);
    assert.match(block[0], /footer\.contact/, pages[index]);
    assert.doesNotMatch(block[0], /wa\.me|WhatsApp/, pages[index]);
  }
});

test('el menú y el encabezado fotográfico viven en estilos compartidos, no en reglas de Home', async () => {
  const [shared, home] = await Promise.all([read('css/styles.css'), read('css/home-cinematic.css')]);

  assert.match(shared, /\.site-immersive \.mobile-menu\s*\{/);
  assert.match(shared, /\.has-photo-hero nav\.fixed-nav-light\s*\{/);
  assert.match(shared, /\.secondary-photo-hero\s*\{/);
  assert.doesNotMatch(home, /\.home-cinematic \.mobile-menu\s*\{/);
});
