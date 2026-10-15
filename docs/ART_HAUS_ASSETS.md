# Art Haus — fotografías y contenido

Actualizado el 2026-10-11. Implementación: `real-estate.html`, `css/real-estate.css` y `js/real-estate-i18n.js`.

## Procedencia y preparación

Las 16 fotografías fueron entregadas por el cliente en `El Salvador Trails Recursos/Airbnb/Art Haus/`. Los originales `IMG_*.JPG` permanecen en esa carpeta; los archivos `assets/real-estate/art-haus/img_*.jpg` son derivados para el sitio, no originales. `.qa-client-update/prepare-art-haus.mjs` corrige la orientación EXIF, limita el ancho a 1600 px sin ampliar y genera JPEG de calidad 82 con mozjpeg. Las variantes AVIF/WebP viven en `assets/optimized/real-estate/art-haus/`, con anchos disponibles de 480, 768, 1200 y 1600 px. `data/media-manifest.json` registra dimensiones, rutas y tamaños de las variantes utilizadas.

El inventario de la galería contiene 16 fotografías distintas: cuatro visibles inicialmente y doce dentro de `<details>`. La imagen exterior y la imagen principal del alojamiento se reutilizan en la portada y la presentación; esas repeticiones no aumentan el inventario. Los pies y textos alternativos describen contenido visible, sin convertirlo en promesas de servicios.

| Original conservado | Derivado JPEG | Descripción utilizada |
| --- | --- | --- |
| IMG_1893.JPG | img_1893.jpg | Otra vista del alojamiento |
| IMG_1898.JPG | img_1898.jpg | Interior y cocina |
| IMG_1899.JPG | img_1899.jpg | Interior del alojamiento; imagen principal |
| IMG_1902.JPG | img_1902.jpg | Detalles del interior |
| IMG_1922.JPG | img_1922.jpg | Vista de la ciudad |
| IMG_1924.JPG | img_1924.jpg | Vista de la ciudad |
| IMG_1933.JPG | img_1933.jpg | Espacios compartidos |
| IMG_1934.JPG | img_1934.jpg | Área de juegos |
| IMG_1937.JPG | img_1937.jpg | Sala común |
| IMG_1939.JPG | img_1939.jpg | Sala común |
| IMG_1940.JPG | img_1940.jpg | Espacio de reunión |
| IMG_1945.JPG | img_1945.jpg | Terraza |
| IMG_1947.JPG | img_1947.jpg | Espacios compartidos |
| IMG_1948.JPG | img_1948.jpg | Terraza |
| IMG_2707.JPG | img_2707.jpg | Exterior de Art Haus; portada |
| IMG_2708.JPG | img_2708.jpg | Exterior de Art Haus |

## Contenido confirmado y límites

Dirección confirmada por Max el 2026-10-11: **Avenida Las Magnolias #114, Colonia San Benito, San Salvador**. Art Haus se presenta como alojamiento. El contacto utiliza el correo existente `hola@elsalvadortrails.com`, mediante un enlace `mailto:`; no constituye una reserva automática.

Los párrafos españoles de introducción, socios, contexto del país y cierre provienen del cliente y se conservan en `real-estate.html` y `js/real-estate-i18n.js`. Los títulos, enlaces y texto de apoyo complementan esa copia. Las afirmaciones generales sobre turismo, economía e inversión pertenecen al texto del cliente; esta implementación no aporta una investigación independiente para respaldarlas. Las traducciones EN/PT son de implementación y **requieren revisión editorial** antes de tratarlas como traducciones aprobadas por el cliente.

No se han confirmado capacidad, número de habitaciones, precios, disponibilidad, enlace de reserva, condiciones de acceso a espacios compartidos ni una oferta de venta. Ninguno de esos datos debe deducirse de las fotografías.

## Fotografía reutilizada en Home

La composición del guía utiliza la fotografía existente `assets/tours/volcan-santa-ana/IMG_9697.jpg` (4032 × 2268), identificada en la implementación como paisaje del volcán Izalco. Conserva su ruta histórica dentro del tour Santa Ana y reutiliza AVIF/WebP de 480, 768 y 1200 px en `assets/optimized/tours/volcan-santa-ana/`. No se incorporó un retrato inventado. La firma de Mario Domínguez usa Adlery Pro y el sello reutiliza `assets/icons/logo.svg`.

Ver decisiones y comprobaciones del conjunto en `docs/CLIENT_UPDATES_2026-10-11.md`.
