import { join } from 'node:path';
import { startLocalReviewPreview } from './reviews-dev.mjs';
import { projectRoot } from './build-site.mjs';
const preview = await startLocalReviewPreview({port:Number(process.env.PORT || 8002),directory:join(projectRoot,'.local/content-preview')});
console.log(`Prueba local: ${preview.url}/ | Panel: ${preview.url}/admin/`);
console.log('Acceso local: pruebas@local.invalid / resenas-local. Los datos no se suben a Supabase.');
