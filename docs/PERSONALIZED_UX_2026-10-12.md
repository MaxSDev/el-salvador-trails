# Formulario y galería móvil — 2026-10-12

## Nacionalidades y validación

El selector de personalized.html permite escribir un país o gentilicio habitual, buscar sin acentos y tolerar errores pequeños. Las sugerencias no asignan automáticamente una coincidencia aproximada: el usuario selecciona el resultado. Una coincidencia exacta y única puede confirmarse al salir del campo. Flechas arriba/abajo, Enter y Escape funcionan; el botón abre la lista completa. Cada fila usa label, combobox, listbox, aria-controls y aria-activedescendant.

Se ofrecen 250 códigos de países/territorios (ISO alpha-2 más XK según CLDR) y OTHER para los casos restantes. Los nombres se muestran con Intl.DisplayNames en ES/EN/PT. El backend guarda códigos, nunca el nombre traducido o el gentilicio tecleado. Los registros antiguos con OTHER siguen siendo válidos. Máximo ocho opciones, sin duplicados.

country-codes.mjs y personalized-fields.mjs son las fuentes compartidas del contrato. Para actualizar sus copias del navegador, ejecutar:

`node scripts/sync-personalized-contract.mjs`

Las pruebas comparan ambas copias. Las categorías existentes de grupo y viaje conservan sus códigos. El esquema de almacenamiento no cambia; la función personalized-api debe desplegarse de nuevo para usar el nuevo listado y las reglas. No se realizó despliegue remoto.

Antes de enviar se verifican nombre, email, WhatsApp internacional (+, código de país y 7–15 dígitos), opciones obligatorias, nacionalidades, intereses, textos condicionales, límites y consentimiento. Se permiten dominios internacionales válidos. La comprobación verifica formato; no confirma que un correo o número sea real.

El formulario muestra errores junto al campo, aria-invalid y aria-describedby, más un resumen con enlaces. El foco se mueve al primer campo incorrecto según el orden visual del documento y se desplaza hasta él. Los errores se actualizan al corregirlos; no se marca todo como incorrecto al cargar la página. La API devuelve códigos de error y campos, sin devolver los contactos introducidos.

## Borrador

Las respuestas se conservan al corregir, cambiar idioma y fallar el envío. sessionStorage guarda un borrador por pestaña, recuperable al recargar, con caducidad de 24 horas desde la última edición. La interfaz informa dónde se guarda y ofrece Borrar borrador.

Se almacenan únicamente los campos previstos y las consultas/códigos de nacionalidad. No se guardan tokens de CAPTCHA, claves ni el honeypot. No se utiliza localStorage para el perfil ni se transmiten borradores al servidor. Guardar puede fallar si el navegador restringe almacenamiento; en ese caso se informa y las respuestas actuales siguen en el formulario.

Al confirmar el servidor una recepción válida, se elimina el borrador. La referencia idempotente se conserva entre reintentos locales. Durante el envío se bloquea la edición para evitar perder cambios hechos sobre una solicitud ya en curso.

## Art Haus móvil

Se corrigieron dos causas reales, conservando las fotos:

- gap de las secciones de contenido también añadía separación horizontal entre las columnas que definen los márgenes. Se cambió a row-gap en galería y cierre.
- La altura global de picture al 100% llenaba toda la figura e invadía el pie de foto. Los picture de estate-section ahora tienen block-size:auto y mantienen su proporción; los pies quedan dentro de cada figura.

No se ocultó el desbordamiento para disimularlo. Hero, galería ampliable, idiomas y contactos se conservan.

## Evidencia

95/95 pruebas, build y 8 páginas/69 medios responsive verificados. Las pruebas cubren listado completo, aliases/fuzzy, paridad navegador-servidor, formatos, entradas malformadas, duplicados y respuestas sin datos privados.

Navegador: teclado, gentilicios, lista de 251 opciones, múltiples filas, restauración al recargar, cambio de idioma, foco en un campo condicional faltante, fallo real de conexión local y reintento guardado (referencia a2e92896). El servidor local no tiene mailer: cero correos enviados.

Art Haus se comprobó a 349px y 390px: scrollWidth igual a clientWidth, fotos dentro de márgenes y pies dentro de sus figuras, también con las 16 fotos abiertas. Selector probado en escritorio y móvil. El detector no encontró problemas nuevos en los CSS modificados; avisos heredados de menú/pie/identidad se mantuvieron fuera del cambio.

## Referencias

Los errores por campo y el foco siguen el patrón descrito por [W3C WAI](https://www.w3.org/WAI/tutorials/forms/notifications/), con [resumen enlazado](https://design-system.w3.org/styles/form-errors.html).

Datos de regiones: [Unicode CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/validity/region.xml), bajo [Unicode-3.0](https://www.unicode.org/license.txt). Los nombres localizados siguen [CLDR Display Names](https://cldr.unicode.org/translation/displaynames/countryregion-territory-names).

No se enviaron correos ni se realizó commit, push o despliegue en esta tarea.

