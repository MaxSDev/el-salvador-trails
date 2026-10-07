# Reseñas: revisión local y conexión de servicios

Esta fase agrega reseñas y un panel de moderación. Tours, cotizaciones y edición general del contenido siguen fuera de esta entrega.

## Estado del entorno de pruebas — 7 de octubre de 2026

Con autorización del usuario se conectó `el-salvador-trails-dev` (`pxcldhrknpihheuinsxn`): el esquema inicial y la actualización de borrado ya están aplicados, las siete tablas tienen RLS, el bucket `review-photos` es privado y `reviews-api` está desplegada. No volver a ejecutar el esquema inicial en este proyecto.

Los registros públicos y los accesos anónimos de Supabase Auth están desactivados. El panel usa las URLs locales del puerto 8001. Los cuatro secretos requeridos están guardados en Supabase; sus valores privados no están en el repositorio.

La vista previa con servicios reales es `http://127.0.0.1:8001/` y su panel es `http://127.0.0.1:8001/admin/`. `npm run build` seguido de `npm run preview` prepara este modo. El puerto 8000 sigue siendo la prueba exclusiva en archivos locales y sus credenciales de prueba no sirven en Supabase.

Se comprobaron el listado real, CORS, el rechazo de administradores sin sesión y de envíos sin CAPTCHA, así como las protecciones de las tablas y del almacenamiento. El formulario omite el archivo vacío que el navegador genera cuando no se adjuntan fotos; Supabase/Deno interpreta ese campo vacío de forma diferente al servidor local. La prueba de navegador cubre envíos sin fotos y con una foto.

El usuario completó un envío real de texto limpio y comprobó su publicación. La cuenta administradora elegida ya está confirmada y autorizada, y el usuario probó su acceso. No se han importado las reseñas locales de ejemplo, enviado invitaciones ni publicado el sitio. El usuario autorizó guardar y subir esta fase en la rama `feature/reviews-moderation`.

El borrado definitivo está implementado y habilitado con el OK del usuario. Se aplicó únicamente el bloque final del esquema que crea `review_photo_deletions` y `delete_guest_review`, con sus permisos, y se volvió a desplegar `reviews-api` antes de reconstruir la web. El botón se llama “Borrar” y la confirmación aclara que elimina la reseña y sus fotos. La prueba de navegador verificó cancelar y confirmar; una comprobación en Supabase con rollback verificó la eliminación y los permisos sin modificar las reseñas existentes. También se comprobó CORS para DELETE y el rechazo del borrado sin sesión. No volver a ejecutar la actualización ni todo el esquema inicial en este proyecto.

## Lo que ya puedes revisar

La fase se entrega en la rama `feature/reviews-moderation`. Las reseñas de Home aparecen después de las categorías de viajes y antes de las historias en video.

Para otro colaborador, actualizar el repositorio y cambiar a esa rama antes de seguir las instrucciones. `.env.local`, las claves privadas, las sesiones y los datos de prueba no se suben a GitHub. La prueba local funciona con `npm install` y `npm run dev`; para usar los servicios reales, completar los tres valores públicos de `.env.example` en un archivo `.env.local` y utilizar una cuenta autorizada para el panel. Las cuentas y los secretos ya configurados en Supabase se administran por separado.

- Web de prueba: `http://127.0.0.1:8000/`
- Panel de prueba: `http://127.0.0.1:8000/admin/`
- Acceso **solo de prueba local**: `pruebas@local.invalid` / `resenas-local`.

Entra a “Comparte tu experiencia”, envía una reseña y apruébala desde el panel. Al actualizar la página aparecerá en el mural. Después prueba ocultarla o borrarla definitivamente. Las fotos se guardan en una carpeta privada y necesitan aprobación.

La prueba local usa el mismo formulario, reglas y manejador que producción, con un adaptador de archivos y autenticación exclusivo para desarrollo. **No conecta Supabase, Turnstile ni OpenAI y no simula un dictamen seguro de IA:** todo comentario queda pendiente hasta que lo apruebes. El límite es de tres envíos nuevos por diez minutos.

Los datos de la prueba se guardan en `.local/reviews/`, que Git ignora. No son testimonios reales para el sitio público. La base de datos de producción comienza vacía.

## Qué haces tú y qué prepara el desarrollador

### 1. Crear Supabase — tú

1. Entra a https://supabase.com/dashboard y regístrate con GitHub.
2. Crea una organización para las pruebas en el plan Free.
3. Crea el proyecto `el-salvador-trails-dev`. Guarda su contraseña de base de datos en tu gestor de contraseñas; no hace falta enviarla al desarrollador.
4. Cuando termine de crearse, busca el **Project URL** y la **publishable key** (`sb_publishable_…`) en Connect o Settings → API Keys.

Estos dos valores son públicos y pueden comunicarse al desarrollador. No compartas la clave `sb_secret_…`, la clave `service_role`, la contraseña de base de datos ni un token personal en el chat.

### 2. Crear Turnstile — tú

1. Entra a https://dash.cloudflare.com con tu cuenta de GitHub.
2. Abre Turnstile y crea un widget llamado `El Salvador Trails - pruebas`.
3. Selecciona el modo Managed. Para las pruebas con servicios reales, añade `localhost` y `127.0.0.1` a los hostnames. Más adelante se añadirá el hostname exacto del sitio público.
4. La **site key** es pública. La **secret key** se guarda únicamente en los secretos de la función de Supabase.

No es necesario contratar hosting, cambiar DNS ni añadir un dominio a Cloudflare para usar Turnstile. No usar claves de prueba de Cloudflare en el servidor desplegado.

### 3. Crear acceso a OpenAI API — tú

1. Entra a https://platform.openai.com/ y crea un proyecto técnico para estas pruebas.
2. Crea una API key del proyecto. La API de moderación es gratuita actualmente, aunque la cuenta tiene sus propios límites y requisitos de acceso.
3. Guarda la clave únicamente como `OPENAI_API_KEY` en los secretos de Supabase. Una suscripción de ChatGPT no reemplaza la configuración de la API.

No se pedirán cuentas de OpenAI, Google, Supabase ni Cloudflare a los turistas. Son servicios del equipo que mantiene la web.

### 4. Conectar los servicios — desarrollador, después de tu OK

No ejecutar esta sección hasta que hayas revisado la prueba local y autorizado la configuración del proyecto de pruebas. No afecta la web actual de GitHub Pages.

**Configuración pública local**: crea `.env.local` a partir de estas tres líneas y completa solo los valores públicos:

```dotenv
PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
PUBLIC_TURNSTILE_SITE_KEY=...
```

El compilador solo incluye esos tres valores. Rechaza claves privadas y no incorpora `.env`, scripts, SQL, documentos ni reseñas de prueba a `dist/`.

**Base de datos**: el origen del esquema es `supabase/schemas/reviews.sql`, con flujo declarativo configurado en `supabase/config.toml`. En un proyecto nuevo y vacío se puede ejecutar ese archivo completo una única vez desde SQL Editor. No volver a ejecutarlo sobre tablas existentes; para cambios posteriores generar y revisar migraciones mediante el CLI antes de aplicarlas.

**Administradores**: desactiva “Allow new users to sign up” y el acceso anónimo en Supabase Auth. Configura Site URL y Redirect URLs para `http://127.0.0.1:8001/admin/`, `http://localhost:8001/admin/` y, al publicar, el `/admin/` HTTPS definitivo.

En el proyecto de pruebas, el responsable puede crear su propia cuenta desde Authentication → Users → Add user → Create new user, definir una contraseña privada de al menos 12 caracteres y marcar Auto Confirm User para su correo de prueba. Esto no habilita permisos de moderador: todavía hay que añadir la cuenta a `review_admins` con autorización del responsable. Nunca pedir contraseñas en el chat ni crear contraseñas públicas predeterminadas para cuentas reales.

Las invitaciones por correo y la recuperación de contraseñas necesitan entrega de correo configurada. El SMTP predeterminado de Supabase solo entrega a miembros del equipo del proyecto. Para otros correos y para producción, configurar SMTP propio antes de usar Invite User o recuperación. Documentación: https://supabase.com/docs/guides/auth/auth-smtp. Enviar invitaciones solo con autorización explícita.

Cuando exista cada usuario, ejecuta en SQL Editor (reemplazando el correo):

```sql
insert into public.review_admins (user_id)
select id from auth.users where email = 'CORREO_REAL_DEL_ADMIN'
on conflict do nothing;
```

Si no inserta ninguna fila, el usuario todavía no existe. No crear una política que permita a los usuarios añadirse solos a esta lista.

**Secretos de Edge Functions**: configura en Supabase Dashboard → Edge Functions → Secrets:

```dotenv
TURNSTILE_SECRET_KEY=...
OPENAI_API_KEY=...
REVIEW_RATE_SALT=...
REVIEW_ALLOWED_ORIGINS=http://127.0.0.1:8001,http://localhost:8001
```

`REVIEW_RATE_SALT` debe tener al menos 32 caracteres aleatorios. Supabase proporciona `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` internamente. No copiarlos al frontend. Al publicar, sustituir los orígenes de desarrollo por el origen HTTPS exacto del sitio; no usar `*`.

**Función**: instalar/utilizar el CLI de Supabase con Node.js 24, comprobar sus comandos con `--help`, iniciar sesión y desplegar `supabase/functions/reviews-api` en el proyecto de pruebas. La configuración `verify_jwt = false` es necesaria porque los visitantes no tienen cuenta; las operaciones administrativas verifican el token con `auth.getUser` y consultan la lista vigente de administradores en cada petición. Nunca reemplazar eso por decodificar el JWT sin comprobarlo.

```powershell
npx supabase@2.120.0 --help
npx supabase@2.120.0 login
npx supabase@2.120.0 functions deploy reviews-api --project-ref PROJECT_REF --use-api --no-verify-jwt
npm run build
npm run preview
```

La web con conexión real se abre en `http://127.0.0.1:8001/`. `npm run dev` sigue siendo exclusivamente la prueba local sin servicios; no confundir ambos modos.

## Reglas de publicación

- Nombre 2–80 caracteres; país opcional hasta 80; comentario 20–2.000; calificación entera 1–5.
- Consentimiento obligatorio y guardado con fecha y versión `reviews-v1`.
- Hasta cuatro fotos JPEG, PNG o WebP, máximo 5 MB cada una. El servidor revisa MIME y firma de archivo.
- Comprobación Turnstile obligatoria en el servidor, con acción `review` y hostname autorizado.
- Texto limpio, sin fotos, con moderación externa exitosa: publicado automáticamente.
- Groserías, enlaces, datos de contacto, idioma no cubierto, fotos, modo manual o fallo de moderación: pendiente y privado.
- El filtro de vocabulario es una ayuda, no una lista completa de todos los insultos. Moderation detecta contenido dañino; no demuestra que un viajero sea real ni que toda reseña sea relevante.
- Las críticas negativas respetuosas son válidas. No fabricar testimonios ni cambiar el texto de los visitantes al moderarlo.
- Las fotos usan URLs firmadas de cinco minutos. Después de ocultar una reseña, una URL ya emitida puede seguir funcionando hasta que venza.
- Los reintentos usan el mismo ID. Si no sabemos si un guardado terminó, no borramos fotos que podrían pertenecer a la reseña guardada.
- Nunca leer las tablas privadas directamente desde el navegador de un visitante. Los RPC de escritura solo tienen permiso para `service_role`.

## Comprobaciones antes de darlo por conectado

1. Enviar una reseña sin fotos desde la web real y comprobar el guardado y dictamen del proveedor.
2. Verificar que una reseña ofensiva queda pendiente y que un fallo de OpenAI también la retiene.
3. Enviar fotos: no deben aparecer en el listado público ni abrirse sin una URL autorizada antes de aprobarlas.
4. Entrar con un administrador, aprobar y ocultar; repetir con una cuenta no autorizada y comprobar el rechazo.
5. Probar Turnstile real, token vencido/reutilizado, límites de envíos y reintentos de red.
6. Confirmar contactos y texto de privacidad con los dueños antes de recoger reseñas reales.
7. Documentar responsable de mantenimiento, exportación de la base y respaldo separado de archivos. Las copias de base de Supabase no incluyen las fotos.

## Ocultar y borrar definitivamente

“Ocultar” conserva la reseña y permite publicarla de nuevo. “Borrar” está disponible en todas las categorías del panel y pide confirmación del borrado definitivo: elimina el texto, los datos del autor y los registros de sus fotos. La versión se comprueba dentro de la transacción para evitar borrar una reseña que otra persona acaba de cambiar. Solo un administrador vigente puede solicitar esta operación; el navegador nunca recibe permisos de borrado directo en las tablas o en Storage.

Las fotos se eliminan mediante la API de Storage, después de guardar sus rutas en una cola privada dentro de la misma transacción que borra la reseña. Si Storage falla, el panel informa que las fotos siguen pendientes y “Actualizar lista” reintenta su eliminación, hasta doce tareas por carga. No se anuncia un borrado completo mientras la limpieza siga pendiente. Se conserva únicamente una entrada de auditoría con administrador, fecha e identificador del borrado, sin texto, autor ni fotos. La opción no restaura reseñas borradas.

Si un envío falla durante la confirmación de una transacción, puede quedar un archivo privado sin referencia. Después de restablecer la conexión, el desarrollador debe comprobar reseñas y referencias antes de borrar archivos huérfanos de más de 24 horas. No borrar carpetas completas sin esa comprobación.

## Verificación local y entrega

```powershell
npm install
npm test
npm run test:reviews:browser
npm run build
npm run dev
```

Las pruebas de navegador usan Microsoft Edge instalado en Windows; en otro entorno instalar un navegador de Playwright o definir `REVIEWS_BROWSER_PATH`. Las pruebas externas requieren el proyecto configurado y no se simulan con las locales.

Una vez aprobada la fase y la conexión real: revisar el diff, hacer commit y push con tu OK. Desplegar funciones/esquema y publicar la web son operaciones separadas del push.

Para Cloudflare Pages, el build será `npm run build` y la carpeta pública `dist`. Solo se publicará después de revisar el entorno de pruebas. Supabase de producción y todas las cuentas del negocio quedarán bajo control de los dueños.
