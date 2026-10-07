import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { join, resolve, sep, extname } from 'node:path';
import { projectRoot } from './build-site.mjs';

const directory = resolve(projectRoot, 'dist');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
await readFile(join(directory, 'index.html')); // Build first; do not serve repository/private files as a fallback.
createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const url = new URL(request.url, 'http://127.0.0.1');
    let name = decodeURIComponent(url.pathname).slice(1); if (!name || name.endsWith('/')) name += 'index.html';
    if (name.split('/').some(part => part.startsWith('.') || part.includes('\\'))) { response.writeHead(404).end(); return; }
    const path = await realpath(resolve(directory, name));
    if (!path.startsWith(directory + sep)) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': mime[extname(name).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(await readFile(path));
  } catch { response.writeHead(404).end('No disponible'); }
}).listen(Number(process.env.PORT || 8001), '127.0.0.1', () => console.log(`Web con configuración real: http://127.0.0.1:${process.env.PORT || 8001}/`));
