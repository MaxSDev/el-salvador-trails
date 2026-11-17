# Panel guiado y vista previa — plan de implementación

**Objetivo:** aplicar la retroalimentación de Mario y Ellen del 14 de octubre: módulos separados, edición clara, vista previa fiel y revisión manual; añadir administración de alojamientos y aliados.

**Arquitectura:** HTML/CSS/JavaScript existentes, Supabase Auth compartida, documentos de contenido con borrador/publicación/versiones y un iframe de vista previa sin credenciales. La primera entrega es local.

## Restricciones

- Conservar cambios pendientes y datos locales; copia inicial en `.local/admin-before-2026-10-15`.
- No hacer commit, push ni desplegar sin autorización explícita.
- Mantener permisos separados para contenido y reseñas y preservar los cambios incorporados de gh-pages.
- No publicar borradores ni inventar precios, reservas o características de alojamientos.

## Tareas

- [x] Separar inicio, Tours, Bienes Raíces, Reseñas e Información del sitio; centralizar sesión y recuperación.
- [x] Implementar editor de cuatro pasos, portada/orden de fotos, traducciones, estados y protección de cambios.
- [x] Incorporar aliados al contrato de contenido y al almacenamiento local/SQL, conservando borradores y permisos.
- [x] Importar Art Haus actual con 16 fotos e idiomas sin sobrescribir contenido existente.
- [x] Conectar vista previa al render público para tours, alojamientos e información general; desactivar envíos dentro de la vista previa.
- [x] Activar revisión manual inicial local y preparar el cambio remoto por separado.
- [x] Completar pruebas de API, PostgreSQL, navegador, build y revisión visual: 121 pruebas y ambos recorridos de navegador correctos.
- [x] Preparar capturas y video con datos de prueba en `.local/admin-review-2026-10-15`.
- [x] Mantener disponible el servidor local en el puerto 8002. Verificado HTTP 200, 13 tours, Art Haus con 16 fotos y revisión manual activa; los 14 documentos anteriores y su auditoría se conservaron.
