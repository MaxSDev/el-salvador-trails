# Especificación — lavado de cara y videos de referencia

> Estado: SUPERADA el 2026-10-02. No ejecutar. La sustituye docs/REFERENCE_PARITY_REDESIGN_SPEC_2026-10-02.md porque el usuario solicitó una semejanza estructural mucho más fuerte con la referencia.

Fecha: 2026-10-02  
Referencia visual: https://turismo.gov.st/fr  
Estado: propuesta; no implementada

## Decisión principal

La arquitectura visible y funcional de El Salvador Trails se mantiene. No se reorganizan, fusionan ni eliminan las secciones actuales. La referencia de São Tomé se usa únicamente para mejorar el acabado visual: fotografía más protagonista, variación de escala, ritmo entre fondos claros y oscuros, mejor espacio negativo y transiciones contenidas.

## Orden inmutable de la Home

1. Navegación actual.
2. Carrusel hero de cuatro destinos.
3. Cotización rápida y señales de confianza.
4. Tours destacados.
5. Video principal 16:9.
6. Categorías por estilo.
7. Tres historias en formato 9:16.
8. Planifica tu viaje.
9. Cómo funciona en tres pasos.
10. Presentación de Mario.
11. Preguntas frecuentes.
12. CTA final.
13. Banda social.
14. Footer.

Las páginas Tours, About Us y Bienes Raíces también conservan sus secciones y funciones. Solo reciben el mismo lenguaje visual compartido.

## Qué cambia visualmente

- El hero seguirá siendo el carrusel existente, pero tendrá mayor presencia fotográfica, menos apariencia de “tarjeta dentro de tarjeta” y controles más sobrios.
- La cotización conservará campos y funcionamiento; se refinarán proporciones, agrupación y contraste.
- Las tarjetas de tours conservarán contenido y cantidad; variarán su tratamiento de imagen, tipografía y estados.
- Las categorías seguirán siendo cuatro; se dará más protagonismo a la imagen y se reducirá decoración innecesaria.
- Planificación y pasos seguirán siendo secciones independientes.
- Mario, FAQ, CTA, redes y footer conservarán su posición y propósito.
- Se alternarán superficies crema, vino y café sin introducir el verde de la referencia.
- Fraunces, Work Sans, Cinzel y Adlerly Pro no se sustituyen.

## Videos de referencia

Los cuatro placeholders actuales se convertirán en reproductores reales de referencia, manteniendo exactamente sus ubicaciones actuales.

### Video principal 16:9

- Título: “World Surf League en El Salvador 2024”.
- Autor: MITUR El Salvador.
- YouTube ID: `zwagQ8pF9hs`.
- Fuente: https://www.youtube.com/watch?v=zwagQ8pF9hs
- Relación con la página: costa, surf y promoción turística oficial.
- Uso: reproductor principal bajo clic.

### Historia 1 — Volcán y lago

- Título: “El Salvador tiene una maravilla de la naturaleza: Lago de Coatepeque”.
- Autor: Pato Viajes y Aventuras.
- YouTube ID: `C_-Ooep_7Yk`.
- Fuente: https://www.youtube.com/watch?v=C_-Ooep_7Yk
- Relación: Lago de Coatepeque y Volcán de Santa Ana.

### Historia 2 — Ruta de las Flores

- Título: “La Ruta de las Flores de El Salvador: Pueblos mágicos por descubrir”.
- Autor: Foci.
- YouTube ID: `8y4fzg8JJdc`.
- Fuente: https://www.youtube.com/watch?v=8y4fzg8JJdc
- Relación: Ataco, Apaneca, Juayúa, Salcoatitán y Nahuizalco.

### Historia 3 — Centro Histórico

- Título: “San Salvador El Salvador 2023 Cinematic 4K Drone”.
- Autor: DelvisD.
- YouTube ID: `fiSf0t8KOG8`.
- Fuente: https://www.youtube.com/watch?v=fiSf0t8KOG8
- Relación: Centro Histórico, Palacio Nacional, Catedral y entorno urbano.

## Condiciones de uso de los videos

- Son referencias temporales; la interfaz los identifica como “Video de referencia”.
- No se descargan, editan ni redistribuyen.
- Se muestran mediante el reproductor oficial de YouTube con dominio `youtube-nocookie.com`.
- El iframe no se crea hasta que la persona pulse “Ver video”; antes del clic se usa una fotografía local optimizada como poster.
- Se muestra título, autor y enlace a la fuente original.
- No se afirma que el video pertenece a El Salvador Trails ni que sus participantes son clientes.
- No hay autoplay al cargar la página.
- Al cerrar el modal de historias se elimina el iframe para detener audio y reproducción.
- Antes de producción se vuelve a comprobar que cada video siga disponible y permita inserción.
- Los tres videos de creadores independientes requieren aprobación final del propietario del sitio antes de publicación pública; pueden sustituirse por material propio sin cambiar el componente.

## Presentación del video

### Video principal

- Mantiene proporción 16:9.
- Poster local tomado del carrusel de costa.
- Botón real “Ver video de referencia”.
- Tras el clic, el poster se reemplaza por el iframe.
- Debajo aparecen título, autor y “Abrir fuente en YouTube”.

### Historias

- Mantienen las tres tarjetas 9:16.
- Cada tarjeta usa una fotografía local verticalizada con `object-fit: cover`.
- El botón abre un único modal compartido 16:9.
- El modal muestra título, autor, enlace de fuente y botón cerrar.
- Escape, clic en el fondo y botón cerrar devuelven el foco a la tarjeta original.

## Privacidad, rendimiento y accesibilidad

- Cero peticiones a YouTube antes del clic.
- `loading="lazy"` en iframes creados tras interacción.
- `title` descriptivo en cada iframe.
- Botones con mínimo 44 × 44 px y foco visible.
- Modal con `role="dialog"`, `aria-modal="true"` y nombre accesible.
- Sin reproducción automática al entrar a la página.
- Movimiento reducido elimina transiciones del poster y del modal.
- Si un video falla, permanece el poster con un enlace normal a YouTube y un mensaje claro.
- El peso inicial de la Home continúa por debajo de 2.5 MB antes de reproducir un video.

## Imágenes de apoyo

- El lavado de cara usará primero las fotografías locales y sus variantes AVIF/WebP existentes.
- Si una escena no puede representarse con material local, podrá utilizarse una imagen temporal de Pexels o de la biblioteca abierta de Unsplash.
- Toda imagen externa se registra con autor, URL, licencia y fecha.
- No se usarán imágenes de Google, hotlinks ni fotografías extraídas de los videos.

## Límites del lavado de cara

- No se crea un menú de pantalla completa.
- No se reemplaza el carrusel por un hero estático.
- No se cambia el orden de secciones.
- No se fusionan Planificación y Cómo funciona.
- No se convierten los tours en un catálogo diferente durante esta fase.
- No se añaden cifras, reseñas, precios o contactos provisionales.
- No se añaden dependencias de animación o reproductores de terceros.

## Aprobaciones

1. Acabado compartido, navegación y hero.
2. Home completa sin videos cargados.
3. Integración y atribución de los cuatro videos de referencia.
4. Aplicación del acabado a páginas secundarias.
5. QA final y decisión sobre qué videos pueden llegar a producción.

No se hará commit, push o despliegue sin autorización explícita.
