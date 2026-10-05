# Visual Facelift and Reference Videos Implementation Plan

> Estado: SUPERADO el 2026-10-02. No continuar sus tareas. La ejecución vigente está en docs/superpowers/plans/2026-10-02-reference-parity-redesign.md.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar un lavado de cara inspirado en turismo.gov.st sin alterar el orden ni las funciones actuales de El Salvador Trails, e integrar cuatro videos web de referencia con atribución, privacidad y carga bajo clic.

**Architecture:** La estructura HTML existente es el contrato de producto y se protege con pruebas de orden. El cambio se concentra en clases de presentación, CSS compartido y un reproductor progresivo de YouTube que consume un registro independiente de videos y no genera conexiones externas antes de la interacción.

**Tech Stack:** HTML5 estático, CSS custom properties, Tailwind CDN existente durante esta fase, JavaScript vanilla, Node Test, Sharp y manifiesto responsive existente, YouTube privacy-enhanced embed.

**Spec:** `docs/VISUAL_FACELIFT_VIDEO_SPEC_2026-10-02.md`

## Global Constraints

- Mantener el orden actual de las 14 áreas de la Home definido en la especificación.
- Mantener navegación, carrusel, cotizador, tours, categorías, historias, planificación, pasos, Mario, FAQ, CTA, redes y footer.
- Mantener crema, vino, dorado, café, modo oscuro, Fraunces, Work Sans, Cinzel y Adlerly Pro.
- No copiar marca, textos, recursos ni código de turismo.gov.st.
- No descargar, editar ni redistribuir videos de terceros.
- Identificar siempre los videos temporales como “Video de referencia”, con título, autor y fuente.
- No crear ninguna petición a YouTube antes de que la persona pulse el botón del video.
- No publicar cifras, reseñas, precios o contactos provisionales como reales.
- Mantener ES/EN/PT, teclado, foco visible, zoom 200 %, objetivos táctiles de 44 px y movimiento reducido.
- Mantener la Home por debajo de 2.5 MB antes de reproducir videos.
- No añadir librerías de animación o reproducción.
- No hacer commit, push o despliegue sin autorización explícita.

---

## File map

- `index.html`: conserva el orden actual; recibe clases visuales y controles de video reales.
- `tours.html`, `about.html`, `real-estate.html`: conservan estructura y reciben el acabado compartido.
- `css/styles.css`: tokens y estilos del lavado de cara, posters y modal de video.
- `css/carrousel.css`: acabado del carrusel sin cambiar su comportamiento.
- `js/script.js`: conserva el carrusel; solo cambia si un estado visual requiere una clase.
- `js/home.js`: conserva tours y cotización; inicializa el reproductor.
- `js/video-player.js`: carga YouTube bajo clic, abre/cierra modal y restaura foco.
- `js/i18n.js`: etiquetas y estados de video en ES/EN/PT.
- `data/reference-videos.js`: catálogo temporal de los cuatro videos.
- `docs/VIDEO_SOURCES.md`: título, autor, URL, relación, estado y aprobación.
- `scripts/facelift-structure.test.mjs`: protege el orden y las funciones actuales.
- `scripts/reference-videos.test.mjs`: protege privacidad, atribución y configuración.
- `docs/IMPLEMENTATION_PROGRESS.md`: checkpoint al terminar cada tarea.

### Task 1: Freeze the current structure as a tested contract

**Files:**
- Create: `scripts/facelift-structure.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/facelift-structure.test.mjs`

**Interfaces:**
- Consumes: IDs, labels and section markers already present in `index.html`.
- Produces: `HOME_SECTION_MARKERS`, the canonical ordered list used by regression tests.

- [ ] **Step 1: Write the structure-order test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const HOME_SECTION_MARKERS = [
  'id="destination-carousel"',
  'id="home-quote"',
  'id="home-featured-day"',
  'data-video-placeholder="main"',
  'aria-label="Categorías"',
  'data-video-placeholder="story"',
  'aria-label="Planifica"',
  'aria-label="Cómo funciona"',
  'aria-label="Tu guía"',
  'aria-label="Preguntas"',
  'aria-label="Reserva"',
  'class="social-band'
];

test('el lavado de cara conserva el orden funcional de la Home', async () => {
  const html = await read('index.html');
  const positions = HOME_SECTION_MARKERS.map(marker => html.indexOf(marker));
  positions.forEach((position, index) => assert.ok(position >= 0, HOME_SECTION_MARKERS[index]));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test('se conservan carrusel, cotizador y cantidades aprobadas', async () => {
  const html = await read('index.html');
  assert.equal((html.match(/data-carousel-tab=/g) || []).length, 4);
  assert.equal((html.match(/data-video-placeholder="story"/g) || []).length, 3);
  assert.match(html, /id="carousel-pause-btn"/);
  assert.match(html, /id="home-quote"/);
});
```

- [ ] **Step 2: Run the contract before making visual changes**

Run: `node --test scripts/facelift-structure.test.mjs`  
Expected: PASS against the current Home.

- [ ] **Step 3: Add the test to the full suite**

Run: `npm test`  
Expected: all existing tests plus the new structure tests PASS.

- [ ] **Step 4: Record the immutable order**

Update `docs/IMPLEMENTATION_PROGRESS.md` with the 14-area order and the rule that a failed order test stops the task.

### Task 2: Apply the shared visual facelift without replacing components

**Files:**
- Modify: `css/styles.css`
- Modify: `index.html`
- Modify: `tours.html`
- Modify: `about.html`
- Modify: `real-estate.html`
- Modify: `scripts/visual-system.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/visual-system.test.mjs`

**Interfaces:**
- Consumes: existing design tokens and component classes.
- Produces: `--section-space`, `--section-space-compact`, `--image-radius`, `.surface-cream`, `.surface-wine` and `.editorial-frame`.

- [ ] **Step 1: Add failing token tests**

```js
test('el lavado de cara añade ritmo sin cambiar la identidad', async () => {
  const css = await read('css/styles.css');
  for (const token of ['--section-space', '--section-space-compact', '--image-radius']) {
    assert.match(css, new RegExp(token + '\\s*:'));
  }
  assert.match(css, /\.surface-cream/);
  assert.match(css, /\.surface-wine/);
  assert.match(css, /\.editorial-frame/);
});
```

- [ ] **Step 2: Run the visual-system test**

Run: `node --test scripts/visual-system.test.mjs`  
Expected: FAIL on the three new tokens.

- [ ] **Step 3: Add the visual primitives**

```css
:root {
  --section-space: clamp(4.5rem, 8vw, 8rem);
  --section-space-compact: clamp(3rem, 5vw, 5rem);
  --image-radius: clamp(18px, 2vw, 30px);
}

.surface-cream { background: var(--bg); color: var(--text); }
.surface-wine { background: var(--brand); color: #fff8ec; }
.dark .surface-wine { background: var(--surface); color: var(--text); }
.editorial-frame { border-radius: var(--image-radius); overflow: clip; border: 1px solid var(--border); }
```

Use these classes only to skin existing wrappers. Do not move a section or introduce a replacement component.

- [ ] **Step 4: Refine shared components**

Reduce uniform shadows, increase image area, align headings left where the current content allows it, and keep current labels and actions. Preserve navigation links, theme control, language selector, help button and current mobile drawer.

- [ ] **Step 5: Verify the shared system**

Run: `npm test` and `git -c safe.directory="$PWD" diff --check`.  
Expected: structure tests remain green and no page loses a navigation control.

- [ ] **Step 6: Record and request visual-system approval**

Capture 390 and 1440 px in light and dark mode, update progress, and pause.

### Task 3: Facelift the hero, quote and existing Home sections in place

**Files:**
- Modify: `index.html`
- Modify: `css/carrousel.css`
- Modify: `css/styles.css`
- Modify: `js/script.js`
- Modify: `scripts/home-stage3.test.mjs`
- Modify: `scripts/facelift-structure.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/home-stage3.test.mjs`
- Test: `scripts/facelift-structure.test.mjs`

**Interfaces:**
- Consumes: all current section IDs, carousel controls, quote fields and generated tour containers.
- Produces: presentation classes prefixed with `.facelift-` without changing data contracts.

- [ ] **Step 1: Add failing preservation tests**

```js
test('el facelift usa clases nuevas sin reemplazar componentes', async () => {
  const html = await read('index.html');
  assert.match(html, /facelift-hero/);
  assert.match(html, /facelift-quote/);
  assert.match(html, /facelift-featured/);
  assert.match(html, /facelift-categories/);
  assert.match(html, /facelift-planning/);
  assert.match(html, /facelift-steps/);
  assert.match(html, /facelift-guide/);
});
```

- [ ] **Step 2: Verify failure**

Run: `node --test scripts/home-stage3.test.mjs scripts/facelift-structure.test.mjs`  
Expected: FAIL because the presentation classes are absent.

- [ ] **Step 3: Restyle the hero in its current location**

Keep `#destination-carousel`, four tabs, gallery, thumbnails and pause control. Increase photographic scale, simplify the nested border treatment and use a controlled scrim for legibility. Do not convert it to a static hero or full-screen page chapter.

```css
.facelift-hero .destination-card { border-radius: clamp(20px, 3vw, 34px); }
.facelift-hero .main-image-wrapper { min-height: clamp(280px, 38vw, 520px); }
.facelift-hero .card-header { max-width: 72rem; }
.facelift-hero .slide-details { max-inline-size: 58ch; }
```

- [ ] **Step 4: Restyle the quote and featured tours in place**

Keep the current form fields and generated containers. Use one clear border, stronger spacing and image-led cards. Do not change WhatsApp behavior, the number of featured tours or the order relative to the video section.

- [ ] **Step 5: Restyle categories, stories, planning, steps, Mario, FAQ and CTA**

Keep each section independent. Alternate only their surface and internal alignment. Preserve four category cards, three story cards, four planning cards and three numbered steps.

- [ ] **Step 6: Verify the complete non-video facelift**

Run: `npm test`, `npm run media:check`, and `node --check js/*.js`.  
Manual: verify the 14-area order at 360, 390, 768, 1024 and 1440 px.  
Expected: no horizontal overflow, carousel pause still works, and no section disappears.

- [ ] **Step 7: Record and request Home approval before loading videos**

Update progress with screenshots and stop for the user’s visual review.

### Task 4: Register the four reference videos and their provenance

**Files:**
- Create: `data/reference-videos.js`
- Create: `docs/VIDEO_SOURCES.md`
- Create: `scripts/reference-videos.test.mjs`
- Modify: `index.html`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/reference-videos.test.mjs`

**Interfaces:**
- Produces: `window.EST_REFERENCE_VIDEOS` with `mode`, `productionApproved` and `items`.
- Consumes: exact YouTube IDs verified in the specification.

- [ ] **Step 1: Write the failing registry tests**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('el registro declara cuatro videos temporales y no los aprueba para producción', async () => {
  const source = await read('data/reference-videos.js');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const registry = context.window.EST_REFERENCE_VIDEOS;
  assert.equal(registry.mode, 'reference');
  assert.equal(registry.productionApproved, false);
  assert.deepEqual(Object.keys(registry.items), ['main', 'volcano', 'flowers', 'city']);
});

test('cada video tiene autor, fuente e id', async () => {
  const source = await read('data/reference-videos.js');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  for (const video of Object.values(context.window.EST_REFERENCE_VIDEOS.items)) {
    assert.match(video.youtubeId, /^[A-Za-z0-9_-]{11}$/);
    assert.ok(video.title && video.author && video.sourceUrl);
    assert.equal(video.status, 'reference');
  }
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test scripts/reference-videos.test.mjs`  
Expected: FAIL because the registry does not exist.

- [ ] **Step 3: Create the exact registry**

```js
window.EST_REFERENCE_VIDEOS = Object.freeze({
  mode: 'reference',
  productionApproved: false,
  items: Object.freeze({
    main: Object.freeze({ youtubeId: 'zwagQ8pF9hs', title: 'World Surf League en El Salvador 2024', author: 'MITUR El Salvador', sourceUrl: 'https://www.youtube.com/watch?v=zwagQ8pF9hs', status: 'reference', official: true }),
    volcano: Object.freeze({ youtubeId: 'C_-Ooep_7Yk', title: 'Lago de Coatepeque y Volcán de Santa Ana', author: 'Pato Viajes y Aventuras', sourceUrl: 'https://www.youtube.com/watch?v=C_-Ooep_7Yk', status: 'reference', official: false }),
    flowers: Object.freeze({ youtubeId: '8y4fzg8JJdc', title: 'La Ruta de las Flores de El Salvador', author: 'Foci', sourceUrl: 'https://www.youtube.com/watch?v=8y4fzg8JJdc', status: 'reference', official: false }),
    city: Object.freeze({ youtubeId: 'fiSf0t8KOG8', title: 'San Salvador 2023 Cinematic 4K Drone', author: 'DelvisD', sourceUrl: 'https://www.youtube.com/watch?v=fiSf0t8KOG8', status: 'reference', official: false })
  })
});
```

- [ ] **Step 4: Create the source ledger**

`docs/VIDEO_SOURCES.md` must repeat the four entries with channel, source URL, destination represented, date checked `2026-10-02`, `reference` status and `productionApproved: false`. Record that the main video appears on the official CORSATUR video page and that the other three are public creator videos requiring final owner approval.

- [ ] **Step 5: Load data without loading YouTube**

Add `<script src="data/reference-videos.js"></script>` before `js/video-player.js`. Do not add an iframe or YouTube thumbnail URL to initial HTML.

- [ ] **Step 6: Verify the registry**

Run: `node --test scripts/reference-videos.test.mjs`.  
Expected: both tests PASS and opening the Home causes zero requests to YouTube.

- [ ] **Step 7: Record the checkpoint**

Update progress with the exact four sources and approval state.

### Task 5: Replace placeholders with click-to-load reference videos

**Files:**
- Create: `js/video-player.js`
- Modify: `index.html`
- Modify: `css/styles.css`
- Modify: `js/i18n.js`
- Modify: `scripts/reference-videos.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/reference-videos.test.mjs`

**Interfaces:**
- Consumes: `window.EST_REFERENCE_VIDEOS.items` and `[data-video-trigger]`.
- Produces: `window.ESTVideoPlayer.buildEmbedUrl(videoId)`, `openStoryVideo(key, trigger)` and `closeStoryVideo()`.

- [ ] **Step 1: Add failing privacy and DOM tests**

```js
test('la Home no contiene iframes de YouTube antes del clic', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.equal((html.match(/data-video-trigger=/g) || []).length, 4);
  assert.match(html, /data-video-modal/);
});

test('el reproductor usa el dominio de privacidad y limpia el modal', async () => {
  const source = await read('js/video-player.js');
  assert.match(source, /youtube-nocookie\.com\/embed\//);
  assert.match(source, /frame\.replaceChildren\(\)/);
  assert.match(source, /event\.key === 'Escape'/);
  assert.match(source, /lastTrigger\.focus\(\)/);
});
```

- [ ] **Step 2: Run the tests**

Run: `node --test scripts/reference-videos.test.mjs`  
Expected: FAIL because triggers, modal and player are absent.

- [ ] **Step 3: Implement the URL builder and iframe factory**

```js
function buildEmbedUrl(videoId) {
  return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) + '?rel=0&autoplay=1';
}

function createIframe(video) {
  var iframe = document.createElement('iframe');
  iframe.src = buildEmbedUrl(video.youtubeId);
  iframe.title = video.title + ' — ' + video.author;
  iframe.loading = 'lazy';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  return iframe;
}
```

The `autoplay=1` parameter is allowed only because iframe creation follows an explicit click. No iframe exists during initial load.

- [ ] **Step 4: Convert the main placeholder in place**

Retain the existing main placeholder data attribute as the tested structural marker after adding the real trigger.

Keep the 16:9 wrapper in the same section. Replace placeholder text with a real button using `data-video-trigger="main"`, a local coast poster, localized “Ver video de referencia”, and visible title/author/source metadata. On click, replace only that frame with the iframe.

- [ ] **Step 5: Convert the three story placeholders in place**

Retain all three story placeholder data attributes as tested structural markers after adding their real triggers.

Keep three 9:16 cards and their current order. Map them to `volcano`, `flowers` and `city`. Their buttons open one shared `role="dialog"` modal containing the 16:9 iframe, title, author, original-source link and close button.

- [ ] **Step 6: Implement modal cleanup and focus return**

```js
function closeStoryVideo() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  frame.replaceChildren();
  document.body.classList.remove('is-video-open');
  if (lastTrigger) lastTrigger.focus();
}
```

Close on its button, backdrop and Escape. Trap focus while open. If iframe creation fails, leave the poster and expose the normal source link.

- [ ] **Step 7: Add exact translations**

Add these keys in ES/EN/PT: `video.reference` = “Video de referencia” / “Reference video” / “Vídeo de referência”; `video.watch` = “Ver video de referencia” / “Watch reference video” / “Ver vídeo de referência”; `video.source` = “Abrir fuente en YouTube” / “Open source on YouTube” / “Abrir fonte no YouTube”; `video.close` = “Cerrar video” / “Close video” / “Fechar vídeo”; `video.unavailable` = “El video no está disponible; abre la fuente original.” / “The video is unavailable; open the original source.” / “O vídeo não está disponível; abra a fonte original.”

- [ ] **Step 8: Verify video behavior**

Run: `npm test`, `node --check js/video-player.js`, and `npm run media:check`.  
Manual: confirm zero YouTube requests before click, one request after click, Escape closes, audio stops, focus returns, and external source opens in a new tab with `rel="noopener noreferrer"`.

- [ ] **Step 9: Record and request video approval**

Update progress and show each of the four videos in its actual location. Pause before secondary pages.

### Task 6: Carry the facelift across existing secondary pages

**Files:**
- Modify: `tours.html`
- Modify: `about.html`
- Modify: `real-estate.html`
- Modify: `css/styles.css`
- Modify: `scripts/facelift-structure.test.mjs`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: `scripts/facelift-structure.test.mjs`

**Interfaces:**
- Consumes: current category/list/detail states in Tours, narrative trail in About and coming-soon state in Real Estate.
- Produces: shared visual classes only; no new page state or route.

- [ ] **Step 1: Add preservation tests for secondary pages**

```js
test('el facelift conserva los contenedores funcionales de páginas secundarias', async () => {
  const tours = await read('tours.html');
  const about = await read('about.html');
  const realEstate = await read('real-estate.html');
  for (const marker of ['id="categories-grid"', 'id="tour-list-container"', 'id="tour-detail-container"']) assert.match(tours, new RegExp(marker));
  for (const marker of ['id="fundador"', 'data-od-id="trail"', 'stop-vision', 'stop-mission', 'stop-commitment']) assert.match(about, new RegExp(marker));
  assert.match(realEstate, /data-i18n="realestate\.comingSoon"|Próximamente/i);
});
```

- [ ] **Step 2: Run the preservation tests**

Run: `node --test scripts/facelift-structure.test.mjs`  
Expected: PASS before changes.

- [ ] **Step 3: Apply shared surfaces and image treatment**

Use the same spacing, headings, borders and image frames as Home. Do not replace the category-first catalog in this facelift, do not alter tour modal history, do not rewrite the About trail, and do not add fake properties.

- [ ] **Step 4: Verify page behavior**

Run: `npm test`, `npm run media:check`, and `node --check js/*.js`.  
Manual: open categories and a tour detail, traverse the About trail, and inspect Real Estate at 390 and 1440 px.  
Expected: all states behave exactly as before with updated presentation.

- [ ] **Step 5: Record and request page-by-page approval**

Update progress separately for Tours, About and Real Estate.

### Task 7: Final QA, video revalidation and handoff

**Files:**
- Modify: `docs/VIDEO_SOURCES.md`
- Modify: `docs/IMPLEMENTATION_PROGRESS.md`
- Test: full suite

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a final tested checkpoint with explicit production status for every video.

- [ ] **Step 1: Revalidate the four source URLs**

Open all four YouTube watch URLs, confirm they remain public and embeddable, and record the verification date. If one fails, set its `status` to `unavailable`; the UI must show the local poster and normal source link without an iframe.

- [ ] **Step 2: Run full automated QA**

```powershell
npm test
npm run media:check
node --check js/*.js
git -c safe.directory="$PWD" diff --check
```

Expected: all tests pass, four pages and responsive media verify, JavaScript parses and the diff has no whitespace errors.

- [ ] **Step 3: Run viewport and interaction QA**

Check 360, 390, 768, 1024 and 1440 px in light/dark mode. Repeat with keyboard, zoom 200 %, reduced motion and slow network. Confirm the section order, carousel pause, quote form, all four video triggers, modal cleanup, language switching and footer.

- [ ] **Step 4: Measure initial page weight**

Expected: Home below 2.5 MB before playback and zero YouTube requests before the first video click.

- [ ] **Step 5: Confirm publication status**

Keep `productionApproved: false` until the user explicitly approves the exact four videos for public use. Replacing a reference with owned footage changes only `data/reference-videos.js`, poster and source ledger.

- [ ] **Step 6: Final handoff**

Update progress, present screenshots and the final diff, and wait for authorization before commit, push or deployment.

## Approval gates

1. Task 1–2: shared facelift.
2. Task 3: Home visual review with structure unchanged.
3. Task 4–5: video source and playback approval.
4. Task 6: secondary pages.
5. Task 7: production-readiness review.

If a token or session limit warning appears, finish only the current numbered task, run its tests, update progress and stop before starting the next task.
