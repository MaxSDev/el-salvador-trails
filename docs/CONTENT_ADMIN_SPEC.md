# Panel de contenido

El dueño administra tours, alojamientos, negocios aliados, imágenes y textos seleccionados sin editar código. Se conserva el catálogo actual y sus tres idiomas (es/en/pt). El diseño, pagos y reservas siguen siendo desarrollo en código; Bienes Raíces gestiona alojamientos y aliados, sin inventar un catálogo de propiedades en venta.

Cada tour tiene borrador y versión publicada separados. Guardar no cambia la página pública; Publicar valida y reemplaza su versión pública; Ocultar retira el tour del catálogo sin borrarlo. Una versión numérica evita sobrescribir cambios de otro editor. Los cambios quedan registrados con actor y fecha.

El panel usa Supabase Auth y una lista independiente de administradores de contenido. Solo el servidor autorizado modifica datos y sube imágenes JPEG/PNG/WebP de máximo 5 MB. Las imágenes de contenido turístico son públicas y no deben contener información privada. Las reseñas conservan su almacenamiento privado y sus permisos actuales.

Los campos editables incluyen título, descripciones, duración, grupo, recogida, incluidos, destacados, itinerario, punto de encuentro, mapa, video, fotos, orden del catálogo y precio informativo en USD (opcional, por persona o por grupo). La cotización sigue siendo por WhatsApp/correo: no se calcula ni cobra una reserva.

Información general: títulos y descripciones de las cuatro diapositivas, presentación del guía, preguntas frecuentes, imágenes de portada/guía y contactos (WhatsApp, correo y redes). Cada texto admite traducciones manuales; español es el idioma de respaldo.

Una bandera de configuración activa el catálogo remoto después de preparar Supabase. Mientras está desactivada, la página conserva el catálogo original. Una vez activada, un fallo de conexión no vuelve a mostrar tours ocultados desde archivos antiguos. La importación inicial es idempotente y nunca reemplaza ediciones de los dueños.

Primero se entrega una prueba local. Actualizar Supabase y hacer commit/push necesitan el OK del usuario, que pidió esos puntos de revisión. No hacen falta nuevas cuentas ni compartir contraseñas.

## Revisión de interfaz — reunión del 14 de octubre

El inicio del panel separa Tours, Bienes Raíces y Reseñas; Información del sitio es un acceso secundario. La edición se divide en Datos básicos, Fotos, Detalles y Vista previa, con guardado de borrador disponible en todos los pasos y publicación únicamente en el último. Se puede abrir una vista previa mientras se escribe; la actualización se limita en el navegador y no hace guardados automáticos.

La vista previa utiliza las páginas públicas dentro de una ventana integrada, verifica origen, ventana y sesión efímera, y recibe exclusivamente el contenido necesario. No recibe credenciales ni ofrece un endpoint público de borradores. Los controles de envío están desactivados. Permite computadora/celular, tarjeta/detalle del tour e Inicio/Bienes Raíces para información general.

Los aliados reutilizan documentos con kind=partner e identificador partner-<slug>. Su importación parte del Art Haus actualmente publicado con sus 16 fotos y traducciones, conserva el ancla art-haus y no sobrescribe ediciones existentes. Imágenes y descripciones permanecen alineadas al cambiar su orden. Los tours conservan los metadatos de origen, extras y condiciones ya existentes.

La revisión manual está activa por defecto para nuevas instalaciones y en la prueba local. La configuración remota existente requiere aplicar exclusivamente el cambio revisado de docs/REVIEW_MANUAL_MODE_DELTA.sql después de autorización; abrir el panel no cambia la configuración del servidor. La automatización anterior permanece preparada para una decisión futura.
