# Panel de tours e información

## Estado de esta fase

Implementación local con una API separada de las reseñas. No activa ni modifica automáticamente el proyecto Supabase. El despliegue y commit/push quedan pendientes del OK del usuario.

El inicio está en `/admin/`, Tours en `/admin/content.html`, Bienes Raíces en `/admin/real-estate.html`, Reseñas en `/admin/reviews.html` e Información del sitio en `/admin/site.html`. Comparten sesión y recuperación de acceso. Los permisos de contenido se conceden por separado: ser moderador de reseñas no permite editar tours o aliados automáticamente.

## Probar sin servicios externos

Con Node 24 y las dependencias ya instaladas:

```
npm run dev:content
```

Página `http://127.0.0.1:8002/`; panel `http://127.0.0.1:8002/admin/content.html`.
Acceso local: `pruebas@local.invalid` / `resenas-local`. PORT permite usar otro puerto. El servidor debe escuchar en 127.0.0.1.

Datos en `.local/content-preview/content/content.json`; fotos en `.local/content-preview/content-images`. Son pruebas persistentes en esta PC, ignoradas por Git y por la compilación. No son las reseñas ni el catálogo del Supabase real. `npm run dev` sigue ofreciendo la vista de reseñas y contenido en el puerto 8000.

Prueba añadir un tour, elegir Day Tours o Tour Packages al inicio del formulario, guardar borrador (no aparece en el catálogo), publicar (aparece en la categoría elegida), cambiar y guardar (se mantiene la versión pública), ocultar (desaparece) y volver a publicar. Puedes cambiar de categoría un tour existente y publicarlo para moverlo. Los títulos conservan mayúsculas y acentos; el nombre opcional del enlace se adapta automáticamente al guardar un tour nuevo. Español es respaldo para traducciones vacías. Información general permite editar portada, guía, preguntas frecuentes, fotos y contactos. Los precios son orientativos en USD y no procesan pagos ni reservas.

## Activar Supabase después del OK

1. Revisar `supabase/schemas/content.sql` contra el estado remoto y aplicar únicamente su delta. Son cuatro tablas nuevas con RLS, una RPC transaccional y el bucket `site-media`. No volver a aplicar `reviews.sql`. Si se genera una migración con Supabase CLI, descubrir `db diff --help` y revisar el SQL generado antes de ejecutarlo.
2. Preparar la importación local: `node scripts/content-seed.mjs --admin-email CORREO_DEL_DUEÑO`. Revisar `.local/content-seed.sql` y ejecutarlo en el proyecto correcto. Importa los tours actuales sin sobrescribir documentos existentes; confirma que el dueño existe en Auth y lo incluye en `content_admins`. No editar `auth.users` manualmente.
3. Desplegar `content-api` usando Supabase CLI. Consultar `functions deploy --help` antes de seleccionar opciones. `verify_jwt=false` permite el GET público; las operaciones de administración verifican el token con `auth.getUser` y consultan `content_admins` en cada solicitud.
4. La función reutiliza `REVIEW_ALLOWED_ORIGINS` y las variables internas de Supabase. No necesita otra clave de OpenAI, otra cuenta ni otro widget Turnstile. Mantener solo los orígenes exactos autorizados y añadir el dominio público real cuando se decida su alojamiento.
5. Confirmar importación, permisos, API pública y login antes de cambiar `.env.local` a `PUBLIC_CONTENT_ENABLED=true`. Las otras variables públicas son las mismas de reseñas. Ejecutar `npm run build`, servir `dist/` y probar con la cuenta real del dueño. Nunca incluir service_role ni secretos en PUBLIC_.
6. Ejecutar pruebas y solicitar el OK para commit/push. GitHub guarda código; Supabase guarda los cambios del dueño y las fotos. Sus copias de seguridad son independientes.

## Operación y límites

- Guardar borrador conserva publicado el contenido anterior. Publicar guarda y muestra el formulario actual. Ocultar conserva el tour y permite recuperarlo publicando otra vez.
- Se detecta conflicto si otro editor modificó el documento: no se sobrescribe. Anota tus cambios y pulsa Actualizar lista para cargar la versión actual.
- Fotos JPEG/PNG/WebP de máximo 5 MB, máximo 30 fotos por tour. Se comprueba tipo y firma de archivo; se rechazan SVG/HTML y URLs externas de imágenes. Las imágenes de turismo subidas son públicas desde su carga: evita documentos personales o contenido privado. Las fotos de reseñas siguen privadas.
- Quitar una foto de un tour cambia su galería; la imagen permanece en la biblioteca para reutilizarla. No hay borrado de archivos de biblioteca en esta fase, para evitar romper otros tours. La biblioteca muestra las 100 cargas más recientes y las imágenes usadas en tours.
- Hasta 200 tours más un documento de información general. No se ofrecen cobros ni reservas ni editor de inmuebles en esta fase.
- Los identificadores de tours existentes no cambian. Itinerario, incluidos, direcciones y textos admiten es/en/pt. Los textos son texto plano y los enlaces se validan.
- El orden del catálogo se edita con un número: los menores aparecen primero. El importador conserva el orden original; los tours nuevos van al final por defecto. Inicio muestra los primeros tours publicados de cada categoría.
- Con la conexión activa, un fallo muestra el catálogo sin tours, con opción de recargar; no vuelve a publicar los datos antiguos del repositorio. La API pública solo devuelve versiones publicadas y no entrega borradores o auditoría.
- `content_audit` registra actor, documento, acción, versión y fecha; no es una copia de versiones anteriores. Para volver a una publicación previa aún no reemplazada, se puede salir descartando el borrador o copiar la información publicada; no hay restauración histórica automática en esta fase.
- Los desarrolladores siguen modificando código/diseño. Una vez activa la API, cambiar `data/tours.json` no actualiza los tours remotos: editar mediante panel o una actualización explícita de los datos. El importador nunca reemplaza ediciones existentes.

## Verificación

```
npm test
npm run test:content:browser
npm run test:reviews:browser
npm run build
```

Las pruebas de API usan un almacén temporal; las de SQL usan PGlite. Las de navegador usan un servidor temporal, imágenes sintéticas y datos locales; no acceden a claves privadas ni modifican Supabase/GitHub. En Windows se utiliza Microsoft Edge instalado.
