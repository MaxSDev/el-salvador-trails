# Especificación de rediseño estructural inspirado en São Tomé

> **Documento reemplazado:** no ejecutar. La especificación vigente es docs/REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md y el plan vigente es docs/superpowers/plans/2026-10-02-reference-parity-redesign.md.

Fecha: 2026-10-02  
Referencia pública analizada: https://turismo.gov.st/fr  
Grabación analizada: `2026-10-02 13-30-51.mp4` (32.7 s, escritorio)

## Objetivo

Reorganizar El Salvador Trails como una experiencia editorial e inmersiva de destino sin copiar la identidad, los textos, los recursos ni el código de la referencia. La nueva estructura debe mantener los colores, las tipografías, el contenido comercial, los idiomas, el modo oscuro, la cotización por WhatsApp, el catálogo y la accesibilidad ya aprobados.

## Qué se toma de la referencia

- Un hero cinematográfico que presenta el destino antes de mostrar productos.
- Alternancia marcada entre capítulos claros y capítulos inmersivos oscuros.
- Composiciones asimétricas de fotografía y texto, con una imagen protagonista por capítulo.
- Carriles editoriales de tarjetas verticales para inspirar sin convertir toda la página en una cuadrícula uniforme.
- Navegación de pantalla completa que funciona como índice visual del sitio.
- Bloques prácticos con imagen cerca del footer para cerrar la inspiración con información útil.
- Jerarquía basada en ritmo, escala y espacio en blanco en lugar de sombras y contenedores repetidos.

## Qué no se copia

- La paleta verde de São Tomé, su logotipo, sus fuentes, sus textos o sus fotografías.
- Su arquitectura institucional, sus secciones de hoteles, restaurantes o transporte.
- Animaciones ligadas al scroll que bloqueen la lectura o requieran una librería pesada.
- El menú o las tarjetas con dimensiones idénticas a la referencia.
- Recursos descargados desde el sitio de referencia.

## Diagnóstico de la Home actual

La Home contiene las funciones correctas, pero casi todas las secciones tienen un peso visual parecido. El carrusel, la cotización, los tours, las categorías, los videos, la planificación, los pasos, Mario, el FAQ y el CTA final se perciben como bloques independientes. Esto produce tres problemas:

1. Falta un momento visual dominante que defina la experiencia de marca.
2. Las cuadrículas repetidas hacen que contenido inspiracional, comercial y práctico parezca equivalente.
3. La historia del viaje se interrumpe antes de llegar a la cotización.

## Concepto visual: “Senderos en capas”

La página contará el viaje como una secuencia de paisajes: llegada, elección del sendero, experiencias, organización y encuentro con el guía. El gesto memorable será la alternancia entre fotografía de gran escala y superficies vino/café, usando el dorado como señal de orientación.

### Paleta preservada

- Papel crema: `#FBF8ED`.
- Superficie cálida: `#F7EEDA`.
- Vino de marca: `#7E1500`.
- Café oscuro: `#1C1714`.
- Dorado: `#E9C262`.
- Texto café: `#3A2416`.

No se añaden azules, verdes de marca ni degradados genéricos.

### Tipografía preservada

- Fraunces: titulares editoriales y frases de destino.
- Work Sans: lectura, navegación, formularios y datos prácticos.
- Cinzel: etiquetas cortas, índices y señales de orientación.
- Adlerly Pro: únicamente el nombre de marca.

### Principios de composición

- Una imagen protagonista por capítulo; el resto sirve como apoyo.
- Una acción primaria por contexto.
- Títulos de 8 a 14 palabras y ancho máximo de 16 a 22 caracteres tipográficos en desktop.
- Alineación principalmente izquierda; el centrado queda reservado para transiciones y CTA final.
- Bordes y contraste de superficie antes que sombras.
- Radios distintos según jerarquía: controles 10 px, tarjetas 16 px, capítulos destacados 24 px.

## Nueva estructura de la Home

### Desktop

```text
┌──────────────────────────────────────────────────────────────────┐
│ Logo     Inicio  Tours  About  Bienes raíces     Tema Idioma ☰  │
├──────────────────────────────────────────────────────────────────┤
│ HERO 88–92svh: fotografía completa + titular + destino activo   │
│                                        índice / pausa / siguiente│
├──────────────────── cotización rápida superpuesta ──────────────┤
│ Introducción editorial              Ventana de video 16:9       │
├──────────────────────────────────────────────────────────────────┤
│ CAPÍTULO VINO: foto grande       Selector vertical de experiencias│
│                            playa / volcán / cultura / café       │
├──────────────────────────────────────────────────────────────────┤
│ Tours destacados: composición editorial 2 grandes + 2 verticales│
├──────────────────────────────────────────────────────────────────┤
│ Historias: tres ventanas 9:16 con contexto, no reproducción falsa│
├──────────────────────────────────────────────────────────────────┤
│ Cómo se organiza: texto + recorrido de 3 pasos + señales confianza│
├──────────────────────────────────────────────────────────────────┤
│ Mario: retrato/monograma + historia + enlace About               │
├──────────────────────────────────────────────────────────────────┤
│ Preguntas útiles     Cuándo visitar / Qué llevar                 │
├──────────────────────────────────────────────────────────────────┤
│ CTA final + footer vino/café                                     │
└──────────────────────────────────────────────────────────────────┘
```

### Móvil

```text
[Logo]                         [tema] [idioma] [menú]
[Hero 78–84svh]
[Titular y CTA]
[Destino 1/4] [pausa]
[Cotización: destino > fecha > grupo > WhatsApp]
[Introducción]
[Video 16:9]
[Foto de experiencia]
[Selector horizontal accesible]
[Tours en carril con snap]
[Historias 9:16 en carril]
[Organización y pasos]
[Mario]
[FAQ]
[CTA + footer]
```

## Comportamientos clave

### Cabecera y menú

- La cabecera se superpone al hero con contraste calculado y adopta una superficie sólida al desplazarse.
- En desktop se mantienen los enlaces actuales; el botón de menú abre un índice de pantalla completa.
- El índice usa vino/café profundo, muestra las cuatro rutas principales y accesos prácticos.
- Escape, clic en cerrar y selección de enlace cierran el índice; el foco regresa al botón de apertura.
- El body no se desplaza mientras el índice está abierto.

### Hero

- Se conserva el carrusel actual y sus cuatro destinos, pero deja de parecer una tarjeta dentro de otra tarjeta.
- La fotografía llena el capítulo; texto, índice y controles se colocan sobre zonas de contraste controlado.
- La pausa visible sigue disponible.
- Autoplay se detiene con hover, foco, pestaña oculta y `prefers-reduced-motion`.
- En movimiento reducido cada destino sigue siendo navegable manualmente y todo el contenido queda visible.

### Explorador de experiencias

- Las categorías actuales dejan la cuadrícula de cuatro tarjetas.
- Una fotografía grande acompaña a un selector de Playa, Volcanes, Cultura y Café.
- Cambiar de categoría actualiza imagen, descripción y enlace sin ocultar el contenido a teclado o lectores de pantalla.
- El estado activo se expresa con texto, borde y `aria-current`, no solamente con color.

### Tours destacados

- Las tarjetas usan tamaños editoriales diferentes en desktop y un carril uniforme en móvil.
- Cada tarjeta mantiene título, duración, dificultad/grupo cuando exista y “Cotización personalizada”.
- No reaparecen precios, reseñas, posiciones o cifras demo.
- Los enlaces apuntarán a `tours.html?tour=slug` cuando la Etapa 4 implemente enlaces profundos.

### Video e historias

- El placeholder principal se integra como una ventana cinematográfica, no como un bloque técnico aislado.
- Los tres placeholders verticales se mantienen claramente rotulados “Video próximamente”.
- No se muestran botones de reproducción hasta disponer de un archivo o proveedor real.

### Planificación, Mario y cierre

- Las señales de confianza y los tres pasos se combinan en un solo capítulo de organización.
- Mario recibe una presentación editorial con espacio para retrato futuro y enlace a About Us.
- El FAQ queda cerca del cierre comercial.
- Dos accesos con imagen —“Cuándo visitar” y “Qué llevar”— preparan el footer y podrán enlazar a contenido real cuando exista.

## Adaptación del resto del sitio

### Catálogo de tours

- Entrada fotográfica editorial con filtros visibles desde el inicio.
- Catálogo directo, sin pantalla intermedia de tres categorías.
- Tarjetas asimétricas en desktop y lista legible en móvil.
- Detalle profundo mediante `?tour=slug`, con galería, datos prácticos, itinerario y CTA persistente.
- El comportamiento inmersivo del ejemplo de alojamiento se traduce al detalle de un tour, no a hoteles.

### About Us

- Se conserva el sendero narrativo aprobado.
- Se simplifican los contenedores para que los hitos alternen fotografía, texto y espacio negativo.
- La sección de Mario comparte el mismo lenguaje editorial de la Home.

### Bienes raíces

- Mantiene su estado “Próximamente”.
- Usa un único hero editorial y un bloque informativo breve; no imita un catálogo vacío.

## Estrategia de imágenes

1. Prioridad absoluta a las fotografías originales ya guardadas en `assets/`.
2. Para el primer prototipo estructural se reutilizan las imágenes locales; así se evalúa diseño sin introducir dudas de licencia.
3. Si falta una localización, solo se incorporan imágenes con licencia verificable de Pexels o de la biblioteca abierta de Unsplash.
4. Cada recurso externo se descarga; nunca se hace hotlink.
5. Se registra URL de origen, autor, licencia, fecha de descarga y ubicación representada en `docs/IMAGE_SOURCES.md`.
6. El original externo se conserva y pasa por el pipeline Sharp existente para AVIF/WebP responsive.
7. Se evitan fotografías con personas identificables que puedan sugerir falsamente que son clientes o guías de El Salvador Trails.

## Movimiento

- CSS e `IntersectionObserver`; no se añade GSAP para este rediseño.
- Una única entrada coordinada por capítulo, de 180–420 ms.
- No se usa parallax continuo ni scroll secuestrado.
- `prefers-reduced-motion: reduce` elimina desplazamiento, autoplay y transiciones no esenciales.

## Accesibilidad y rendimiento

- Contraste WCAG AA, foco visible de 3 px y objetivos táctiles mínimos de 44 px.
- Orden DOM idéntico al orden de lectura.
- El menú de pantalla completa usa `aria-expanded`, nombre accesible y gestión de foco.
- Los carriles tienen controles de teclado y no dependen del gesto horizontal.
- Todo medio reserva dimensiones para evitar CLS.
- Se mantiene el objetivo de Home inferior a 2.5 MB antes de reproducir videos.
- El hero carga una sola imagen prioritaria; el resto usa lazy loading.

## Fases de ejecución y aprobaciones

1. **Prototipo estructural de Home:** cabecera, menú, hero, capítulos y footer con imágenes locales. Aprobación visual desktop/móvil.
2. **Catálogo y detalle:** nueva entrada, filtros y enlaces profundos. Aprobación funcional.
3. **Páginas secundarias:** About Us y Bienes raíces. Aprobación página por página.
4. **Activos externos opcionales:** selección y registro de imágenes solo si las locales no resuelven una escena. Aprobación de cada sustitución.
5. **Producción y QA:** responsive, accesibilidad, rendimiento, SEO y eliminación de Tailwind CDN.

No se realizará ninguna de estas fases sin aprobación explícita. No se harán commits, pushes ni despliegues sin autorización.

## Criterios de aceptación del concepto

- La identidad sigue siendo reconocible como El Salvador Trails sin ver el logo.
- La Home tiene un momento visual dominante y no parece una colección uniforme de tarjetas.
- Cotización, idiomas, tema, ayuda y navegación conservan sus funciones.
- Los videos siguen siendo placeholders honestos hasta recibir contenido real.
- La estructura funciona en 360, 390, 768, 1024 y 1440 px.
- Ningún original se sobrescribe y ninguna imagen externa queda sin procedencia documentada.
- La experiencia es completa con teclado, zoom 200 % y movimiento reducido.
