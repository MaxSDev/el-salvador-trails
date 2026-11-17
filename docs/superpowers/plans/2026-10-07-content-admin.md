# Content Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. El usuario ya autorizó implementar localmente; las publicaciones externas requieren su OK.

**Goal:** Permitir administrar tours, imágenes y contenido general con borradores y publicación explícita.

**Architecture:** API content-api independiente de reseñas con validación compartida, autenticación verificada y allowlist content_admins. Documentos con draft/published/version y RPC transaccional; adaptadores Supabase y local usan el mismo contrato. El frontend consume exclusivamente versiones publicadas al activar PUBLIC_CONTENT_ENABLED.

**Tech Stack:** HTML/CSS/JavaScript, Node 24, Supabase Postgres/Auth/Storage/Edge Functions, PGlite y Playwright existentes.

**Spec:** docs/CONTENT_ADMIN_SPEC.md

## Global Constraints

- Sin cambios externos ni push antes del OK del usuario.
- No nuevas dependencias; nunca claves privadas en frontend.
- Tres idiomas y catálogo original preservados.
- Imágenes máximo 5 MB, JPEG/PNG/WebP; almacenamiento turístico público.
- RLS en todas las tablas nuevas; RPC solo service_role con verificación de actor.
- Guardar borrador no modifica contenido publicado; conflictos devuelven 409.

### Task 1: Persistencia y API

**Files:** supabase/schemas/content.sql; supabase/functions/_shared/content-policy.mjs, content-handler.mjs, supabase-content-adapter.mjs; supabase/functions/content-api/index.ts; scripts/content-local-store.mjs; scripts/content-api.test.mjs, content-database.test.mjs.

- [x] Escribir pruebas de borradores/publicación/ocultación, conflicto, acceso denegado y datos peligrosos; ejecutar y comprobar fallo.
- [x] Implementar validación de contenido y archivos, RPC con bloqueo/versionado, allowlist y registro de cambios.
- [x] Implementar endpoints GET /public, GET /admin, POST /admin, POST /media; adaptadores con el mismo comportamiento y limpieza si falla la carga.
- [x] Ejecutar pruebas de API y SQL reales en PGlite y resolver fallos.

### Task 2: Panel y sitio público

**Files:** admin/content.html, content-admin.js, content-admin.css; admin/index.html; js/content-client.js, content-loader.js; js/home.js, tours.js, script.js; HTML públicos; scripts/reviews-dev.mjs, build-site.mjs; .env.example.

- [x] Crear formularios de tours con idiomas, itinerario y selección/carga/reordenación de imágenes, estados y avisos claros.
- [x] Crear editor de información general y reutilizar sesión del panel de reseñas, con cambios sin guardar protegidos.
- [x] Conectar catálogo y contenidos con readiness, sin reintroducir catálogo estático cuando falla la API activa.
- [x] Escapar campos en HTML y validar URLs; usar precio informativo y contactos configurados al cotizar.
- [x] Ampliar compilación y vista local, manteniendo API remota desactivada hasta el despliegue aprobado.

### Task 3: Verificación y entrega

**Files:** scripts/content-e2e.mjs; scripts/content-seed.mjs; docs/CONTENT_SETUP.md; package.json.

- [x] Probar en navegador crear/guardar/publicar/editar/ocultar, imágenes, textos, traducciones, permisos, sesión compartida y móvil.
- [x] Ejecutar suite existente y build sin secretos; comprobar reseñas conservan funcionamiento.
- [x] Preparar importación SQL idempotente y documentación de conexión/despliegue, sin ejecutarla remotamente.
- [x] Dejar preview local funcionando y explicar al usuario cómo probarlo. Pedir OK para el paso externo concreto; commit/push pendientes de aprobación.

## Local verification completed

- 87 pruebas de la suite existente y nuevas pasan; pruebas adicionales de importación y orden pasan.
- Navegador: panel, fotos de galería/portada, precios, borradores, publicaciones, ocultación, XSS, traducciones, contactos, sesión compartida y móvil pasan.
- Navegador de reseñas: envío, moderación, fotos, privacidad, borrado y móvil pasan.
- Build sin secretos confirmado; preview local de contenido en http://127.0.0.1:8002/.
- Supabase, commit y push quedan pendientes del OK explícito del usuario.
