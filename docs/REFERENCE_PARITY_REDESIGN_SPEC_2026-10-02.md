# Especificación — rediseño de alta fidelidad inspirado en São Tomé

Fecha: 2026-10-02  
Referencia visual: https://turismo.gov.st/fr  
Referencia grabada: D:\Grabaciones\2026-10-02 13-30-51.mp4  
Estado: propuesta revisada; reemplaza el alcance conservador anterior

## Decisión principal

El objetivo ya no es aplicar únicamente un acabado superficial. El Salvador Trails debe adoptar una dirección visual claramente reconocible como inspirada en la referencia: fotografía inmersiva, navegación superpuesta, grandes pausas editoriales, tipografía usada como elemento espacial, composiciones asimétricas y cambios de escala notorios.

Se conserva la esencia de El Salvador Trails:

- Paleta crema, vino, dorado y café.
- Fraunces, Work Sans, Cinzel y Adlerly Pro.
- Fotografías y destinos de El Salvador.
- Carrusel, cotizador, catálogo, idiomas, modo oscuro y enlaces actuales.
- Orden funcional de las catorce áreas de la Home.
- Tono cercano y atención directa de Mario.

Se permite transformar con fuerza la composición interna de cada área. Mantener la estructura significa conservar contenido, orden, identificadores y funciones; no significa conservar la geometría actual de tarjetas y columnas.

## Hallazgos de la referencia

La página y la grabación muestran estos rasgos dominantes:

1. Hero de gran altura cubierto por fotografía o video, con navegación transparente encima.
2. Texto corto colocado sobre la imagen, cerca de la parte inferior, en lugar de una tarjeta separada.
3. Controles discretos y mucho espacio negativo.
4. Navegación secundaria en una capa de pantalla completa con color oscuro de marca.
5. Secciones de bienvenida con palabras gigantes de fondo, fotografía central y texto de ancho reducido.
6. Bloques fotográficos que ocupan casi todo el ancho y funcionan como capítulos.
7. Tipografía serif de alto contraste para titulares y sans serif pequeña para navegación.
8. Alternancia clara entre fotografía, superficies luminosas y superficies oscuras.
9. Composición editorial asimétrica; no todas las piezas tienen el mismo radio, sombra o tamaño.
10. Movimiento contenido y asociado a carrusel, menú o desplazamiento; no hay animaciones decorativas constantes.

## Traducción a El Salvador Trails

| Rasgo de referencia | Aplicación en El Salvador Trails |
| --- | --- |
| Hero inmersivo | El carrusel actual pasa a ocupar entre 88 y 100 svh y usa la imagen activa como lienzo completo. |
| Navegación transparente | La barra actual se superpone al hero y se vuelve crema/café al desplazarse. |
| Menú de pantalla completa | El botón hamburguesa actual abre una capa vino con los mismos cuatro enlaces, idiomas, tema y ayuda. |
| Texto sobre fotografía | Marca, destino, descripción y CTA se colocan sobre un scrim controlado dentro del carrusel. |
| Tipografía gigante de fondo | Una palabra contextual como “El Salvador” acompaña la introducción de tours sin convertirse en contenido duplicado. |
| Capítulos fotográficos | Tours, video principal, categorías y CTA usan imágenes de gran formato y bordes mínimos. |
| Composición asimétrica | El primer tour y determinadas categorías ocupan más área que los elementos secundarios. |
| Superficie verde oscura | Se sustituye exclusivamente por vino #7E1500 o café #1C1714. |
| Identidad de São Tomé | No se copia; se mantienen logo, textos, fotografías y recursos propios de El Salvador Trails. |

## Sistema visual

### Color

- Papel volcánico: #FBF8ED.
- Crema tostada: #F7EEDA.
- Vino de marca: #7E1500.
- Vino profundo: #580F00.
- Café nocturno: #1C1714.
- Oro de señalética: #E9C262.

No se introduce verde como color de interfaz.

### Tipografía

- Fraunces: titulares, palabras monumentales y nombres de destinos.
- Work Sans: párrafos, campos, navegación y metadatos.
- Cinzel: controles puntuales, numeración del carrusel y señales breves.
- Adlerly Pro: logotipo y firma de marca exclusivamente.

Los titulares pueden crecer hasta clamp(3.5rem, 9vw, 9rem) cuando funcionan como composición. Los párrafos mantienen un máximo de 65 caracteres por línea.

### Geometría

- Hero y capítulos fotográficos: bordes nulos o radios entre 0 y 18 px.
- Controles: radio completo o 10 px, según función.
- Tarjetas informativas: borde fino; sombras reservadas para elementos realmente elevados.
- Separación vertical principal: clamp(5rem, 11vw, 11rem).
- Ancho editorial: entre 1180 y 1440 px.

## Wireframe de escritorio

~~~text
┌────────────────────────────────────────────────────────────────────────────┐
│ LOGO      enlaces existentes                         idioma  tema  menú     │
│                                                                            │
│                                                                            │
│  01 / 04                                                                  │
│  DESCUBRE EL SALVADOR                                                      │
│  Playa El Sunzal                                                           │
│  descripción breve                    miniaturas / pausa / siguiente       │
│  [Explorar tours]                                                          │
└──────────────────────── hero fotográfico 92–100 svh ───────────────────────┘
                 ┌──── cotizador flotante actual ────┐

        EL SALVADOR  (palabra monumental de fondo)
                       título corto
                    fotografía vertical
                     texto de apoyo

┌──────────────────── tour principal fotográfico ────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────┐  ┌──────────────────────────────────────────┐
│ tour secundario              │  │ tour secundario                          │
└──────────────────────────────┘  └──────────────────────────────────────────┘

┌──────────────────── capítulo de video 16:9 ────────────────────────────────┐
└────────────────────────────────────────────────────────────────────────────┘

categorías asimétricas → historias verticales → planificación → pasos
Mario editorial → FAQ → CTA fotográfico/vino → redes → footer
~~~

## Wireframe móvil

~~~text
┌──────────────────────────┐
│ logo      idioma  menú   │
│                          │
│ 01 / 04                  │
│ Descubre                 │
│ El Salvador              │
│ destino + descripción    │
│ [Explorar]               │
│                          │
│ tabs desplazables        │
└──── hero 88–94 svh ──────┘
┌──── cotizador apilado ───┐
└──────────────────────────┘

EL SALVADOR
imagen vertical
título + texto

tour principal
tour secundario
tour secundario
video
categorías
historias 9:16
resto de secciones
~~~

## Contrato estructural

El orden funcional permanece:

1. Navegación.
2. Carrusel hero.
3. Cotizador y confianza.
4. Tours destacados.
5. Video principal.
6. Categorías.
7. Tres historias.
8. Planificación.
9. Tres pasos.
10. Mario.
11. FAQ.
12. CTA.
13. Redes.
14. Footer.

Dentro de cada área se puede:

- Cambiar grid, alineación, tamaño y superposición.
- Convertir una tarjeta en capítulo fotográfico.
- Añadir wrappers puramente presentacionales.
- Reubicar controles dentro de la misma área.
- Mostrar la misma información con otra jerarquía.

No se puede:

- Cambiar el orden anterior.
- Eliminar campos, destinos, controles o idiomas.
- Añadir precios, cifras, reseñas o contactos ficticios.
- Copiar código, textos, logotipo o fotografías de la referencia.

## Imágenes y videos

- Se usan primero las 36 fotografías locales y sus variantes AVIF/WebP.
- El hero no necesita imágenes nuevas para alcanzar la dirección de referencia.
- Una imagen externa solo entra si existe un vacío concreto y se registra con autor, URL, licencia y fecha.
- Los cuatro videos continúan siendo referencias temporales y se cargan únicamente tras clic.
- Los posters se generan con fotografías locales; no se extraen fotogramas de videos ajenos.
- El peso inicial de la Home permanece debajo de 2.5 MB.

## Navegación

- En la parte superior del hero es transparente, con versión clara de logo y controles.
- Después de 72 px de desplazamiento adopta superficie crema en modo claro y café en modo oscuro.
- El botón hamburguesa permanece visible también en escritorio.
- La capa de menú ocupa la ventana, usa vino/café y conserva los cuatro enlaces actuales.
- Escape, enlace, clic en cerrar y cambio de página cierran la capa y restauran el foco.
- No se crea un CTA de navegación que el usuario no haya solicitado.

## Criterios de semejanza visual

La Home no se considera aprobada solo porque cambien colores o sombras. Debe cumplir:

- Hero mínimo de 88 svh en 390 y 1440 px.
- Imagen activa cubriendo al menos 90 % del hero.
- Navegación superpuesta en el primer viewport.
- Texto del destino colocado sobre la imagen.
- Menú de pantalla completa funcional.
- Una composición con palabra monumental y fotografía central.
- Al menos tres capítulos fotográficos de ancho amplio.
- Ninguna secuencia de más de dos secciones con la misma silueta de tarjeta.
- El primer tour debe tener al menos 1.5 veces el área visual de un tour secundario en escritorio.
- Categorías con dos tamaños distintos en escritorio.
- Capturas de aprobación: hero escritorio, hero móvil, menú abierto, mitad de Home y modo oscuro.

## Dependencias

No se instala un framework de interfaz ni una biblioteca de animación.

Se reutiliza:

- CSS nativo con custom properties, grid, clamp() y svh.
- JavaScript vanilla.
- IntersectionObserver o evento de scroll pasivo para el estado de navegación.
- Sharp ya instalado para posters responsive.
- Node Test y Playwright ya disponibles para pruebas y capturas.

Si una limitación real aparece durante la ejecución, se documenta antes de instalar cualquier dependencia adicional.

## Aprobaciones

1. Navegación, menú y hero inmersivo.
2. Introducción editorial, cotizador y tours.
3. Video, categorías e historias.
4. Planificación, pasos, Mario, FAQ, CTA, redes y footer.
5. Videos de referencia funcionando.
6. Páginas secundarias.
7. QA final.

No se hará commit, push ni despliegue sin autorización explícita.
