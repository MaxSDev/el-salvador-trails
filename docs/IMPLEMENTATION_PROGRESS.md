# Progreso de implementación

Actualizado: 2026-10-03

## Estado actual

- Etapa 1 — Imágenes y fundamentos: aprobada por el usuario el 2026-10-01.
- Etapa 2 — Sistema visual: aprobada por el usuario el 2026-10-01.
- Rediseño de alta fidelidad — Tareas 1 a 8: completadas.
- Estado: QA final aprobado técnicamente y pendiente únicamente de la aprobación final del usuario.
- Suite vigente: 48 de 48 pruebas aprobadas; 4 páginas y 36 medios responsive verificados.
- El sitio visible usa AVIF/WebP responsive con fallback a los originales.
- Repositorio Git: existente en la rama `gh-pages`, conectado a `OscarDiaz1/el-salvador-trails`.

## Trabajo completado

- Se creó el pipeline no destructivo `scripts/optimize-images.mjs`.
- Se instaló Sharp 0.34.4 como dependencia de desarrollo.
- Se añadieron pruebas con Node Test para preservar originales y generar AVIF/WebP.
- Se procesaron 36 fotografías sin modificar ninguna fuente.
- Se generaron 266 variantes dentro de `assets/optimized/`.
- Se generaron `data/media-manifest.json` y `data/media-manifest.js`.
- Se creó `js/media.js` para producir marcado `<picture>` responsive.
- Se retiraron los procesos y perfiles temporales de auditoría creados durante la sesión.
- Se conectó el manifiesto a Home, Tours, About Us y Bienes Raíces.
- Se añadieron `<picture>`, `srcset`, `sizes`, dimensiones, carga diferida y prioridad del hero.
- El carrusel cambia también sus fuentes AVIF/WebP y usa un fondo WebP limitado a 1200 px.
- Las tarjetas y galerías dinámicas generan marcado responsive.
- Sharp se actualizó a 0.35.5; la auditoría informa 0 vulnerabilidades.

## Resultados medidos

- Peso de 36 originales procesados: 75.94 MB.
- Peso total de todas las variantes, incluyendo cuatro resoluciones y dos formatos: 43.8 MB.
- Muestra `IMG_2625.jpg`: 5,057,380 bytes original; 714,182 bytes en WebP de 1920 px.
- Recurso original del hero: 3,040 KB.
- Hero responsive visible + fondo difuminado: aproximadamente 169 KB.
- Las 36 variantes móviles AVIF seleccionadas suman 2.43 MB frente a 75.94 MB de originales.
- Comparación objetiva a 1920 px: 34.70 dB PSNR en Cihuatán y 36.33 dB en el hero.

## Archivos añadidos o modificados

- `package.json`
- `package-lock.json`
- `scripts/optimize-images.mjs`
- `scripts/optimize-images.test.mjs`
- `scripts/media.test.mjs`
- `scripts/media-carousel.test.mjs`
- `scripts/media-background.test.mjs`
- `scripts/check-responsive-media.mjs`
- `scripts/check-responsive-media.test.mjs`
- `js/media.js`
- `js/script.js`
- `js/home.js`
- `js/tours.js`
- `js/real-estate.js`
- `index.html`
- `tours.html`
- `about.html`
- `real-estate.html`
- `css/styles.css`
- `data/media-manifest.json`
- `data/media-manifest.js`
- `assets/optimized/**`
- `docs/IMPLEMENTATION_PROGRESS.initial.md`
- `docs/IMPLEMENTATION_PROGRESS.md`

## Pruebas ejecutadas

- `npm test -- scripts/optimize-images.test.mjs`: pasó.
- `npm test`: 5 pruebas pasaron.
- `npm run images:optimize`: pasó; 36 imágenes procesadas.
- `npm run media:check`: 4 páginas y 36 medios verificados.
- `node --check js/*.js`: todos los archivos JavaScript válidos.
- Verificación HTTP: las 4 páginas y las variantes de muestra responden 200.
- `npm audit --omit=optional --audit-level=high`: 0 vulnerabilidades.

## Problemas pendientes

- `assets/img/founder-mario.jpg` sigue siendo un placeholder ausente y está marcado explícitamente como tal.
- El wrapper sandbox de `apply_patch` continúa fallando al actualizar; el motor oficial directo funciona y se usa como alternativa segura.

## Checkpoint GitHub — 2026-10-01

- El usuario aprobó la Etapa 1.
- Se confirmó el repositorio Git existente y su remoto de GitHub.
- Se añadieron `.gitignore` y `README.md`.
- Se excluyen dependencias, estado local del editor y prototipos duplicados de `archive/`.
- No se inició ninguna modificación de la Etapa 2 antes de crear este respaldo.
- Se creó el repositorio privado `OscarDiaz1/el-salvador-trails`.
- La rama predeterminada es `gh-pages`.
- El checkpoint de la Etapa 1 quedó publicado como commit `e1721e4`.
- El remoto anterior se conserva localmente como `legacy-origin`.

## Próximo paso exacto

1. Abrir la Home en Opera para revisar la Etapa 3 en escritorio y móvil.
2. Esperar el OK explícito del checkpoint de la Etapa 3.
3. Con el OK, iniciar la Etapa 4 — catálogo de tours.

## Etapa 2 — Sistema visual compartido

### Trabajo completado

- Se consolidó la tipografía en Fraunces, Work Sans y Cinzel.
- Adlerly Pro quedó reservada para la marca.
- Se añadieron tokens compartidos de tipografía, radios, ancho y objetivos táctiles.
- Se mantuvo la navegación compacta; la cotización permanece en los bloques comerciales existentes.
- Se reforzaron los controles a un mínimo de 44 px.
- Se unificaron botones, campos, tarjetas, sombras, bordes y estados.
- Se elevó el foco visible a 3 px con separación de 3 px.
- El menú móvil cierra con Escape, clic fuera o selección y devuelve el foco.
- Se mantuvo el modo oscuro y se verificó su contraste.
- Se documentó la dirección en \`docs/VISUAL_SYSTEM_STAGE2.md\`.

### Archivos modificados

- \`css/styles.css\`
- \`index.html\`
- \`tours.html\`
- \`about.html\`
- \`real-estate.html\`
- \`js/i18n.js\`
- \`js/site.js\`
- \`js/tours.js\`
- \`scripts/visual-system.test.mjs\`
- \`scripts/site-ui.test.mjs\`
- \`docs/VISUAL_SYSTEM_STAGE2.md\`
- \`docs/IMPLEMENTATION_PROGRESS.md\`

### Pruebas ejecutadas

- \`npm test\`: 10 pruebas aprobadas.
- \`npm run media:check\`: 4 páginas y 36 medios verificados.
- \`node --check js/*.js\`: sintaxis válida.
- \`git diff --check\`: sin errores.
- Contraste: 13.68:1 texto claro; 7.82:1 secundario claro; 13.48:1 texto oscuro; 5.40:1 secundario oscuro.
- HTTP local: 200.
- Capturas generadas a 390 × 844 y 1440 × 1000; el visor interno no pudo abrirlas por un error del sandbox.

### Problemas pendientes

- Etapa aprobada por el usuario el 2026-10-01.

## Etapa 3 — Página inicial

### Trabajo completado

- Se compactó el carrusel y se añadió un control visible para pausar o reanudar.
- La rotación se detiene al enfocar, al pasar el puntero, al ocultar la pestaña y con movimiento reducido.
- Se compactaron el cotizador y las señales de confianza sin usar calificaciones ni posiciones demo.
- Los tours destacados se redujeron a una selección más clara y ya no muestran reseñas, contadores ni distintivos de demostración.
- Se añadió un placeholder principal 16:9 y tres placeholders verticales 9:16, todos rotulados “Video próximamente” y sin controles de reproducción falsos.
- Se retiraron de la presentación pública las estadísticas, testimonios y formulario de feedback de demostración.
- Se simplificaron las secciones de planificación, proceso, Mario, preguntas y CTA final.
- La presentación de Mario ya no depende de una fotografía ausente en la Home.
- Se corrigió la navegación móvil para mantener visible el botón de menú a 360 y 390 px.
- Se ocultó el botón flotante de WhatsApp en móvil para evitar que tape contenido o foco.
- Se completaron los textos nuevos en español, inglés y portugués.

### Archivos modificados

- index.html
- css/styles.css
- css/carrousel.css
- js/script.js
- js/home.js
- js/i18n.js
- scripts/home-stage3.test.mjs
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- npm test: 13 pruebas aprobadas.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- node --check js/*.js: sintaxis válida.
- Auditoría de ancho en 360, 390, 768, 1024 y 1440 px: sin desbordamiento horizontal.
- Carrusel pausado: imagen estable después de 4.3 s.
- Movimiento reducido: rotación detenida e imagen estable después de 4.3 s.
- Revisión visual generada en modo claro, oscuro, móvil y escritorio.

### Problemas pendientes

- Falta la aprobación visual del usuario antes de iniciar la Etapa 4.
- Los cuatro videos siguen siendo placeholders hasta recibir los archivos o enlaces definitivos.
- Las reseñas demo permanecen en sus archivos de datos para la Etapa 5, pero ya no se cargan ni se muestran en la Home.

## Lavado de cara — Fase 1: estructura y sistema compartido

### Trabajo completado

- Se protegió el orden actual de las catorce áreas de la Home con pruebas de regresión.
- Se conservaron los cuatro destinos del carrusel, el cotizador, el control de pausa y los tres espacios de historias.
- Se añadieron tokens de ritmo, radios de imagen y superficies editoriales reutilizables.
- Se refinó la navegación sin añadir, quitar ni renombrar enlaces o controles.
- Se unificó el acabado de tarjetas, botones y formularios mediante bordes, sombras y estados más consistentes.
- Se mantuvieron la paleta crema, vino, dorado y café, las tipografías actuales y el modo oscuro.

### Archivos modificados

- css/styles.css
- scripts/facelift-structure.test.mjs
- scripts/visual-system.test.mjs
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- node --test scripts/facelift-structure.test.mjs: 2 pruebas aprobadas.
- Prueba TDD del sistema visual: falló inicialmente por los tokens ausentes y pasó tras implementarlos.
- npm test: 17 pruebas aprobadas.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- git diff --check: sin errores.
- Auditoría real del navegador a 390, 768 y 1440 px: sin desbordamiento horizontal.
- Orden de secciones, menú móvil y modo oscuro: correctos en los tres tamaños aplicables.
- Consola del navegador: sin errores.
- Colores computados: fondo crema rgb(251, 248, 237) y CTA dorado rgb(233, 194, 98).

### Problemas pendientes

- El visor interno no pudo abrir las capturas por un error del sandbox; las capturas sí fueron generadas.
- Esta fase necesita aprobación visual del usuario antes de modificar la presentación de la Home.

### Próximo paso exacto

Con el OK del usuario, ejecutar la Fase 2: aplicar las clases facelift al hero, cotizador y secciones existentes de la Home sin cambiar su orden ni sus funciones.

## Lavado de cara — Fase 2: Home

### Trabajo completado

- Se añadieron clases de presentación prefijadas con facelift sin reemplazar componentes ni cambiar el orden de la Home.
- El carrusel conserva destinos, pestañas, miniaturas, galería y pausa, pero ahora funciona como una ventana fotográfica de mayor escala.
- El cotizador se presenta como una sola pieza editorial con la franja de confianza integrada.
- Los tours destacados dan más espacio a las imágenes y el paquete principal adopta una composición horizontal en escritorio.
- Las cuatro categorías forman un mosaico asimétrico en escritorio y mantienen una lectura simple en móvil.
- El video principal sigue siendo un placeholder honesto y recibió un marco editorial preparado para la siguiente fase.
- Las tres historias se agruparon en el bloque de mayor contraste visual, sin simular reproducción.
- Planificación, pasos, Mario, FAQ y CTA usan composiciones diferenciadas para evitar una sucesión de tarjetas iguales.
- Se conservaron paleta, tipografías, modo oscuro, idiomas, navegación, textos, enlaces y comportamiento de WhatsApp.

### Archivos modificados

- index.html
- css/carrousel.css
- css/styles.css
- scripts/home-stage3.test.mjs
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD de clases facelift: fallo esperado antes de añadirlas y aprobación posterior.
- Ciclo TDD de jerarquía visual: fallo esperado antes del CSS y aprobación posterior.
- npm test: 19 pruebas aprobadas.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- node --check js/*.js: sintaxis válida.
- git diff --check: sin errores.
- Auditoría en navegador a 360, 390, 768, 1024 y 1440 px: sin desbordamiento horizontal.
- Las doce marcas funcionales permanecen visibles y en el orden aprobado.
- Cantidades verificadas: 4 pestañas, 4 categorías, 3 historias, 4 elementos de planificación y 3 pasos.
- Carrusel pausado: imagen estable después de 4.3 segundos.
- Menú móvil y modo oscuro: correctos.
- Consola del navegador: sin errores.
- Capturas completas generadas en 390 y 1440 px, en modo claro y oscuro.

### Problemas pendientes

- El visor interno continúa sin poder abrir las capturas por un error del sandbox; la página y las capturas se generaron correctamente.
- La Fase 2 necesita aprobación visual del usuario antes de registrar o cargar videos externos.

### Próximo paso exacto

Con el OK del usuario, ejecutar la Fase 3: registrar los cuatro videos de referencia con autor, fuente, estado temporal y aprobación de producción en falso, sin conectar todavía con YouTube durante la carga inicial.

## Replanteamiento visual de alta fidelidad — 2026-10-02

### Decisión del usuario

- La Fase 2 conservadora no fue aprobada visualmente: el resultado seguía pareciéndose demasiado a la versión anterior.
- El objetivo vigente es una semejanza estructural fuerte con turismo.gov.st, conservando la identidad y las funciones de El Salvador Trails.
- No se continuará la Fase 3 del plan conservador.

### Trabajo completado

- Se analizó la referencia web y la grabación proporcionada.
- Se definió un contrato visual con hero inmersivo, navegación superpuesta, menú de pantalla completa, palabra monumental, fotografía amplia y composiciones asimétricas.
- Se confirmó que no hace falta instalar un framework, una librería de animación ni un reproductor.
- Se creó docs/REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md.
- Se creó docs/superpowers/plans/2026-10-02-reference-parity-redesign.md.
- La especificación y el plan conservadores quedaron marcados como superados.

### Archivos modificados

- docs/REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md
- docs/REFERENCE_STRUCTURE_SPEC_2026-10-02.md
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- docs/VISUAL_FACELIFT_VIDEO_SPEC_2026-10-02.md
- docs/superpowers/plans/2026-10-02-visual-facelift-reference-videos.md
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas y verificaciones

- Se revisó la arquitectura actual de index.html, css/styles.css, css/carrousel.css, js/site.js, js/home.js y las pruebas existentes.
- Se confirmó que Sharp ya está instalado y que Node Test y Playwright están disponibles.
- No se modificó código de producción durante este replanteamiento.

### Problemas pendientes

- La capa facelift conservadora continúa en el worktree hasta la Tarea 1, que la reemplazará de forma atómica y probada.
- El nuevo plan requiere aprobación antes de comenzar su ejecución.

### Próximo paso exacto

Con el OK del usuario, ejecutar únicamente la Tarea 1 del plan de alta fidelidad: aislar css/home-cinematic.css y retirar la capa facelift rechazada sin tocar el sistema visual previamente aprobado.

## Rediseño de alta fidelidad — Tarea 1: arquitectura aislada

Fecha: 2026-10-02

### Trabajo completado

- Se escribió primero el contrato de la capa cinematográfica y se comprobó su fallo esperado.
- Se creó css/home-cinematic.css como único punto de entrada para la nueva dirección visual de la Home.
- La hoja nueva carga después de css/styles.css y css/carrousel.css y queda limitada por la clase home-cinematic del body.
- Se retiraron únicamente los bloques FACELIFT HOME rechazados de las hojas compartida y del carrusel.
- Se retiraron las clases facelift-* de index.html sin cambiar secciones, identificadores, contenido o comportamiento.
- Se conservaron los tokens, componentes y estilos aprobados de las etapas anteriores.
- Las pruebas antiguas que exigían el facelift rechazado se eliminaron; el contrato vigente vive en scripts/reference-parity.test.mjs.

### Archivos añadidos o modificados

- css/home-cinematic.css
- css/styles.css
- css/carrousel.css
- index.html
- scripts/reference-parity.test.mjs
- scripts/home-stage3.test.mjs
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: 2 pruebas fallaron por ausencia de la capa nueva y presencia del facelift anterior.
- Ciclo TDD verde: 2 pruebas de paridad aprobaron.
- Pruebas dirigidas: 5 de 5 aprobaron.
- npm test: 19 de 19 pruebas aprobaron.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- git diff --check: sin errores.
- Edge headless a 1440 × 1000: la hoja cinematográfica cargó, el token vino fue #7e1500, permanecieron 4 pestañas y el control de pausa.
- Edge headless: sin errores de página, solicitudes locales fallidas ni desbordamiento horizontal.

### Problemas pendientes

- Esta tarea prepara la arquitectura y no aplica todavía el cambio visual fuerte.
- La transformación visible empieza en la Tarea 2 con navegación transparente y menú de pantalla completa.

### Próximo paso exacto

Esperar el OK del usuario. Después ejecutar únicamente la Tarea 2: navegación transparente, estado sólido al desplazarse y menú inmersivo accesible.

## Rediseño de alta fidelidad — Tarea 2: navegación y menú inmersivo

Fecha: 2026-10-02

### Trabajo completado

- La navegación de la Home es transparente sobre la primera imagen y adopta una superficie crema/café al superar 72 px de desplazamiento.
- El botón de menú abre una composición editorial de pantalla completa en vino; en modo oscuro utiliza café profundo.
- El menú conserva únicamente los cuatro destinos reales del sitio y mantiene ayuda, tema e idiomas en el encabezado.
- Se implementaron aria-expanded, aria-hidden, bloqueo de scroll, foco inicial, cierre con Escape, cierre desde enlaces y restauración del foco.
- Los cambios de idioma y tema siguen disponibles sin cerrar el menú.
- Se añadieron textos del menú en español, inglés y portugués.
- WhatsApp se oculta mientras el menú está abierto para no superponerse a la composición.

### Archivos añadidos o modificados

- index.html
- css/home-cinematic.css
- js/site.js
- js/i18n.js
- scripts/site-ui.test.mjs
- scripts/reference-parity.test.mjs
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: las pruebas fallaron primero por ausencia de los estados accesibles, el umbral de scroll, el menú inmersivo y la protección de las utilidades.
- Pruebas dirigidas: 8 de 8 aprobaron.
- npm test: 24 de 24 pruebas aprobaron.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- node --check: todos los archivos JavaScript aprobaron.
- git diff --check: sin errores.
- Edge automatizado en 1440 × 1000 y 390 × 844: sin desbordamiento horizontal, errores de página ni recursos locales fallidos.
- Edge automatizado: menú a pantalla completa, foco correcto, Escape, cambio de idioma, estado sólido y WhatsApp oculto verificados.
- Capturas: .qa-navigation/desktop-header.png, desktop-menu.png, mobile-header.png y mobile-menu.png.

### Problemas pendientes

- La navegación y el menú requieren aprobación visual del usuario en la compuerta 1A.
- El interior del hero conserva todavía su composición anterior; su transformación corresponde a la Tarea 3.

### Próximo paso exacto

Esperar el OK del usuario. Después ejecutar únicamente la Tarea 3: transformar el hero en una experiencia fotográfica de primer viewport sin alterar el carrusel ni sus cuatro destinos.

## Rediseño de alta fidelidad — Tarea 3: hero fotográfico inmersivo

Fecha: 2026-10-02

### Trabajo completado

- El carrusel dejó de presentarse como una tarjeta y ahora funciona como un lienzo fotográfico de primer viewport.
- El hero mide 96svh en escritorio y 94svh en móvil, sin borde, sombra ni radio de panel.
- La imagen responsive ocupa todo el hero con object-fit: cover y conserva AVIF, WebP y el original como respaldo.
- El título editorial, destino, descripción y CTA se superponen en el tercio inferior izquierdo con degradados de contraste.
- Las cuatro pestañas, cuatro miniaturas y el control de pausa se conservaron y se convirtieron en rieles visuales secundarios.
- Se añadió un contador accesible 01 / 04 que se sincroniza con pestañas, miniaturas, rotación y swipe.
- Se añadió navegación táctil horizontal; los gestos verticales siguen reservados para desplazar la página.
- prefers-reduced-motion inicia el carrusel pausado y todos los controles conservan foco visible.

### Archivos añadidos o modificados

- index.html
- css/home-cinematic.css
- js/script.js
- scripts/home-stage3.test.mjs
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: 3 pruebas fallaron por ausencia del contador, el lienzo inmersivo y la sincronización; la prueba de swipe también falló antes de implementar el gesto.
- Pruebas dirigidas: 11 de 11 aprobaron.
- npm test: 28 de 28 pruebas aprobaron.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- node --check: todos los archivos JavaScript aprobaron.
- git diff --check: sin errores.
- Edge automatizado en 1440 × 1000: hero de 960 px, equivalente al 96 % de la altura visible.
- Edge automatizado en 390 × 844: hero de 793.36 px, equivalente al 94 % de la altura visible.
- Edge automatizado: sin desbordamiento, solapamientos, errores de página ni recursos locales fallidos.
- Se verificaron cambio manual, pausa, contador, swipe, foco visible, modo oscuro y movimiento reducido.
- Capturas: .qa-hero/hero-desktop.png y .qa-hero/hero-mobile.png.

### Problemas pendientes

- El encabezado, menú y hero requieren aprobación visual conjunta en la compuerta 1B.
- El contenido posterior de la Home conserva su composición previa; la transformación editorial comienza en la Tarea 4.

### Próximo paso exacto

Esperar el OK del usuario. Después ejecutar únicamente la Tarea 4: apertura editorial, cotizador flotante y tours asimétricos, conservando datos y funciones actuales.

## Corrección visual — escala del título del hero

Fecha: 2026-10-02

### Trabajo completado

- Se reprodujo el problema en 1830 × 893, la resolución de la captura del usuario.
- La causa fue la combinación de 7vw, un máximo de 7.75rem y un ancho de 8ch: el título alcanzaba 124 px, ocupaba tres líneas y cruzaba visualmente las pestañas.
- Se redujo la escala máxima, se amplió la medida tipográfica a 13ch y se equilibraron interlineado y espaciado.
- En escritorio el título queda en 73.2 px y 125.91 px de alto; en móvil queda en 40.95 px y 70.44 px de alto.
- En ambos tamaños el título se organiza en dos líneas y no se superpone con pestañas ni descripción.

### Archivos modificados

- css/home-cinematic.css
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Prueba visual roja en Edge: falló correctamente al detectar una fuente de 124 px.
- Prueba visual verde en 1830 × 893 y 390 × 844: escala dentro del límite, sin solapamiento ni desbordamiento.
- npm test: 28 de 28 pruebas aprobaron.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- git diff --check: sin errores.
- Capturas actualizadas: .qa-hero/hero-wide.png y .qa-hero/hero-mobile.png.

### Problemas pendientes

- La compuerta visual 1B continúa pendiente de aprobación del usuario.

### Próximo paso exacto

Esperar la aprobación del hero corregido antes de ejecutar la Tarea 4.

## Rediseño de alta fidelidad — Tarea 4: transición editorial y tours asimétricos

Fecha: 2026-10-02

### Trabajo completado

- El cotizador ahora cruza visualmente el final del hero: 32 px en escritorio y 12 px en móvil, sin cubrir las miniaturas ni alterar sus tres campos.
- El bloque de confianza comparte una superficie editorial más contenida, con radios y sombras reducidos, controles enfocados y contraste compatible con modo oscuro.
- Tours incorpora una apertura editorial dentro de la sección existente: palabra de fondo “El Salvador”, fotografía vertical local de San Salvador, título centrado y texto de lectura estrecha.
- La fotografía editorial usa AVIF/WebP responsive y conserva el original como respaldo.
- El primer tour recibe la variante principal y los otros tres la variante secundaria sin cambiar datos, orden ni enlaces.
- En escritorio el tour principal ocupa 5.07 veces el área del primer secundario; en móvil las cuatro tarjetas regresan a una sola columna en su orden real.
- Nombre, duración, metadatos, cotización y enlace se integraron sobre la fotografía con degradado de contraste y foco visible.
- Se añadieron las traducciones de la leyenda editorial en español, inglés y portugués.

### Archivos añadidos o modificados

- index.html
- css/home-cinematic.css
- js/home.js
- js/i18n.js
- scripts/home-stage3.test.mjs
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- .qa-stage4/check_stage4.py
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: las pruebas fallaron primero por ausencia de data-ghost, la apertura editorial y las variantes principal/secundaria; el contrato previo de WhatsApp permaneció verde.
- Pruebas dirigidas: 14 de 14 aprobaron.
- npm test: 31 de 31 pruebas aprobaron.
- npm run media:check: 4 páginas y 36 medios responsive verificados.
- node --check: 21 archivos JavaScript aprobaron.
- git diff --check: sin errores; únicamente avisos informativos de normalización LF/CRLF.
- Edge automatizado en 1440 × 1000 y 390 × 844: sin desbordamiento horizontal, errores de consola ni recursos locales fallidos.
- Edge automatizado: tres campos y botón de WhatsApp presentes; mensaje con fecha, grupo e idioma verificado; re-render en inglés verificado.
- Edge automatizado: fotografía AVIF optimizada activa; título editorial limitado a 74.88 px en escritorio y 46.8 px en móvil.
- Capturas: .qa-stage4/desktop-transition.png, desktop-editorial.png, desktop-tours.png, mobile-transition.png, mobile-editorial.png y mobile-tours.png.

### Problemas pendientes

- La transición hero–cotizador, la apertura editorial y los tours requieren aprobación visual del usuario en la compuerta 2.
- Los bloques de video siguen siendo placeholders; su integración con material real corresponde a la Tarea 5.
- No se realizó commit, push ni despliegue.

### Próximo paso exacto

Esperar el OK del usuario. Después ejecutar únicamente la Tarea 5: integrar videos reales de referencia y capítulos fotográficos conservando los respaldos accesibles y la carga bajo demanda.

## Rediseño de alta fidelidad — Tarea 5: videos de referencia y capítulos fotográficos

Fecha: 2026-10-02

### Trabajo completado

- Se registraron cuatro referencias verificadas con ID, título, autor, canal, fuente, relación geográfica y estado `temporary`; `productionApproved` permanece en `false`.
- El bloque principal ahora usa un poster local responsive 16:9, etiqueta de referencia, título, autor, fuente y un control explícito para iniciar la reproducción.
- Las tres historias se convirtieron en capítulos fotográficos 9:16 escalonados para Lago y volcán, Ruta de las Flores y Centro Histórico.
- Se creó un único modal accesible para las historias, con cierre por botón, Escape o fondo, bloqueo del documento, trampa de foco y retorno al activador.
- El iframe usa `youtube-nocookie.com`, se crea únicamente después de una acción deliberada y se elimina al cerrar.
- No se solicitan iframes, miniaturas ni recursos de YouTube durante la carga inicial.
- Cada pieza conserva la atribución visible y un enlace directo a la fuente original; un respaldo informa si el reproductor no puede cargarse.
- Se corrigió el orden de visibilidad y foco del modal detectado por la prueba real de navegador.
- Se completaron las etiquetas nuevas en español, inglés y portugués.

### Archivos añadidos o modificados

- data/reference-videos.js
- js/video-player.js
- index.html
- css/home-cinematic.css
- js/i18n.js
- scripts/reference-videos.test.mjs
- docs/VIDEO_SOURCES.md
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- .qa-stage5/check_stage5.py
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: el registro, los cuatro activadores y el reproductor privado fallaron antes de existir; luego aprobaron.
- Pruebas dirigidas: 17 de 17 aprobaron.
- Suite completa Node Test: 36 de 36 pruebas aprobaron.
- Verificación responsive: 4 páginas y 36 medios comprobados.
- `node --check`: 28 archivos JavaScript y MJS aprobaron.
- `git diff --check`: sin errores; únicamente avisos informativos de normalización LF/CRLF.
- Edge automatizado en 1440 × 1000 y 390 × 844: sin desbordamiento horizontal, errores de consola ni recursos locales fallidos.
- Network: cero solicitudes a YouTube antes de interactuar y exactamente una nueva solicitud por activación.
- Accesibilidad: foco inicial en Cerrar, ciclo de Tab contenido, cierre con Escape, limpieza del iframe y retorno del foco verificados.
- Idiomas: cambio ES → EN → ES verificado en navegador.
- Proporciones: video principal 1.7778 (16:9) e historias 0.5625 (9:16).
- Capturas: .qa-stage5/desktop-main.png, desktop-stories.png, desktop-modal.png, mobile-main.png, mobile-stories.png y mobile-modal.png.

### Problemas pendientes

- Los cuatro videos siguen siendo referencias externas temporales y requieren aprobación expresa o sustitución por material propio antes de producción.
- La compuerta visual 3 requiere la revisión del video principal, las tres historias, el modal y las atribuciones.
- No se realizó commit, push ni despliegue.

### Próximo paso exacto

Esperar el OK del usuario en la compuerta 3. Después ejecutar únicamente la Tarea 6: completar la narrativa visual del resto de la Home, sin alterar las funciones aprobadas.

## Rediseño de alta fidelidad — Tarea 6: narrativa visual completa de la Home

Fecha: 2026-10-02

### Trabajo completado

- Categorías dejó la cuadrícula de cuatro tarjetas iguales y ahora usa un mosaico fotográfico 7/5 y 5/7 con las mismas cuatro imágenes y enlaces.
- La segunda mitad de la Home declara capítulos con siluetas alternadas para evitar más de dos composiciones repetidas consecutivas.
- Planificación se convirtió en un índice editorial de cuatro servicios sobre una superficie vino.
- Los tres pasos ahora son una secuencia semántica horizontal en escritorio y vertical en móvil, sin radios ni apariencia de tarjeta.
- Mario se presenta en un bloque dividido con el monograma de marca, una frase editorial y su CTA existente, sin inventar un retrato.
- FAQ se convirtió en una lista tipográfica de cinco preguntas con foco visible y comportamiento nativo de teclado.
- El CTA final usa una fotografía local responsive con velo vino; redes y footer forman un cierre visual continuo.
- Se añadieron revelados suaves limitados a opacidad y desplazamiento, desactivados por completo con `prefers-reduced-motion`.
- Las nuevas etiquetas se completaron y probaron en español, inglés y portugués.
- Los cuatro videos continúan cargándose únicamente tras interacción y no reciben solicitudes durante la carga inicial.

### Archivos añadidos o modificados

- index.html
- css/home-cinematic.css
- js/i18n.js
- scripts/reference-parity.test.mjs
- scripts/facelift-structure.test.mjs
- .qa-stage6/check_stage6.py
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: 5 pruebas fallaron primero por ausencia del mosaico, capítulos, índices, cierre fotográfico y revelado; después aprobaron.
- Corrección visual TDD: Edge detectó un radio heredado de 16 px en Pasos; tras la corrección verificó 0 px en todos los tamaños.
- Suite completa Node Test: 41 de 41 pruebas aprobaron.
- Verificación responsive: 4 páginas y 36 medios comprobados.
- `node --check`: 28 archivos JavaScript y MJS aprobaron.
- `git diff --check`: sin errores; únicamente avisos informativos de normalización LF/CRLF.
- Edge automatizado: 360, 390, 768, 1024 y 1440 px, además de 720 px como reflujo equivalente a 1440 px con zoom 200 %.
- No hubo desbordamiento horizontal, errores de consola, recursos locales fallidos ni solicitudes a YouTube antes del clic.
- Las categorías midieron 662/466 px en 1440 px y se apilaron en 358 px iguales a 390 px.
- Pasos horizontales en escritorio y verticales en móvil; foco de FAQ y apertura con Enter verificados.
- Movimiento reducido: `animation: none`, `opacity: 1` y `transform: none`.
- Contraste medido en bloques clave: mínimo 9.9:1 y máximo 16.83:1, también validado en modo oscuro.
- Traducciones reales verificadas ES → EN → PT → ES.
- Capturas completas: .qa-stage6/desktop-light-full.png, desktop-dark-full.png, mobile-light-full.png y mobile-dark-full.png.
- Capturas por bloque: categorías, planificación, pasos, Mario, FAQ, CTA y redes en escritorio y móvil.

### Problemas pendientes

- La compuerta visual 4 requiere la aprobación de la Home completa en claro/oscuro y escritorio/móvil.
- Los videos externos siguen marcados como temporales y no aprobados para producción.
- No se realizó commit, push ni despliegue.

### Próximo paso exacto

Esperar el OK del usuario en la compuerta 4. Después ejecutar únicamente la Tarea 7: llevar el nuevo lenguaje visual a Tours, About Us y Bienes Raíces sin cambiar sus funciones ni datos.

## Rediseño de alta fidelidad — Tarea 7: páginas secundarias

Fecha: 2026-10-02

### Trabajo completado

- Las cuatro páginas públicas comparten el mismo encabezado, menú inmersivo, selector de idioma, tema y acceso a la ayuda.
- Home, Tours y About usan encabezado transparente sobre fotografía y cambian al estado sólido al desplazarse; Bienes Raíces usa encabezado sólido desde el inicio.
- Tours abre con una cabecera fotográfica panorámica y reorganiza sus tres categorías en una composición editorial asimétrica, conservando filtros, datos, detalles y cotización.
- About abre con una fotografía a página completa y mantiene intactos el fundador, las tres paradas y la cumbre del sendero narrativo.
- El retrato inexistente del fundador se sustituyó por un placeholder honesto con monograma, evitando publicar un recurso roto o inventar una fotografía.
- Bienes Raíces se redujo a una promesa editorial “Próximamente”; no publica marcas, socios ni propiedades provisionales.
- El menú inmersivo y los estados del encabezado se centralizaron en el sistema compartido, sin duplicar las reglas específicas de Home.
- Se completaron las nuevas etiquetas del catálogo en español, inglés y portugués.

### Archivos añadidos o modificados

- tours.html
- about.html
- real-estate.html
- index.html
- css/styles.css
- css/home-cinematic.css
- js/i18n.js
- scripts/visual-system.test.mjs
- scripts/reference-parity.test.mjs
- .qa-stage7/check_stage7.py
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- docs/IMPLEMENTATION_PROGRESS.md

### Pruebas ejecutadas

- Ciclo TDD rojo: seis contratos fallaron antes de incorporar el sistema secundario; las pruebas dirigidas terminaron 12 de 12 en verde.
- Suite completa Node Test: 47 de 47 pruebas aprobaron.
- Verificación responsive: 4 páginas y 36 medios comprobados.
- `node --check`: 23 archivos JavaScript y MJS aprobaron.
- Edge automatizado en 1440 × 1000 y 390 × 844: ocho combinaciones de página y tamaño sin desbordamiento horizontal, errores de consola ni recursos locales fallidos.
- Navegación: estado transparente/sólido, cuatro enlaces del menú, apertura, Escape y restauración del foco verificados.
- Utilidades: tutorial, modo oscuro y cambio ES → EN → PT verificados en cada página.
- About: cinco bloques animados visibles después del desplazamiento y cero bloques ocultos.
- Capturas: `.qa-stage7/home-1440.png`, `tours-1440.png`, `about-1440.png`, `real-estate-1440.png` y sus equivalentes móviles, además de `shared-menu-1440.png`.

### Problemas pendientes

- La compuerta visual 5 requiere la revisión del usuario de Tours, About Us y Bienes Raíces antes de iniciar el QA final.
- El retrato de Mario continúa como placeholder hasta recibir una fotografía aprobada.
- Los cuatro videos externos permanecen marcados como referencias temporales y no aprobadas para producción.
- No se realizó commit, push ni despliegue.

### Próximo paso exacto

Esperar el OK del usuario en la compuerta 5. Después ejecutar únicamente la Tarea 8: QA comparativo, rendimiento y cierre, sin alterar el diseño aprobado.

## Rediseño de alta fidelidad — Tarea 8: QA comparativo, rendimiento y cierre

Fecha: 2026-10-03

### Trabajo completado

- Se ejecutó la matriz final de la Home en 360, 390, 768, 1024 y 1440 px, más un reflujo de 720 px equivalente a zoom 200 %.
- El hero ocupa entre 94 % y 96 % de la altura visible y la fotografía cubre el 100 % de su lienzo en todos los escenarios.
- Se verificaron navegación por teclado, Enter, Escape, devolución de foco, encabezado sólido al desplazarse, modo oscuro y movimiento reducido.
- Se detectó y corrigió un retraso de visibilidad que impedía enfocar el primer enlace del menú con movimiento reducido y zoom 200 %.
- La corrección elimina las demoras de transición bajo movimiento reducido, hace visible el enlace abierto y evita la doble activación nativa del botón de menú.
- La carga inicial total de la Home, incluidos CDN y fuentes externas, mide 2.002 MiB en 1440 px y 1.423–1.424 MiB en móvil, por debajo del objetivo de 2.5 MiB.
- La fuente Material Symbols se limitó al subconjunto de iconos utilizado por el sitio; esta corrección redujo la transferencia externa inicial de aproximadamente 1.475 MiB a 0.404 MiB.
- La Home realiza cero solicitudes a YouTube antes del clic y una sola solicitud al activar un video.
- El modal de video limpia el iframe al cerrar con Escape y devuelve el foco al activador.
- Se generaron las seis capturas finales: hero escritorio, hero móvil, menú abierto, mitad de Home, Home completa y modo oscuro.
- Las capturas se compararon con REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md y cumplen el hero inmersivo, menú de pantalla completa, palabra monumental, composiciones asimétricas, capítulos amplios e identidad de El Salvador Trails.
- Los cuatro videos devolvieron metadatos oEmbed y HTTP 200 en youtube-nocookie.com el 2026-10-03.
- Los videos continúan como referencias temporales; productionApproved permanece en false.

### Archivos añadidos o modificados durante el cierre

- css/styles.css
- index.html
- tours.html
- about.html
- real-estate.html
- js/site.js
- data/reference-videos.js
- scripts/site-ui.test.mjs
- scripts/reference-parity.test.mjs
- scripts/visual-system.test.mjs
- docs/VIDEO_SOURCES.md
- docs/superpowers/plans/2026-10-02-reference-parity-redesign.md
- .qa-final/check_final.mjs
- .qa-final/hero-desktop.png
- .qa-final/hero-mobile.png
- .qa-final/menu-open.png
- .qa-final/home-mid.png
- .qa-final/home-full.png
- .qa-final/dark-mode.png
- docs/IMPLEMENTATION_PROGRESS.md

### Resultados finales

- Node Test: 48 de 48 pruebas aprobadas.
- Medios responsive: 4 páginas y 36 recursos verificados.
- JavaScript: todos los archivos JS y el auditor final aprobaron node --check.
- git diff --check: sin errores; solo avisos informativos de normalización LF/CRLF.
- Anchos 360, 390, 768, 1024, 1440 y zoom 200 %: cero desbordamiento horizontal.
- Recursos locales: cero respuestas fallidas.
- Consola del navegador: cero errores.
- Hero: 94 % del viewport en 360, 390 y zoom 200 %; 96 % en 768, 1024 y 1440 px.
- Peso inicial total: 1.423–1.424 MiB móvil; 2.002 MiB escritorio a 1440 px. La porción externa queda en 0.404 MiB.
- YouTube antes del clic: cero solicitudes.
- Videos verificados: 4 de 4 públicos según oEmbed y con página privada HTTP 200.

### Problemas pendientes

- Se requiere la aprobación final del usuario para cerrar el rediseño.
- El retrato de Mario continúa como placeholder hasta recibir una fotografía aprobada.
- Los cuatro videos externos siguen siendo referencias temporales y no están aprobados para producción.
- El rediseño completo permanece local y todavía no tiene commit, push ni despliegue.

### Próximo paso exacto

Presentar el resultado final al usuario. Después de su aprobación expresa, crear el checkpoint Git y proceder con push o despliegue únicamente si lo autoriza.
