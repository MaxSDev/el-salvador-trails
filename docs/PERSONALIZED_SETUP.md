# Experiencias personalizadas: implementación y activación

Fecha: 2026-10-12. Fuente del sitio: esta carpeta Mockups Diseño.

## Estado comprobado

El botón de tours.html abre personalized.html. El cuestionario incluye las 12 preguntas del cliente, ES/EN/PT, temas claro y oscuro, validación, selecciones múltiples y nacionalidades repetibles. Las respuestas sobreviven a cambios de idioma y errores de envío. Las notas de apoyo son opcionales incluso al seleccionar Sí; no se requieren diagnósticos. No se calcula una tarifa automática.

La vista local guarda una solicitud privada y una notificación pendiente en la misma operación. **No envía correos.** Las pruebas del transporte usan fetch simulado. El usuario prohibió pruebas a mario.yourtourguide503@gmail.com; cualquier futura prueba real autorizada debe usar maxgsf444@gmail.com. Mario es únicamente el destinatario previsto para producción, pendiente de activación explícita.

El esquema remoto, la función y el proveedor de correo no se han desplegado ni configurado. Abrir la página en Live Server permite llenar campos, pero guardar requiere la API. Publicar HTML en GitHub Pages por sí solo no activa el almacenamiento ni el correo.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| personalized.html | Preguntas, labels, privacidad y confirmación |
| css/personalized.css | Controles y composición intrínseca con tokens existentes |
| js/personalized.js | Condicionales, validación, envío e idempotencia |
| js/personalized-i18n.js | Textos ES/EN/PT |
| supabase/functions/_shared/personalized-policy.mjs | Contrato v1 y categorías estables |
| supabase/functions/_shared/personalized-handler.mjs | Recepción, autenticación de estadísticas y cola de notificaciones |
| supabase/functions/_shared/personalized-mail.mjs | Adaptador Resend, destinatario explícito y clave idempotente |
| supabase/functions/personalized-api/index.ts | Adaptador Supabase/Turnstile y ejecución en segundo plano |
| supabase/schemas/personalized.sql | Tablas privadas, guardado atómico, permisos, índices y agregación |
| scripts/personalized-local-store.mjs | Almacenamiento privado del entorno de prueba |
| css/about-mobile.css | Paradas móviles foto → caption → título → texto; oculta carril decorativo |

## Prueba local

Desde esta carpeta, ejecutar `npm run dev` y abrir la URL indicada por el proceso, seguida de /personalized.html. Puede fijarse PORT=8010. No se necesita proveedor de correo, cuentas externas ni CAPTCHA real.

Los registros están en .local/, ignorado por Git y excluido del build. Nunca subir esos archivos ni incluirlos en Pages. El adaptador local sirve para desarrollo: su acceso de prueba no es autenticación de producción y su cola no envía notificaciones ni recupera leases vencidos como la cola SQL.

Verificación ejecutada: 95/95 pruebas con `node --test`; PostgreSQL embebido PGlite ejecutó el esquema, permisos y RPC. Se probaron duplicados, conflictos, límites, autenticación, exclusión de información privada en estadísticas y transporte simulado. Navegador: envío local, conservación ES/EN/PT, campos obligatorios, temas y móvil. Estas pruebas no confirman entrega real de email ni despliegue Deno remoto.

## Activación futura

1. En el proyecto Supabase ya utilizado por reseñas, aplicar **una vez** supabase/schemas/personalized.sql. Requiere los roles estándar y la tabla review_admins existente. No ejecutar nuevamente el esquema de reseñas sobre un proyecto poblado.
2. Configurar secretos únicamente en el servidor: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (suministrados por Supabase), REVIEW_ALLOWED_ORIGINS, REVIEW_RATE_SALT de al menos 32 caracteres, TURNSTILE_SECRET_KEY. Los orígenes son valores exactos, por ejemplo el origen de Pages sin ruta; no usar wildcard.
3. Preparar Turnstile para los hostnames permitidos. La API verifica hostname y acción personalized; rechaza secretos de prueba en producción.
4. Desplegar personalized-api usando la configuración de supabase/config.toml. verify_jwt=false permite recepción pública; /stats y /retry-notifications verifican el usuario y su pertenencia a review_admins dentro del handler.
5. Configurar las variables públicas habituales PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY y PUBLIC_TURNSTILE_SITE_KEY; ejecutar `npm run build`. El formulario deriva /functions/v1/personalized-api desde esa configuración.
6. Para activar correo: configurar RESEND_API_KEY, PERSONALIZED_MAIL_FROM con remitente verificado y PERSONALIZED_MAIL_TO. **Mantener el destinatario de prueba maxgsf444@gmail.com hasta autorización para activar Mario.** No existe destinatario automático; faltar una variable desactiva el transporte.
7. Hacer la validación remota con datos ficticios, revisar registro y cola, comprobar receipt del proveedor y recepción en el correo de prueba. No se ha realizado este paso. Cambiar al destinatario de producción solo cuando la funcionalidad se haya comunicado y autorizado.

El correo lleva un asunto con referencia y Reply-To del visitante. Los datos viajan al proveedor elegido solo al activar el transporte. No publicar claves privadas en js/reviews-config.js, HTML o GitHub.

## API y futuras estadísticas

Base: /functions/v1/personalized-api (local: /personalized-api). Se requiere Origin permitido, también en llamadas administrativas.

- POST /submit: JSON v1, consentimiento y adulto explícitos, submission_id UUID v4 y token Turnstile. Devuelve 201 con id, status=received y localPreview. Confirma almacenamiento, no entrega de correo.
- GET /stats?from=ISO&to=ISO: Authorization Bearer de un administrador. Rango desde inclusivo hasta exclusivo, máximo 366 días.
- POST /retry-notifications: administrador autenticado y transporte configurado; procesa hasta 10 trabajos elegibles.

Respuesta de estadísticas: version=1, unit=requests, timeZone=America/El_Salvador, from, to, total, byMonth [{key,count}] y dimensions con nationality, age_range, interests, group_size, stay_length, budget y accommodation. Es directamente utilizable por gráficos futuros sin leer los contactos.

Los conteos representan **solicitudes**, no viajeros ni cotizaciones emitidas. Una solicitud puede incluir varias nacionalidades o preferencias; esas series no son partes mutuamente excluyentes de un total y pueden sumar más de 100%. No convertirlas en gráficos circulares sin explicar o transformar la unidad. Un rango mixto no da edades individuales. No inferir cantidad de viajeros desde un rango de grupo.

Las categorías son códigos estables definidos en personalized-policy.mjs; los textos traducidos nunca son claves de agrupación. El listado se amplió a 250 países/territorios más OTHER, con búsqueda tolerante a errores. Se rechazan duplicados. OTHER conserva texto obligatorio al elegirlo y sigue siendo válido para registros anteriores. Consultar PERSONALIZED_UX_2026-10-12.md para validación, borrador y sincronización del contrato.

El endpoint agregado excluye nombres, email, WhatsApp, notas de apoyo y deseos libres. Las tablas tienen RLS y permisos solo service_role; el frontend público no puede leer solicitudes. Las fechas de recepción y consentimiento se asignan en el servidor. El dashboard completo y la edición del estado administrativo quedan fuera de esta entrega.

## Notificaciones, recuperación y límites

Guardado y outbox son atómicos. La clave idempotente evita duplicar una solicitud al repetir el mismo payload/id; cambiar respuestas genera otra referencia. Límite: tres solicitudes por hash de IP en diez minutos, JSON máximo 16 KB. Turnstile y honeypot complementan ese límite.

En producción EdgeRuntime.waitUntil intenta despachar sin demorar la confirmación. La cola conserva pending/sending/sent/error, hasta cinco intentos y lease de diez minutos. Resend recibe Idempotency-Key personalizada por solicitud. El claim deja de reenviar automáticamente pasadas 23 horas desde el primer intento para permanecer dentro de la ventana de idempotencia de 24 horas del proveedor: esos casos requieren revisión manual del receipt antes de reenviar.

No se configuró un cron. Las nuevas solicitudes y el endpoint administrativo disparan procesamiento; un fallo sin nuevas solicitudes requiere el endpoint de reintento o un futuro trabajo programado. El correo es una notificación; la solicitud guardada es la fuente de verdad. No borrar registros de producción para probar. Definir con el cliente la retención y el proceso de eliminación de datos antes de operación real.

## Referencias técnicas

- [Supabase: tareas en segundo plano](https://supabase.com/docs/guides/functions/background-tasks).
- [Resend: idempotencia y ventana de 24 horas](https://resend.com/changelog/idempotency-keys).
- [Contrato OpenAPI oficial de Resend](https://github.com/resend/resend-openapi/blob/main/resend.yaml).

