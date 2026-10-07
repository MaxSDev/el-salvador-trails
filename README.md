# El Salvador Trails

Sitio web estático de El Salvador Trails, con catálogo de experiencias, contenido bilingüe y recursos responsive en AVIF y WebP.

## Desarrollo local

Requisitos para las reseñas y el panel: Node.js 24.

```powershell
npm install
npm test
python -m http.server 8000 --bind 127.0.0.1
```

Después, abre `http://127.0.0.1:8000/`.

## Reseñas y moderación

Para probar reseñas y el panel sin servicios externos:

```powershell
npm run dev
```

Web: `http://127.0.0.1:8000/`. Panel: `http://127.0.0.1:8000/admin/`.
Acceso exclusivamente local: `pruebas@local.invalid` / `resenas-local`.
Los envíos de esta prueba quedan pendientes hasta aprobarlos. No se envían a la empresa ni se usan como testimonios reales.

La conexión con Supabase, Turnstile y OpenAI, y las comprobaciones antes de publicar, se explican en [docs/REVIEWS_SETUP.md](docs/REVIEWS_SETUP.md).

`npm run build` genera `dist/` con solo archivos públicos. `npm run preview` sirve ese build en el puerto 8001 con la configuración real; `npm run dev` siempre usa datos privados locales de prueba.

## Imágenes

Los originales se conservan dentro de `assets/`. Para regenerar las variantes optimizadas y el manifiesto responsive:

```powershell
npm run images:optimize
npm run media:check
```

El progreso del rediseño y sus puntos de aprobación se documentan en `docs/IMPLEMENTATION_PROGRESS.md`.
