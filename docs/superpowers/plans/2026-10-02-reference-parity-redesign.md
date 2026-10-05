# Rediseño de alta fidelidad inspirado en la referencia — Plan de implementación

> Estado: propuesto el 2026-10-02. Sustituye el plan conservador de facelift. Ejecutar con la skill executing-plans y detenerse en cada compuerta de aprobación.

**Objetivo:** conseguir que la Home de El Salvador Trails se perciba claramente emparentada con la estructura visual de turismo.gov.st: hero fotográfico de pantalla, navegación superpuesta, menú inmersivo, pausas editoriales monumentales, capítulos visuales amplios y composiciones asimétricas; conservar marca, paleta, tipografías, contenido, orden funcional y comportamiento actuales.

**Arquitectura:** el sistema visual aprobado continúa en css/styles.css y el comportamiento base del carrusel continúa en css/carrousel.css. La nueva dirección de la Home se aísla en css/home-cinematic.css, cargada después de ambas. La primera tarea elimina únicamente la capa facelift rechazada para no apilar correcciones. Los scripts actuales conservan sus responsabilidades; js/site.js recibe los estados del encabezado y menú, js/script.js conserva el carrusel y js/video-player.js encapsula los videos bajo clic.

**Stack:** HTML5 estático, CSS nativo, JavaScript vanilla, Node Test, Sharp existente, Playwright disponible para QA, YouTube privacy-enhanced únicamente después de interacción.

**Especificación:** docs/REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md

## Decisión sobre instalaciones

No se instalarán React, Bootstrap, Tailwind adicional, una librería de animación ni un reproductor. CSS Grid, svh, clamp(), custom properties, IntersectionObserver y JavaScript existente cubren el diseño. Sharp, Node Test y Playwright ya están disponibles. Si aparece una carencia demostrable, se documentará y se pedirá autorización antes de añadir una dependencia.

## Reglas globales

- Conservar crema, vino, dorado y café; no importar el verde de la referencia.
- Conservar Fraunces, Work Sans, Cinzel y Adlerly Pro en sus funciones actuales.
- Conservar el orden de las catorce áreas de la Home y todos sus controles funcionales.
- No copiar código, marca, textos o imágenes de turismo.gov.st.
- Usar fotografías locales optimizadas antes de considerar material externo.
- No mostrar precios, reseñas, cifras o contactos provisionales como reales.
- Mantener ES, EN, PT, modo oscuro, teclado, zoom de 200 %, foco visible y movimiento reducido.
- No cargar YouTube ni otro tercero antes del clic.
- Mantener la carga inicial de Home por debajo de 2.5 MB.
- Después de cada tarea: probar, actualizar docs/IMPLEMENTATION_PROGRESS.md, mostrar el resultado y pedir aprobación.
- No hacer commit, push o despliegue sin autorización explícita.
- Ante advertencia de límite: terminar la tarea atómica, probar, documentar y detenerse.

## Mapa de archivos

- index.html: clases semánticas, menú inmersivo, composición editorial y controles de video.
- css/home-cinematic.css: toda la geometría y dirección visual exclusiva de la Home.
- css/styles.css: sistema compartido aprobado; se retira solo el bloque facelift rechazado.
- css/carrousel.css: comportamiento base; se retira solo el bloque facelift rechazado.
- js/site.js: menú de pantalla completa, bloqueo de scroll, foco y estado scrolled.
- js/script.js: carrusel, contador y estados de controles existentes.
- js/home.js: render de tours con jerarquía visual y enlaces existentes.
- js/video-player.js: creación tardía del iframe, modal, cierre y restauración de foco.
- data/reference-videos.js: metadatos temporales de los cuatro videos aprobados para maqueta.
- js/i18n.js: etiquetas nuevas en ES, EN y PT.
- scripts/reference-parity.test.mjs: contrato visual y estructural.
- scripts/site-ui.test.mjs: navegación, menú, scroll y foco.
- scripts/reference-videos.test.mjs: privacidad y atribución.
- docs/VIDEO_SOURCES.md: procedencia, autor y condición temporal.
- docs/IMPLEMENTATION_PROGRESS.md: resultado verificable de cada tarea.

---

### Tarea 1: reemplazar la capa rechazada por una arquitectura aislada

**Archivos:**
- Crear: css/home-cinematic.css
- Crear: scripts/reference-parity.test.mjs
- Modificar: index.html
- Modificar: css/styles.css
- Modificar: css/carrousel.css
- Modificar: scripts/home-stage3.test.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: escribir el contrato que inicialmente falla**

~~~js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('la Home usa una capa cinematográfica aislada', async () => {
  const [html, shared, carousel, cinematic] = await Promise.all([
    read('index.html'),
    read('css/styles.css'),
    read('css/carrousel.css'),
    read('css/home-cinematic.css')
  ]);
  assert.match(html, /<body class="[^"]*home-cinematic/);
  assert.match(html, /href="css\/home-cinematic\.css"/);
  assert.doesNotMatch(html, /facelift-/);
  assert.doesNotMatch(shared, /FACELIFT HOME/);
  assert.doesNotMatch(carousel, /FACELIFT HOME/);
  assert.match(cinematic, /\.home-cinematic/);
});
~~~

- [x] **Paso 2: ejecutar node --test scripts/reference-parity.test.mjs y registrar el fallo esperado.**
- [x] **Paso 3: eliminar solo los bloques que empiezan con FACELIFT HOME y las clases facelift-*; no modificar tokens ni componentes aprobados.**
- [x] **Paso 4: añadir home-cinematic al body y cargar css/home-cinematic.css después de css/carrousel.css.**
- [x] **Paso 5: crear la hoja con scope .home-cinematic, tokens de ritmo, ancho editorial, superficies claras/oscuras y movimiento reducido.**
- [x] **Paso 6: reemplazar en home-stage3.test.mjs las expectativas del facelift por el contrato vigente.**
- [x] **Paso 7: ejecutar node --test scripts/reference-parity.test.mjs scripts/home-stage3.test.mjs, npm test, npm run media:check y git diff --check.**
- [x] **Paso 8: documentar que la capa conservadora fue sustituida y detenerse si cualquier prueba base deja de pasar.**

**Criterio de aceptación:** no queda CSS rechazado superpuesto, la Home sigue funcional y el nuevo rediseño tiene un único punto de entrada.

---

### Tarea 2: navegación transparente y menú inmersivo

**Archivos:**
- Modificar: index.html
- Modificar: css/home-cinematic.css
- Modificar: js/site.js
- Modificar: js/i18n.js
- Modificar: scripts/site-ui.test.mjs
- Modificar: scripts/reference-parity.test.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: ampliar las pruebas para exigir aria-hidden, bloqueo de scroll, devolución de foco y estado scrolled a partir de 72 px.**

~~~js
assert.equal(menu.getAttribute('aria-hidden'), 'false');
assert.equal(body.classList.contains('is-menu-open'), true);
window.scrollY = 73;
window.dispatch('scroll');
assert.equal(nav.classList.contains('is-scrolled'), true);
document.dispatch('keydown', { key: 'Escape' });
assert.equal(toggle.focused, true);
~~~

- [x] **Paso 2: ejecutar node --test scripts/site-ui.test.mjs y confirmar el fallo previo.**
- [x] **Paso 3: convertir #mobile-menu en una capa de ventana completa con título visual, los cuatro enlaces actuales y un pie de marca; ayuda, tema e idiomas siguen en el encabezado superior y no se duplican.**
- [x] **Paso 4: actualizar setMenuState(open, restoreFocus) para aria-expanded, aria-hidden, icono, body.is-menu-open, foco inicial y foco restaurado.**
- [x] **Paso 5: añadir updateNavState() con window.scrollY > 72, listener pasivo y ejecución inicial.**
- [x] **Paso 6: diseñar encabezado transparente sobre el hero, variante is-scrolled crema/café y capa vino/café con escala tipográfica editorial.**
- [x] **Paso 7: verificar Escape, clic de enlace, clic exterior, tabulación, tema e idiomas en 390 y 1440 px.**
- [x] **Paso 8: ejecutar node --test scripts/site-ui.test.mjs scripts/reference-parity.test.mjs, npm test y git diff --check.**

**Compuerta de aprobación 1A:** mostrar capturas del encabezado transparente y del menú abierto en escritorio y móvil. No continuar sin OK.

---

### Tarea 3: convertir el carrusel actual en un hero fotográfico real

**Archivos:**
- Modificar: index.html
- Modificar: css/home-cinematic.css
- Modificar: js/script.js
- Modificar: scripts/home-stage3.test.mjs
- Modificar: scripts/reference-parity.test.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: escribir pruebas que conserven cuatro pestañas, cuatro miniaturas, pausa y CTA, y exijan min-height: 88svh, imagen absoluta con object-fit: cover, texto superpuesto y ausencia de borde/sombra de tarjeta.**
- [x] **Paso 2: ejecutar las pruebas y registrar el rojo esperado.**
- [x] **Paso 3: añadir un contador accesible 01 / 04 y actualizarlo desde la misma función que cambia la diapositiva.**
- [x] **Paso 4: llevar .destination-card a 92–100svh en escritorio y 88–94svh en móvil; .main-image-wrapper y sus picture/img ocupan el lienzo completo.**
- [x] **Paso 5: colocar título, destino, descripción y CTA en el tercio inferior izquierdo sobre un degradado; ubicar pestañas, miniaturas y pausa como rieles discretos.**
- [x] **Paso 6: eliminar del hero la apariencia de panel: border: 0, box-shadow: none y radio máximo de 18 px solo cuando el viewport deje margen exterior.**
- [x] **Paso 7: asegurar contraste AA, texto legible con cualquier diapositiva, swipe/táctil de controles y versión dark coherente.**
- [x] **Paso 8: probar cambio manual, rotación, pausa, hover/focus, pestaña oculta y prefers-reduced-motion.**
- [x] **Paso 9: generar capturas 390 × 844 y 1440 × 1000 y medir que el hero ocupe al menos 88 % de la altura visible.**
- [x] **Paso 10: ejecutar npm test, npm run media:check, node --check js/script.js y git diff --check.**

**Compuerta de aprobación 1B — obligatoria:** el usuario aprueba o corrige encabezado, menú y hero antes de rediseñar el resto de la Home.

---

### Tarea 4: introducción editorial, cotizador flotante y tours asimétricos

**Archivos:**
- Modificar: index.html
- Modificar: css/home-cinematic.css
- Modificar: js/home.js
- Modificar: js/i18n.js
- Modificar: scripts/home-stage3.test.mjs
- Modificar: scripts/reference-parity.test.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: probar que el cotizador conserva los tres campos y WhatsApp, que existe data-ghost="El Salvador" y que el primer tour recibe la variante tour-card--lead.**
- [x] **Paso 2: ejecutar las pruebas y registrar el fallo previo.**
- [x] **Paso 3: hacer que cotizador y confianza crucen visualmente el final del hero sin ocultar contenido ni foco.**
- [x] **Paso 4: crear dentro de Tours una apertura editorial con palabra monumental, imagen local vertical, título centrado y texto estrecho; la imagen usa el manifiesto responsive y no crea una sección funcional nueva.**
- [x] **Paso 5: adaptar cardHTML(tour, index) para asignar tour-card--lead al primer tour y clases secundarias a los demás sin alterar datos ni enlaces.**
- [x] **Paso 6: componer en escritorio un tour principal con al menos 1.5 veces el área de los secundarios; en móvil apilar sin orden visual engañoso.**
- [x] **Paso 7: reducir marcos, sombras y radios repetidos; llevar nombre y metadatos sobre o junto a la fotografía según contraste.**
- [x] **Paso 8: probar el envío de cotización, el cambio de idioma y el re-render de tours.**
- [x] **Paso 9: ejecutar npm test, npm run media:check y git diff --check.**

**Compuerta de aprobación 2:** mostrar transición hero–cotizador, apertura editorial y tours en 390 y 1440 px.

---

### Tarea 5: integrar videos reales de referencia y capítulos fotográficos

**Archivos:**
- Crear: data/reference-videos.js
- Crear: js/video-player.js
- Crear: scripts/reference-videos.test.mjs
- Crear: docs/VIDEO_SOURCES.md
- Modificar: index.html
- Modificar: css/home-cinematic.css
- Modificar: js/i18n.js
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: escribir pruebas para cuatro IDs únicos, autor, URL fuente, estado temporary, productionApproved: false y ausencia de iframe en el HTML inicial.**

~~~js
test('ningún video contacta YouTube antes del clic', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /<iframe|youtube(?:-nocookie)?\.com\/embed/i);
  const player = await read('js/video-player.js');
  assert.match(player, /youtube-nocookie\.com\/embed/);
  assert.match(player, /addEventListener\(['"]click/);
});
~~~

- [x] **Paso 2: registrar los cuatro videos ya seleccionados con sus IDs zwagQ8pF9hs, C_-Ooep_7Yk, 8y4fzg8JJdc y fiSf0t8KOG8, autores, fuentes y relación con cada lugar.**
- [x] **Paso 3: sustituir el placeholder principal por un poster local 16:9 de ancho amplio con etiqueta Video de referencia, título, autor y botón Ver video.**
- [x] **Paso 4: convertir las tres historias en piezas 9:16 escalonadas con posters locales, manteniendo título y lugar visibles.**
- [x] **Paso 5: crear un único modal accesible; el iframe youtube-nocookie se crea después del clic y se elimina al cerrar por botón, Escape o fondo.**
- [x] **Paso 6: devolver el foco al disparador, bloquear el fondo mientras el modal está abierto y mostrar un enlace fuente si el embed falla.**
- [x] **Paso 7: documentar que los videos son temporales, no pertenecen a El Salvador Trails y requieren decisión antes de producción.**
- [x] **Paso 8: comprobar en Network cero solicitudes de YouTube al cargar y una solicitud únicamente tras clic.**
- [x] **Paso 9: ejecutar node --test scripts/reference-videos.test.mjs, npm test, node --check js/video-player.js y git diff --check.**

**Compuerta de aprobación 3:** revisar video principal, tres historias, modal y atribuciones antes de continuar.

---

### Tarea 6: completar la narrativa visual de la Home

**Archivos:**
- Modificar: index.html
- Modificar: css/home-cinematic.css
- Modificar: js/i18n.js
- Modificar: scripts/reference-parity.test.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: ampliar el contrato para exigir dos tamaños de categoría, tres capítulos fotográficos amplios y no más de dos siluetas de tarjeta idénticas consecutivas.**
- [x] **Paso 2: componer Categorías como mosaico 7/5 y 5/7; mantener los cuatro enlaces y las imágenes actuales.**
- [x] **Paso 3: dar a Planificación ritmo de índice editorial, a Pasos una secuencia horizontal/vertical y a Mario un bloque dividido con su voz y CTA, sin inventar retrato.**
- [x] **Paso 4: convertir FAQ en lista tipográfica contenida, CTA en cierre vino/fotográfico y redes/footer en una transición continua.**
- [x] **Paso 5: añadir revelados suaves solo con opacity/transform y desactivarlos completamente con prefers-reduced-motion.**
- [x] **Paso 6: completar las nuevas etiquetas en ES, EN y PT sin bloquear contenido si una clave falta.**
- [x] **Paso 7: auditar teclado, foco, contraste, 200 % zoom y anchos 360, 390, 768, 1024 y 1440 px.**
- [x] **Paso 8: ejecutar npm test, npm run media:check y git diff --check.**

**Compuerta de aprobación 4:** entregar capturas completas de Home clara y oscura, móvil y escritorio.

---

### Tarea 7: llevar el nuevo lenguaje a las páginas secundarias

**Archivos:**
- Modificar: tours.html
- Modificar: about.html
- Modificar: real-estate.html
- Modificar: css/styles.css
- Modificar: css/home-cinematic.css
- Modificar: js/site.js
- Modificar: scripts/visual-system.test.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md

- [x] **Paso 1: probar que las cuatro páginas conservan navegación, tema, idiomas, ayuda y sus scripts funcionales.**
- [x] **Paso 2: aplicar el encabezado transparente únicamente cuando una página tenga hero fotográfico; usar estado sólido desde el inicio en páginas sin hero.**
- [x] **Paso 3: Tours adopta cabecera fotográfica y ritmo editorial, pero no cambia filtros ni datos durante esta tarea.**
- [x] **Paso 4: About conserva el sendero narrativo y usa escala/espacio del nuevo sistema; Bienes Raíces conserva su estado Próximamente.**
- [x] **Paso 5: compartir menú inmersivo sin copiar reglas específicas de Home a css/styles.css.**
- [x] **Paso 6: probar enlaces, idiomas, tema, tutorial y no-overflow en las cuatro páginas.**
- [x] **Paso 7: ejecutar npm test, npm run media:check y git diff --check.**

**Compuerta de aprobación 5:** revisión página por página antes del QA final.

---

### Tarea 8: QA comparativo, rendimiento y cierre

**Archivos:**
- Modificar: index.html
- Modificar: tours.html
- Modificar: about.html
- Modificar: real-estate.html
- Modificar: css/styles.css
- Modificar: js/site.js
- Modificar: scripts/reference-parity.test.mjs
- Modificar: scripts/site-ui.test.mjs
- Modificar: scripts/visual-system.test.mjs
- Crear: .qa-final/check_final.mjs
- Modificar: docs/IMPLEMENTATION_PROGRESS.md
- Modificar: docs/VIDEO_SOURCES.md

- [x] **Paso 1: ejecutar npm test, npm run media:check, node --check js/*.js y git diff --check.**
- [x] **Paso 2: probar 360, 390, 768, 1024 y 1440 px; registrar ancho, altura del hero y desbordamiento.**
- [x] **Paso 3: probar navegación completa por teclado, Escape, foco restaurado, zoom 200 %, dark mode y movimiento reducido.**
- [x] **Paso 4: medir la Home antes de reproducir video y corregir hasta quedar por debajo de 2.5 MB.**
- [x] **Paso 5: capturar hero escritorio, hero móvil, menú abierto, mitad de Home, Home completa y dark mode.**
- [x] **Paso 6: comparar las capturas contra docs/REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md, no contra coincidencia pixel a pixel de la referencia.**
- [x] **Paso 7: verificar disponibilidad de cada video y dejar productionApproved: false hasta decisión expresa.**
- [x] **Paso 8: actualizar el progreso con archivos, pruebas, pesos, problemas y siguiente paso exacto.**
- [x] **Paso 9: pedir aprobación final. No crear commit, push o despliegue todavía.**

## Definición final de terminado

- El primer viewport se reconoce como experiencia fotográfica inmersiva, no como una tarjeta grande.
- El menú de pantalla completa, la palabra monumental, la composición central y los capítulos amplios son visibles y funcionales.
- La identidad sigue siendo inequívocamente El Salvador Trails.
- Carrusel, cotizador, tours, idiomas, tema, tutorial, WhatsApp, videos y enlaces funcionan.
- No existen datos falsos ni solicitudes de video antes del clic.
- Todas las pruebas pasan, no hay overflow y la carga inicial cumple el objetivo.
- Cada compuerta tiene aprobación explícita del usuario.
