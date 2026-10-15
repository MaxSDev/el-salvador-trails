# Formulario y retratos de Mario

- Los campos del formulario se alinean al inicio de su cuadrícula. Un error en un campo no estira los controles vecinos; los mensajes conservan su espacio natural debajo del control. Se mantienen validación, foco, borrador y envío existentes.
- El panel de la fotografía de Home se estira hasta cubrir la altura del bloque. Conserva su fondo, firma, sello y texto.
- Home usa IMG_3471.JPG; About usa IMG_3470.JPG, ambas de la carpeta de recursos Tazumal. Se conserva el original y se generan copias JPEG de 1200 × 2133 y variantes AVIF/WebP de 480, 768 y 1200 px. El manifiesto incorpora estas imágenes sin sustituir entradas anteriores.
- El encuadre usa object-fit y object-position; las dimensiones están declaradas para reservar espacio. La descripción accesible está disponible en español, inglés y portugués.

Validación: 95 pruebas aprobadas; compilación correcta; 8 páginas y 71 medios responsive verificados; detector Impeccable sin hallazgos. En navegador se reprodujo el error con datos ficticios: antes, nombre de 82 px y correo de 50 px; después, ambos de 50 px y alineados en escritorio. El error desaparece al corregir el correo. Comprobación visual en escritorio y móvil sin desbordamiento.

No se enviaron solicitudes ni correos, ni se publicó en GitHub durante este cambio.
