# Integrar gh-pages con el panel de contenido

> **Para agentes de implementación:** ejecutar en esta sesión de forma secuencial y conservar cada punto de control.

**Objetivo:** actualizar la rama local con `origin/gh-pages` y reponer el panel de administración de contenido sin perder su código ni los tours locales de prueba.

**Arquitectura:** el cambio remoto entra primero como avance de la rama, pues el commit local es ancestro de `origin/gh-pages`. Los cambios rastreados y archivos nuevos del panel se guardan temporalmente con Git, se avanza la rama y se restauran para resolver los solapamientos sobre la versión remota. Los datos ignorados de `.local/content-preview` permanecen fuera del proceso.

**Tecnología:** Git, Node.js, npm, HTML/CSS/JavaScript y Supabase local de desarrollo.

**Referencia:** `docs/CONTENT_SETUP.md` y `docs/CONTENT_ADMIN_SPEC.md`.

## Límites globales

- No borrar ni sobrescribir el estado local del panel ni los datos de `.local/content-preview`.
- No ejecutar cambios en Supabase.
- No crear un commit nuevo, hacer push ni desplegar sin autorización explícita.
- Revisar los solapamientos antes de resolverlos y conservar los cambios de ambos lados.
- Verificar build y pruebas del panel después de restaurar sus cambios.

---

### Tarea 1: Preservar el panel y confirmar el estado de los tours de prueba

**Archivos:** ningún archivo de aplicación; el estado de Git puede guardarse en un stash recuperable.

- [x] Confirmar `HEAD`, rama actual y estado del árbol de trabajo.
- [x] Confirmar que `.local/content-preview` sigue presente y que su contenido no está bajo seguimiento de Git.
- [x] Guardar con `git stash push --include-untracked` solo los cambios de trabajo, anotando el identificador del stash.

### Tarea 2: Actualizar la rama local

**Archivos:** los que ya forman parte del commit `origin/gh-pages`.

- [x] Avanzar `feature/reviews-moderation` hasta `origin/gh-pages`, sin crear un commit de merge.
- [x] Confirmar que `HEAD` quedó en `d2e77bf` y que el árbol rastreado está limpio antes de reponer los cambios.

### Tarea 3: Restaurar el panel y resolver los ocho solapamientos

**Archivos:** `about.html`, `index.html`, `js/tours.js`, `real-estate.html`, `scripts/reviews-dev.mjs`, `supabase/config.toml`, `tours.html`, `.env.example`; además, todos los archivos nuevos del panel guardados en el stash.

- [x] Aplicar el stash sin eliminarlo automáticamente.
- [x] Resolver cualquier conflicto manteniendo la actualización visual, de tours, bienes raíces y formulario remoto junto con la integración del panel.
- [x] Confirmar que el panel conserva categorías, títulos con mayúsculas, normalización de enlaces y sincronización de imagen principal.
- [x] Confirmar que los tours de prueba locales siguen en `.local` y no aparecen como cambios para Git.

### Tarea 4: Verificar el resultado local

**Archivos:** scripts y páginas integrados; sin cambios de datos remotos.

- [x] Ejecutar el build configurado en `package.json`.
- [x] Ejecutar `npm test` (102 pruebas) y `npm run test:content:browser`.
- [x] Revisar el diff final; no hay conflictos ni errores de whitespace, y los datos de `.local/content-preview` se mantuvieron intactos.

### Tarea 5: Entregar para revisión

- [x] Resumir archivos integrados, pruebas y cualquier limitación.
- [x] Detenerse antes de `git commit`, `git push` y cualquier despliegue; mostrar el resultado para autorización.
