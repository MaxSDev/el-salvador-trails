# Actualización del cliente — 2026-10-11

Fuente de trabajo: `El Salvador Trails - Estado actual 2026-10-03/Mockups Diseño`. Esta entrega extiende el sitio existente. No reemplaza su identidad visual, no modifica todo el sitio y no incluye publicación ni push.

## Decisiones finales

**Presentación de Mario en Home.** La petición inicial de conservar la composición y recolorear la M fue superada por la instrucción explícita de integrar un rediseño creativo: el usuario rechazó la M recoloreada como arbitraria. La versión final conserva la composición dividida y el texto/CTA del guía; sustituye la pieza izquierda por una lámina editorial con fotografía real de Izalco, firma Mario Domínguez en Adlery Pro y sello torogoz existente. Usa un soporte de papel mezclado con el cian aprobado `#9EFAF3` al 18% y una regla de pie mezclada con el verde aprobado `#4BC000` al 35%. Esos colores están limitados al componente `guide-landscape`; no cambian la paleta compartida. La foto conserva su ruta existente `assets/tours/volcan-santa-ana/IMG_9697.jpg` y sus variantes optimizadas. En móvil, fotografía y texto se apilan.

**Reseñas en Home.** La única sección de feedback aparece inmediatamente después de `tours-editorial-intro` y antes de `home-featured-day` y las tarjetas de paquetes. Se conservan identificadores, controles, formulario, modal y conexión con el flujo de reseñas. La comprobación de navegador registrada cubre envío de invitado, aprobación, fotos, privacidad, límites, ocultación, eliminación y cancelación, traducción, foco y panel móvil.

**Bienes Raíces / Art Haus.** `real-estate.html` sustituye la página de próxima apertura por una presentación editorial, con encabezado compartido sólido, texto sobre papel a la izquierda y exterior del edificio a la derecha. Continúa con los párrafos del cliente, alojamiento Art Haus, dirección confirmada, galería y contacto por correo. La fotografía lleva la presentación, sin añadir una tienda ni un flujo de reserva. La galería contiene 16 fotos distintas, cuatro iniciales y doce adicionales en `<details>` accesible por teclado. ES/EN/PT y temas claro/oscuro utilizan los controles del sitio.

Dirección confirmada por Max: **Avenida Las Magnolias #114, Colonia San Benito, San Salvador**. Contacto: `hola@elsalvadortrails.com`. Art Haus se presenta como alojamiento, sin una oferta de venta.

## Sistema visual conservado

La autoridad sigue siendo el código compartido: `css/styles.css`, con las adaptaciones existentes de `css/home-cinematic.css`. Se mantienen papel/crema, vino, dorado y las familias Fraunces, Work Sans, Cinzel y Adlery Pro. Art Haus referencia las variables compartidas para texto, superficies, títulos y CTA; utiliza composición editorial, fotografías amplias, esquinas discretas de 4 px y enlaces con estados de foco visibles. El cian y verde del guía constituyen una decisión local, no nuevos tokens globales.

No existe `DESIGN.md` ni `.impeccable/design.json` en esta carpeta: es una ausencia previa, registrada sin crear un sistema global como parte de esta extensión. `docs/PRODUCT.md` aún describe Bienes Raíces como placeholder y contenido pendiente; esas líneas son anteriores a esta entrega y quedan como documentación por reconciliar. Este pase no modifica PRODUCT.md ni canoniza hallazgos del detector en otras superficies.

## Procedencia y pendientes

Las 16 fotografías de Art Haus provienen de `El Salvador Trails Recursos/Airbnb/Art Haus/`; los originales se conservan y el inventario completo está en `docs/ART_HAUS_ASSETS.md`. La fotografía de Izalco y el sello del guía provienen de los assets existentes. No se generaron imágenes sintéticas para sustituir estas fuentes.

Los párrafos españoles del cliente permanecen en la página y el diccionario `js/real-estate-i18n.js`. Las versiones EN/PT son traducciones de implementación, pendientes de revisión editorial. Los nuevos textos alternativos del guía también existen en los tres idiomas en `js/i18n.js`.

Siguen sin confirmar capacidad, habitaciones, precios, disponibilidad, URL de reserva, condiciones de uso de las zonas fotografiadas ni una oferta de venta. La galería no demuestra por sí sola esos datos. El texto económico/turístico suministrado por el cliente no fue investigado de forma independiente durante esta implementación.

## Comprobaciones y reproducción

Recibos de esta entrega: `.qa-client-update/tests.txt` registra **80 pruebas aprobadas, 0 fallos** y `.qa-client-update/reviews-e2e.txt` registra el flujo de reseñas aprobado en navegador. El pase principal también reporta build aprobado y **7 páginas / 57 medios** verificados. La revisión visual independiente identificó un único ajuste material de contraste en el pie de firma del modo oscuro. Se corrigió con var(--text); el pase de veredicto confirmó 8.01:1 y resolución del ajuste, con disposición ship.

Desde esta carpeta, con las dependencias instaladas:

```powershell
npm test
npm run test:reviews:browser
npm run build
npm run media:check
```

Las capturas de esta entrega están en `C:/Users/maxgs/.codex/visualizations/2026/10/07/01a11463-6470-79c1-8222-7a4a636f06a7/`. Para revisar el guía, utilizar las capturas finales de la lámina con fotografía: las capturas anteriores de la M son una versión superada. Revisar Art Haus en escritorio y 390 px, temas claro/oscuro, ES/EN/PT, apertura/cierre de galería, foco y ausencia de desbordamiento horizontal. El archivo `.qa-client-update/design-findings.json` recoge hallazgos del detector; los hallazgos previos fuera del alcance no autorizan un rediseño general.

Los archivos `.qa-client-update/*.mjs` son auxiliares de la sesión de implementación; no constituyen un procedimiento necesario para usar o comprobar el sitio final. No se ejecutó una publicación como parte de estas comprobaciones.
