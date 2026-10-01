# El Salvador Trails

Sitio web estático de El Salvador Trails, con catálogo de experiencias, contenido bilingüe y recursos responsive en AVIF y WebP.

## Desarrollo local

Requisitos: Node.js 18 o posterior.

```powershell
npm install
npm test
python -m http.server 8000 --bind 127.0.0.1
```

Después, abre `http://127.0.0.1:8000/`.

## Imágenes

Los originales se conservan dentro de `assets/`. Para regenerar las variantes optimizadas y el manifiesto responsive:

```powershell
npm run images:optimize
npm run media:check
```

El progreso del rediseño y sus puntos de aprobación se documentan en `docs/IMPLEMENTATION_PROGRESS.md`.
