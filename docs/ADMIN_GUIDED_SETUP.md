# Panel guiado — revisión local del 15 de octubre de 2026

## Abrir la revisión

Ejecutar `npm run dev:content` y abrir `http://127.0.0.1:8002/admin/`.
La cuenta exclusiva de pruebas sigue siendo `pruebas@local.invalid` / `resenas-local`.
Los datos se guardan en `.local/content-preview`; no se envían a Supabase. La copia previa de esta entrega está en `.local/admin-before-2026-10-15`.

## Recorrido para Mario y Ellen

1. Elegir Tours, Bienes Raíces o Reseñas en la pantalla inicial.
2. Seleccionar Editar en un tour. Revisar Datos básicos, Fotos y Detalles. Elegir una portada con el botón que lleva ese nombre.
3. Abrir Ver cómo va quedando durante la edición o ir al paso Vista previa. Probar Computadora, Celular y Tarjeta/Detalle.
4. Guardar borrador y comprobar en otra pestaña que la publicación anterior sigue visible. Publicar después de revisar y confirmar.
5. En Bienes Raíces, editar Art Haus o añadir otro alojamiento/aliado. Revisar las descripciones de sus fotos y su información de contacto.
6. En Reseñas, leer las pendientes y publicar manualmente. Ocultar y Borrar se encuentran bajo Más opciones; borrar requiere confirmación y elimina sus fotos.
7. En Información del sitio se editan textos generales, portadas y contactos. La vista previa permite cambiar entre Inicio y Bienes Raíces.

## Borrar tours, alojamientos y aliados

Al seleccionar Editar, aparece **Borrar** junto a Ocultar, debajo de las acciones del editor. Está disponible para documentos guardados como borrador, publicados u ocultos. La confirmación muestra el nombre y explica que se eliminará del panel y de la página; no hay opción de deshacer. Cancelar conserva los cambios abiertos.

El borrado requiere sesión de administrador y la versión actual del documento. Si otra persona lo modificó, o la conexión falla, el editor conserva lo escrito y muestra el error. Las fotos de la biblioteca y las reseñas se conservan; pueden estar vinculadas a otros contenidos. Información del sitio no se puede borrar.

La auditoría conserva el identificador y la operación, sin guardar una copia recuperable del contenido borrado. El reinicio local y la importación SQL respetan esos identificadores: no restauran elementos borrados. Para crear otro contenido después, usar un nombre en el enlace diferente en Opciones avanzadas. Las pestañas antiguas no pueden recrearlo al guardar.

Validación de esta opción: 29 pruebas del módulo de contenido, recorrido del panel en navegador con cancelación, conflictos y fallo de conexión, y build. Los datos de prueba se guardan en directorios temporales. Copia previa de esta modificación: `.local/before-content-delete-2026-10-15`.

## Datos y permisos

Los documentos conservan borrador, publicación, estado y versión. Los aliados usan `kind: partner`, una clave `partner-…` y un slug estable. La respuesta pública conserva tours/site y añade partners publicados. Las consultas `/access` requieren sesión y solo informan si la cuenta tiene acceso al módulo correspondiente.

La importación de Art Haus usa los textos y 16 fotos actuales. Los metadatos turísticos anteriores ausentes en datos locales antiguos se completan una sola vez, sin reemplazar títulos, fotos, estados, versiones ni las propiedades ya editadas.

La biblioteca de fotos de contenido es pública, como en la implementación anterior. Los borradores y el historial administrativo no se entregan por la API pública. Las fotos de reseñas conservan su almacenamiento privado y URLs temporales.

## Comprobaciones

- `npm test`: políticas, API, datos, PostgreSQL temporal y regresiones existentes.
- `npm run test:content:browser`: recorrido del panel guiado, vista previa, fotos, traducciones, conflictos, aliados y fallos de conexión.
- `npm run test:reviews:browser`: acceso, permisos, recuperación, moderación manual, fotografías y borrado.
- `npm run build`: genera únicamente archivos públicos en dist.

Las pruebas de navegador utilizan directorios temporales separados de `.local/content-preview`. En Windows pueden necesitar ejecución fuera del aislamiento para abrir Edge y reemplazar archivos temporales atómicamente.

Resultado de esta entrega: 121 pruebas automatizadas correctas, ambos recorridos de navegador correctos y build completado. Las capturas revisadas y el video están en `.local/admin-review-2026-10-15`. Se pueden regenerar con `node scripts/admin-demo.mjs`; usa datos de demostración separados y requiere el componente FFmpeg de Playwright.

Servidor local actualizado y comprobado en el puerto 8002: 13 tours conservados, Art Haus con 16 fotos y revisión manual activa. La comparación contra la copia inicial confirmó los 14 documentos previos y su auditoría intactos; solo se completaron metadatos faltantes y se añadió el documento de Art Haus.

## Supabase y publicación

Esta entrega no aplica cambios remotos. El módulo de contenido todavía requiere su primer esquema e importación revisados. Mantener el flujo declarativo existente de `supabase/schemas`; revisar la migración generada con la versión del CLI instalada antes de aplicarla. La importación usa ON CONFLICT DO NOTHING para proteger ediciones existentes.

El módulo remoto de reseñas ya existe: no volver a ejecutar su esquema. El cambio de revisión manual está preparado en `docs/REVIEW_MANUAL_MODE_DELTA.sql` y necesita autorización explícita. Antes de commit, push o cualquier despliegue, mostrar la revisión local y esperar el OK de Oscar.
