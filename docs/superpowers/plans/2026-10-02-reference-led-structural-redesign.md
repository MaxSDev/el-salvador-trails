# Reference-led Structural Redesign Implementation Plan

> **Plan reemplazado:** no ejecutar este documento. El plan vigente es `docs/superpowers/plans/2026-10-02-visual-facelift-reference-videos.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar El Salvador Trails como una experiencia editorial e inmersiva inspirada en la estructura de turismo.gov.st, conservando la identidad, funciones, datos y accesibilidad propias.

**Architecture:** El sitio seguirá siendo HTML estático con CSS compartido y JavaScript vanilla. El rediseño se construirá por capas: primero la shell y la Home, luego catálogo/detalle y finalmente páginas secundarias; cada capa conservará el DOM legible sin animación y añadirá comportamiento progresivo con JavaScript.

**Tech Stack:** HTML5, CSS custom properties, Tailwind CDN existente durante el prototipo, JavaScript vanilla, Node Test, Sharp y el manifiesto responsive existente.

**Spec:** `docs/REFERENCE_STRUCTURE_SPEC_2026-10-02.md`

## Global Constraints

- Conservar crema, vino, dorado, café, modo oscuro, Fraunces, Work Sans, Cinzel y Adlerly Pro.
- No copiar texto, fotografías, marca, código ni dimensiones exactas de `turismo.gov.st`.
- No sobrescribir ni eliminar imágenes originales.
- No publicar teléfonos, reseñas, cifras ni contactos provisionales como reales.
- Mantener ES/EN/PT y no incorporar una clave visible sin sus tres traducciones.
- Mantener teclado, foco visible, zoom 200 %, objetivos táctiles de 44 px y `prefers-reduced-motion`.
- Mantener un máximo de una acción primaria por capítulo.
- No añadir GSAP, Swiper, React ni otra dependencia para el rediseño.
- No hacer commit, push, despliegue ni cambio externo sin autorización explícita del usuario.
- Terminar, probar y documentar cada tarea antes de solicitar aprobación o iniciar la siguiente.

---

## File map

- `index.html`: orden editorial y semántica de la Home.
- `tours.html`: entrada, filtros y contenedor del catálogo editorial.
- `about.html`: adaptación del sendero narrativo a la nueva shell.
- `real-estate.html`: adaptación editorial de la página “Próximamente”.
- `css/styles.css`: tokens, shell, menú, capítulos, responsive y estados compartidos.
- `css/carrousel.css`: hero cinematográfico y controles del carrusel.
- `js/site.js`: cabecera al hacer scroll, menú de pantalla completa, foco y bloqueo de scroll.
- `js/script.js`: carrusel del hero; se conserva su contrato de pausa y movimiento reducido.
- `js/home.js`: tours destacados, cotización y explorador de experiencias.
- `js/tours.js`: catálogo directo, filtros, URL profunda y detalle.
- `js/i18n.js`: todos los textos nuevos en ES/EN/PT.
- `data/site-config.js`: estado explícito de contactos y placeholders.
- `data/tours.json` y `data/tours-data.js`: metadatos de dificultad, idiomas, video e imagen cuando falten.
- `scripts/reference-shell.test.mjs`: regresiones de shell, identidad y menú.
- `scripts/home-editorial.test.mjs`: estructura y seguridad de la Home.
- `scripts/tours-editorial.test.mjs`: filtros, URL y detalle del catálogo.
- `scripts/secondary-editorial.test.mjs`: consistencia de páginas secundarias.
- `docs/IMAGE_SOURCES.md`: procedencia de cualquier activo externo que sea aprobado.
- `docs/IMPLEMENTATION_PROGRESS.md`: checkpoint después de cada tarea.

### Task 1: Guardrails, contactos y contrato de pruebas

**Files:**
- Create: `data/site-config.js`
- Create: `scripts/reference-shell.test.mjs`
- Modify: `index.html`
- Modify: `tours.html`
- Modify: `about.html`
- Modify: `real-estate.html`
- Modify: `js/home.js`
- Modify: `js/tours.js`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/reference-shell.test.mjs`

**Interfaces:**
- Produces: `window.EST_SITE_CONFIG` con `contacts`, `social` y `placeholders`.
- Consumes: los scripts actuales de cotización y los enlaces sociales existentes.

- [ ] **Step 1: Write the failing configuration tests**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('los datos provisionales tienen un estado explícito', async () => {
  const source = await read('data/site-config.js');
  assert.match(source, /window\.EST_SITE_CONFIG/);
  assert.match(source, /contactsArePlaceholder:\s*true|contactsArePlaceholder:\s*false/);
  assert.doesNotMatch(source, /50370000000/);
});

test('todas las páginas cargan la configuración antes de sus scripts funcionales', async () => {
  for (const page of ['index.html', 'tours.html', 'about.html', 'real-estate.html']) {
    const html = await read(page);
    assert.ok(html.indexOf('data/site-config.js') < html.indexOf('js/site.js'), page);
  }
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `node --test scripts/reference-shell.test.mjs`  
Expected: FAIL because `data/site-config.js` does not exist.

- [ ] **Step 3: Add the configuration contract**

```js
window.EST_SITE_CONFIG = Object.freeze({
  contacts: Object.freeze({ whatsapp: '', email: '' }),
  social: Object.freeze({
    facebook: '',
    instagram: 'https://www.instagram.com/elsalvadortrails',
    youtube: '',
    tiktok: 'https://www.tiktok.com/@elsalvadortrails'
  }),
  placeholders: Object.freeze({
    contactsArePlaceholder: true,
    videosArePlaceholder: true
  })
});
```

Load the file before `js/site.js`, `js/home.js` or `js/tours.js` on every page. Replace hardcoded `50370000000` usage with a guard that prevents navigation and exposes `aria-disabled="true"` while `contactsArePlaceholder` is true.

- [ ] **Step 4: Run baseline tests**

Run: `npm test`  
Expected: all existing tests plus the two new tests PASS.

- [ ] **Step 5: Record the checkpoint**

Update `docs/IMPLEMENTATION_PROGRESS.md` with the configuration contract, files changed, test command and the exact next task. Do not commit.

### Task 2: Shared cinematic header and full-screen menu

**Files:**
- Modify: `index.html`
- Modify: `tours.html`
- Modify: `about.html`
- Modify: `real-estate.html`
- Modify: `css/styles.css`
- Modify: `js/site.js`
- Modify: `js/i18n.js`
- Modify: `scripts/reference-shell.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/reference-shell.test.mjs`

**Interfaces:**
- Consumes: existing `[data-menu-toggle]`, theme toggle, language buttons and help modal.
- Produces: `[data-site-header]`, `#site-menu`, `[data-menu-close]` and the `is-menu-open` body state.

- [ ] **Step 1: Add failing shell tests**

```js
test('la shell compartida expone cabecera y menú editorial accesible', async () => {
  for (const page of ['index.html', 'tours.html', 'about.html', 'real-estate.html']) {
    const html = await read(page);
    assert.match(html, /data-site-header/);
    assert.match(html, /id="site-menu"/);
    assert.match(html, /aria-controls="site-menu"/);
    assert.match(html, /data-menu-close/);
  }
});

test('el menú bloquea scroll y devuelve el foco', async () => {
  const source = await read('js/site.js');
  assert.match(source, /document\.body\.classList\.toggle\('is-menu-open'/);
  assert.match(source, /toggle\.focus\(\)/);
  assert.match(source, /event\.key === 'Escape'/);
});
```

- [ ] **Step 2: Run the shell tests**

Run: `node --test scripts/reference-shell.test.mjs`  
Expected: FAIL on missing `data-site-header`, `site-menu` and body lock.

- [ ] **Step 3: Replace the mobile drawer with the shared overlay structure**

Use this DOM contract on all four pages, preserving the current links and controls:

```html
<nav class="site-header" data-site-header aria-label="Principal">
  <!-- existing brand, desktop links, help, theme, language and menu trigger -->
</nav>
<div class="site-menu" id="site-menu" aria-hidden="true">
  <button type="button" data-menu-close data-i18n-aria="nav.closeMenu">
    <span class="material-symbols-outlined" aria-hidden="true">close</span>
  </button>
  <nav class="site-menu__primary" aria-label="Mapa del sitio">
    <a href="index.html" data-i18n="nav.home">Página Inicial</a>
    <a href="tours.html" data-i18n="nav.tours">Catálogo de Tours</a>
    <a href="about.html" data-i18n="nav.about">About Us</a>
    <a href="real-estate.html" data-i18n="nav.realestate">Bienes Raíces</a>
  </nav>
</div>
```

- [ ] **Step 4: Implement deterministic overlay states**

```js
function setMenuState(open, restoreFocus) {
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.classList.toggle('is-menu-open', open);
  if (!open && restoreFocus) toggle.focus();
}
```

Trap focus only while the overlay is open; close on Escape, close button and primary link. Keep the tutorial modal behavior separate.

- [ ] **Step 5: Add the visual states**

```css
.site-header { position: fixed; inset: 0 0 auto; z-index: 60; }
.site-header.is-scrolled { background: var(--nav-bg); border-bottom: 1px solid var(--nav-border); }
.site-menu { position: fixed; inset: 0; z-index: 80; background: var(--brand); color: #fff; visibility: hidden; opacity: 0; }
.site-menu.open { visibility: visible; opacity: 1; }
body.is-menu-open { overflow: hidden; }
.site-menu__primary a { min-height: var(--touch-target); }
.dark .site-menu { background: var(--surface); color: var(--text); }
```

Use explicit z-index tokens so the menu, help modal and WhatsApp control never compete.

- [ ] **Step 6: Verify shared behavior**

Run: `npm test`  
Manual: open/close with mouse, keyboard, Escape and a menu link at 390 and 1440 px.  
Expected: no focus escape, no background scroll, and focus returns to the trigger.

- [ ] **Step 7: Record and request shell approval**

Update progress with screenshots and test results. Pause for approval before reshaping the Home.

### Task 3: Transform the existing carousel into the cinematic hero

**Files:**
- Modify: `index.html`
- Modify: `css/carrousel.css`
- Modify: `css/styles.css`
- Modify: `js/script.js`
- Create: `scripts/home-editorial.test.mjs`
- Modify: `js/i18n.js`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/home-editorial.test.mjs`

**Interfaces:**
- Consumes: `#destination-carousel`, `[data-carousel-tab]`, `#carousel-pause-btn` and responsive `<picture>` markup.
- Produces: `.editorial-hero`, `.editorial-hero__content`, `.editorial-hero__index` and `.editorial-hero__media`.

- [ ] **Step 1: Write the failing hero contract**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('el hero conserva carrusel, pausa y medios responsive', async () => {
  const html = await read('index.html');
  assert.match(html, /class="[^"]*editorial-hero/);
  assert.equal((html.match(/data-carousel-tab=/g) || []).length, 4);
  assert.match(html, /id="carousel-pause-btn"/);
  assert.match(html, /<picture>/);
  assert.match(html, /fetchpriority="high"/);
});

test('el hero no depende de movimiento para ser legible', async () => {
  const css = await read('css/carrousel.css');
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(css, /scroll-snap-type:\s*y\s+mandatory/);
});
```

- [ ] **Step 2: Verify the test fails on `.editorial-hero`**

Run: `node --test scripts/home-editorial.test.mjs`  
Expected: FAIL because the new hero contract is absent.

- [ ] **Step 3: Recompose, do not replace, the carousel markup**

Make the existing destination image the full hero media. Place title, destination description, catalog CTA, tabs and pause control above it in DOM order. Keep all IDs consumed by `js/script.js` unchanged.

```html
<section class="editorial-hero" aria-labelledby="hero-title">
  <div class="editorial-hero__media" aria-hidden="true"><!-- existing responsive media --></div>
  <div class="editorial-hero__scrim"></div>
  <div class="editorial-hero__content">
    <h1 id="hero-title" data-i18n="hero.title">Cuatro formas de descubrir El Salvador</h1>
    <div class="slide-details"><h2 id="slide-title"></h2><p id="slide-desc"></p></div>
    <a class="btn-accent" href="tours.html" data-i18n="hero.cta">Explora el catálogo</a>
  </div>
  <div class="editorial-hero__index"><!-- existing tabs + pause --></div>
</section>
```

- [ ] **Step 4: Implement the full-bleed visual rules**

```css
.editorial-hero { min-height: clamp(680px, 92svh, 980px); position: relative; display: grid; align-items: end; overflow: clip; color: #fff; }
.editorial-hero__media, .editorial-hero__scrim { position: absolute; inset: 0; }
.editorial-hero__scrim { background: linear-gradient(90deg, rgba(28,23,20,.82), rgba(28,23,20,.22) 62%, rgba(28,23,20,.48)); }
.editorial-hero__content { position: relative; z-index: 2; width: min(1200px, calc(100% - 48px)); margin: 0 auto; padding-block: 9rem 8rem; }
.editorial-hero__content h1 { max-inline-size: 16ch; text-wrap: balance; }
```

Add a mobile scrim that darkens the lower half rather than the full image. Preserve current pause logic and all reduced-motion branches in `js/script.js`.

- [ ] **Step 5: Verify hero behavior**

Run: `npm test` and `npm run media:check`.  
Manual: pause for 5 seconds; tab through all destinations; emulate reduced motion.  
Expected: image stays stable when paused, each tab updates content, and the hero has no horizontal overflow.

- [ ] **Step 6: Record the checkpoint**

Update progress with hero weight and screenshots at 390 and 1440 px.

### Task 4: Quote overlap, editorial introduction and main video window

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `js/home.js`
- Modify: `js/i18n.js`
- Modify: `scripts/home-editorial.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/home-editorial.test.mjs`

**Interfaces:**
- Consumes: `#home-quote`, its existing destination/date/group controls and `data-video-placeholder="main"`.
- Produces: `.journey-intro` and `.journey-intro__video`.

- [ ] **Step 1: Add failing order and placeholder tests**

```js
test('la cotización conduce a una introducción con video honesto', async () => {
  const html = await read('index.html');
  const quote = html.indexOf('id="home-quote"');
  const intro = html.indexOf('class="journey-intro');
  const video = html.indexOf('data-video-placeholder="main"');
  assert.ok(quote > -1 && intro > quote && video > intro);
  assert.doesNotMatch(html, /<video\b|\bautoplay\b/i);
});
```

- [ ] **Step 2: Run the targeted test**

Run: `node --test scripts/home-editorial.test.mjs`  
Expected: FAIL because `.journey-intro` is absent.

- [ ] **Step 3: Reorder existing content into a two-column chapter**

Use the existing quote form immediately after the hero, visually overlapping by at most 56 px on desktop and never overlapping on mobile. Follow it with this contract:

```html
<section class="journey-intro" aria-labelledby="journey-intro-title">
  <div class="journey-intro__copy">
    <p class="section-kicker" data-i18n="home.video.eyebrow">El Salvador en movimiento</p>
    <h2 id="journey-intro-title" class="section-title" data-i18n="home.video.title">Un país que se entiende caminándolo</h2>
    <p class="section-copy" data-i18n="home.video.text"></p>
  </div>
  <div class="journey-intro__video video-placeholder video-placeholder--main" data-video-placeholder="main" role="img" data-i18n-aria="home.video.placeholderAria">
    <span data-i18n="home.video.soon">Video próximamente</span>
    <span aria-hidden="true">16:9</span>
  </div>
</section>
```

- [ ] **Step 4: Preserve quote functionality safely**

Keep destination population and translation re-rendering. If `EST_SITE_CONFIG.placeholders.contactsArePlaceholder` is true, show the localized unavailable state and do not call `window.open`; otherwise construct the WhatsApp URL from `EST_SITE_CONFIG.contacts.whatsapp`.

- [ ] **Step 5: Verify form and layout**

Run: `npm test` and `npm run media:check`.  
Manual: submit with placeholder contacts, switch all three languages, and test at 360/390 px.  
Expected: no navigation to a demo number; labels remain visible and the video block stays inert.

- [ ] **Step 6: Record the checkpoint**

Update progress and pause if the quote or hero requires user adjustment.

### Task 5: Immersive experience explorer and editorial tours

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `js/home.js`
- Modify: `js/i18n.js`
- Modify: `scripts/home-editorial.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/home-editorial.test.mjs`

**Interfaces:**
- Produces: `[data-experience-tab]`, `[data-experience-panel]`, `setupExperienceExplorer()` and `.featured-tours-editorial`.
- Consumes: existing local images and `window.__TOURS_DATA.tours`.

- [ ] **Step 1: Add failing explorer tests**

```js
test('el explorador tiene cuatro tabs y cuatro paneles accesibles', async () => {
  const html = await read('index.html');
  assert.equal((html.match(/data-experience-tab/g) || []).length, 4);
  assert.equal((html.match(/data-experience-panel/g) || []).length, 4);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-selected="true"/);
});

test('los tours destacados siguen libres de datos demo', async () => {
  const html = await read('index.html');
  const js = await read('js/home.js');
  assert.match(html, /featured-tours-editorial/);
  assert.doesNotMatch(html + js, /ratingCount|TripAdvisor|#1|20\+/i);
});
```

- [ ] **Step 2: Verify failure**

Run: `node --test scripts/home-editorial.test.mjs`  
Expected: FAIL on missing tabs, panels and featured layout class.

- [ ] **Step 3: Replace the category grid with real tab semantics**

Create four buttons —Playa, Volcanes, Cultura y Café— and four DOM-resident panels. Each panel contains localized copy, one responsive `<picture>` using local assets and a link to the catalog. Only inactive panels receive `hidden`; no content is generated solely from CSS.

Add these exact labels to the three dictionaries: `home.experiences.title` = “Cuatro paisajes, una forma personal de recorrerlos” / “Four landscapes, your own way to explore them” / “Quatro paisagens, uma forma pessoal de percorrê-las”; `home.experiences.beach` = “Playa” / “Coast” / “Praia”; `home.experiences.volcano` = “Volcanes” / “Volcanoes” / “Vulcões”; `home.experiences.culture` = “Cultura” / “Culture” / “Cultura”; `home.experiences.coffee` = “Café” / “Coffee” / “Café”.

- [ ] **Step 4: Implement keyboard behavior**

```js
function setupExperienceExplorer() {
  var tabs = Array.from(document.querySelectorAll('[data-experience-tab]'));
  var panels = Array.from(document.querySelectorAll('[data-experience-panel]'));
  function activate(index, focus) {
    tabs.forEach(function (tab, i) {
      var active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { activate(index, false); });
    tab.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        var offset = event.key === 'ArrowRight' ? 1 : -1;
        activate((index + offset + tabs.length) % tabs.length, true);
      }
    });
  });
}
```

- [ ] **Step 5: Recompose featured tours**

Render the first two tours with `.tour-card--landscape` and the following two with `.tour-card--portrait` on desktop. At widths below 768 px, use one horizontal snap rail with explicit previous/next buttons and normal document reading order. Keep title, duration, group, pickup and “Cotización personalizada”.

- [ ] **Step 6: Verify media and keyboard behavior**

Run: `npm test` and `npm run media:check`.  
Manual: ArrowLeft/ArrowRight across tabs; tab through tour rail; verify dark mode.  
Expected: state is announced, no hover-only content, and image dimensions remain reserved.

- [ ] **Step 7: Record and request Home midpoint approval**

Update progress with the exact local images used for each experience. Do not start the closing chapters until approval.

### Task 6: Stories, planning, Mario, practical links and footer rhythm

**Files:**
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `js/i18n.js`
- Modify: `scripts/home-editorial.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/home-editorial.test.mjs`

**Interfaces:**
- Consumes: three existing story placeholders, trust items, three steps, Mario preview, FAQ and footer.
- Produces: `.story-rail`, `.planning-chapter`, `.guide-chapter` and `.practical-links`.

- [ ] **Step 1: Add failing closing-chapter tests**

```js
test('la Home conserva tres historias y combina planificación sin duplicarla', async () => {
  const html = await read('index.html');
  assert.equal((html.match(/data-video-placeholder="story"/g) || []).length, 3);
  assert.equal((html.match(/class="[^"]*planning-chapter/g) || []).length, 1);
  assert.equal((html.match(/class="[^"]*guide-chapter/g) || []).length, 1);
  assert.equal((html.match(/class="[^"]*practical-link/g) || []).length, 2);
});
```

- [ ] **Step 2: Run the targeted test**

Run: `node --test scripts/home-editorial.test.mjs`  
Expected: FAIL because the new chapter classes are missing.

- [ ] **Step 3: Merge trust and process into one chapter**

Place the four trust signals as a compact definition list next to the existing three numbered steps. Keep the step numbers because the content is genuinely sequential. Remove the old separate plan-card grid after confirming every sentence appears in the combined chapter.

- [ ] **Step 4: Recompose Mario and the closing information**

Use a split editorial layout with the existing monogram until a real portrait is provided. Add two honest links: “Cuándo visitar El Salvador” points to the FAQ anchor and “Qué llevar a tu recorrido” points to a new FAQ item; do not create empty pages.

- [ ] **Step 5: Preserve inert story placeholders**

Keep `role="img"`, format labels and “Video próximamente”. The cards may use local poster imagery only as decorative backgrounds with a dark scrim; they must not show a play icon.

- [ ] **Step 6: Verify the complete Home**

Run: `npm test`, `npm run media:check`, `node --check js/*.js`, and `git -c safe.directory="$PWD" diff --check`.  
Manual: 360, 390, 768, 1024, 1440; zoom 200 %; light/dark; reduced motion.  
Expected: no horizontal overflow, no obscured focus, no demo claims, Home below 2.5 MB before video.

- [ ] **Step 7: Record and request full Home approval**

Update progress and wait for explicit approval before changing the catalog.

### Task 7: Direct editorial catalog and deep-linked tour detail

**Files:**
- Modify: `tours.html`
- Modify: `css/styles.css`
- Modify: `js/tours.js`
- Modify: `js/i18n.js`
- Modify: `data/tours.json`
- Modify: `data/tours-data.js`
- Create: `scripts/tours-editorial.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/tours-editorial.test.mjs`

**Interfaces:**
- Produces: `applyTourFilters(filters)`, `openTourBySlug(slug)`, `syncTourUrl(slug)` and `?tour=<slug>`.
- Consumes: `tour.slug`, `category`, localized duration/group/pickup and responsive media helper.

- [ ] **Step 1: Write failing catalog tests**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('el catálogo muestra filtros y tours sin pantalla intermedia', async () => {
  const html = await read('tours.html');
  assert.match(html, /data-tour-filters/);
  assert.match(html, /id="tour-list-container"/);
  assert.doesNotMatch(html, /id="categories-grid"/);
});

test('el detalle consume y actualiza el slug de la URL', async () => {
  const source = await read('js/tours.js');
  assert.match(source, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(source, /params\.get\('tour'\)/);
  assert.match(source, /history\.(pushState|replaceState)/);
  assert.match(source, /popstate/);
});
```

- [ ] **Step 2: Run the tests**

Run: `node --test scripts/tours-editorial.test.mjs`  
Expected: FAIL because categories are still the entry screen and URL state is absent.

- [ ] **Step 3: Render filters and all tours on initial load**

Use native buttons for `Todos`, `Day tours` and `Paquetes`; add difficulty only when real data exists. `applyTourFilters({ category })` returns a new array and does not mutate `toursData.tours`.

```js
function applyTourFilters(filters) {
  return toursData.tours.filter(function (tour) {
    return !filters.category || filters.category === 'all' || tour.category === filters.category;
  });
}
```

- [ ] **Step 4: Add deep-link synchronization**

```js
function openTourBySlug(slug, push) {
  var tour = toursData.tours.find(function (item) { return item.slug === slug; });
  if (!tour) return false;
  showTourDetail(tour.id);
  if (push) syncTourUrl(slug);
  return true;
}

function syncTourUrl(slug) {
  var url = new URL(window.location.href);
  if (slug) url.searchParams.set('tour', slug);
  else url.searchParams.delete('tour');
  history.pushState({ tour: slug || null }, '', url);
}
```

Read `tour` during `init()`, listen to `popstate`, and remove the parameter when the detail closes. An unknown slug returns to the catalog and shows a localized non-blocking message.

- [ ] **Step 5: Recompose the detail**

Keep the accessible dialog/focus trap, gallery and quote fields. Order content as hero image, title + facts, story, highlights, itinerary, included items, video placeholder and persistent quote CTA. On mobile the CTA stays above safe-area padding and never covers the close control.

- [ ] **Step 6: Update Home tour links**

Change `js/home.js` card links to `tours.html?tour=` + `encodeURIComponent(tour.slug)`. Add a test that every rendered tour object has a non-empty slug.

- [ ] **Step 7: Verify catalog behavior**

Run: `npm test` and `npm run media:check`.  
Manual: open a card, reload its URL, use browser Back/Forward, change language inside detail, test Escape and focus return.  
Expected: URL is shareable, no broken history state, quote controls remain usable.

- [ ] **Step 8: Record and request catalog approval**

Update progress and pause before pages secundarias.

### Task 8: Adapt About Us and Bienes raíces to the editorial shell

**Files:**
- Modify: `about.html`
- Modify: `real-estate.html`
- Modify: `css/styles.css`
- Modify: `js/i18n.js`
- Create: `scripts/secondary-editorial.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/secondary-editorial.test.mjs`

**Interfaces:**
- Consumes: About trail stops, shared shell, theme and i18n.
- Produces: `.about-editorial-hero`, `.about-trail-chapter` and `.coming-soon-editorial`.

- [ ] **Step 1: Write failing secondary-page tests**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('About conserva el sendero y adopta capítulos editoriales', async () => {
  const html = await read('about.html');
  assert.match(html, /about-editorial-hero/);
  assert.equal((html.match(/about-trail-chapter/g) || []).length, 3);
  assert.match(html, /data-video-placeholder="guide"/);
});

test('Bienes raíces no simula propiedades disponibles', async () => {
  const html = await read('real-estate.html');
  assert.match(html, /coming-soon-editorial/);
  assert.doesNotMatch(html, /property-card|precio|reservar propiedad/i);
});
```

- [ ] **Step 2: Verify failure**

Run: `node --test scripts/secondary-editorial.test.mjs`  
Expected: FAIL on the new structural classes.

- [ ] **Step 3: Adapt About without rewriting its story**

Keep founder, visión, misión and compromiso. Replace repeated card frames with three alternating image/text chapters. Add one honest 16:9 Mario placeholder and keep the current monogram or absent-photo fallback.

- [ ] **Step 4: Simplify Bienes raíces**

Use one image-led hero, a concise explanation that the service is coming later, and a link back to tours. Do not render filters, empty cards, prices or a fake waitlist.

- [ ] **Step 5: Verify secondary pages**

Run: `npm test`, `npm run media:check`, and `node --check js/*.js`.  
Manual: each page at 390/768/1440, light/dark, keyboard and zoom 200 %.  
Expected: shell matches Home/Tours and content remains truthful.

- [ ] **Step 6: Record and request page-by-page approval**

Update progress with one checkpoint for About and another for Bienes raíces.

### Task 9: Image provenance, complete QA and handoff

**Files:**
- Create: `docs/IMAGE_SOURCES.md`
- Modify: `scripts/check-responsive-media.mjs`
- Modify: `scripts/check-responsive-media.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: full suite

**Interfaces:**
- Consumes: media manifest, local originals and any explicitly approved licensed downloads.
- Produces: auditable source registry and final QA record.

- [ ] **Step 1: Create the image source registry before any external download**

```markdown
# Fuentes de imágenes

| Archivo local | Lugar representado | Autor/fuente | URL original | Licencia | Fecha | Estado |
|---|---|---|---|---|---|---|
| assets/img/slide_0.jpg | Playa El Sunzal | Material entregado por el propietario | No aplica | Uso autorizado por el propietario | 2026-10-02 | Original conservado |
```

Add one row per used local family. If the user approves an external image later, record the exact Pexels or open-library Unsplash URL before downloading it. Do not use Google Images or hotlinking.

The initial registry must cover these local families explicitly: `assets/carousel/`, `assets/img/slide_0.jpg` through `slide_3.jpg`, `assets/tours/city-tour-san-salvador/`, `assets/tours/volcan-santa-ana/`, `assets/tours/ruta-maya/` and `assets/tours/cihuatan-suchitoto/`. Mark their source as “Material entregado por el propietario” until the owner supplies a more specific credit.

- [ ] **Step 2: Extend responsive-media validation**

Add the concrete regression test below to `scripts/check-responsive-media.test.mjs`.

```js
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('solo el hero tiene prioridad alta', async () => {
  const html = await read('index.html');
  const quote = String.fromCharCode(34);
  const marker = 'fetchpriority=' + quote + 'high' + quote;
  assert.equal(html.split(marker).length - 1, 1);
});
```

Extend the existing image loop to require `width`, `height` and `alt` on static images, and `ESTMedia.picture()` with lazy loading on dynamic cards.

- [ ] **Step 3: Run the full automated suite**

Run:

```powershell
npm test
npm run media:check
node --check js/*.js
git -c safe.directory="$PWD" diff --check
```

Expected: all tests PASS, 4 pages and all referenced media verify, no JavaScript syntax errors, no whitespace errors.

- [ ] **Step 4: Run visual and accessibility QA**

Check 360, 390, 768, 1024 and 1440 px. For each width verify navigation, menu overlay, hero controls, quote form, experience tabs, tour rail, deep links and footer. Repeat critical paths with keyboard, zoom 200 %, dark mode, reduced motion and slow network.

- [ ] **Step 5: Measure the Home budget**

Measure transferred bytes before video. Expected: below 2.5 MB, no hero duplicate above the selected responsive size, and no layout shift from media.

- [ ] **Step 6: Final self-review against the spec**

Confirm every item in `docs/REFERENCE_STRUCTURE_SPEC_2026-10-02.md` maps to Tasks 1–9. Search for unfinished implementation markers, demo ratings, `50370000000`, reference-site asset URLs and unregistered external images; expected: no production-facing occurrence.

- [ ] **Step 7: Final handoff**

Update `docs/IMPLEMENTATION_PROGRESS.md` with all commands and measurements. Present the diff and wait for authorization before any commit, push or deployment.

## Execution order and approval gates

1. Tasks 1–2 → shared shell approval.
2. Tasks 3–4 → hero and conversion approval.
3. Tasks 5–6 → complete Home approval.
4. Task 7 → catalog/detail approval.
5. Task 8 → page-by-page approval.
6. Task 9 → production-readiness review.

If a token or session limit warning appears, finish only the current numbered task, run its tests, update `docs/IMPLEMENTATION_PROGRESS.md`, report the exact checkpoint and stop before the next task.
