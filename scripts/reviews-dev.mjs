import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { createReviewHandler, sha256 } from '../supabase/functions/_shared/review-handler.mjs';
import { localReviewStore, LOCAL_ADMIN_ID } from './reviews-local-store.mjs';
import { projectRoot, browserBundle } from './build-site.mjs';

export async function startLocalReviewPreview({ port = 8000, directory = join(projectRoot, '.local/reviews') } = {}) {
  const secret = randomBytes(32); const token = randomBytes(32).toString('hex');
  const store = await localReviewStore(directory); const sdk = await browserBundle();
  const filesRoot = join(directory, 'photos'); await mkdir(filesRoot, { recursive: true });
  let base;
  const allowedOrigins = [];
  const signature = text => createHmac('sha256', secret).update(text).digest('hex');
  function photoPath(name) {
    if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:png|jpg|webp)$/.test(name)) throw new Error('Invalid photo path');
    const path = resolve(filesRoot, name); if (!path.startsWith(resolve(filesRoot) + sep)) throw new Error('Invalid path'); return path;
  }
  const handler = createReviewHandler({
    store,
    storage: {
      upload: async (path, bytes) => { const output = photoPath(path); await mkdir(resolve(output, '..'), { recursive: true }); await writeFile(output, bytes); },
      remove: async paths => { const { unlink } = await import('node:fs/promises'); for (const path of paths) { try { await unlink(photoPath(path)); } catch (error) { if (error.code !== 'ENOENT') throw error; } } },
      signedUrl: async path => { const expiry = Math.floor(Date.now() / 1000) + 300; return `${base}/local-review-photos/${path}?expires=${expiry}&signature=${signature(path + ':' + expiry)}`; }
    },
    auth: { user: async value => value === token ? { id: LOCAL_ADMIN_ID } : null },
    hashIP: ip => sha256('local-preview:' + ip),
    verifyTurnstile: async value => value === 'local-test',
    // There is deliberately no fake external safety verdict in the local preview.
    moderate: async () => { throw new Error('Local review requires manual approval'); }
  }, { allowedOrigins });
  const user = { id: LOCAL_ADMIN_ID, aud: 'authenticated', role: 'authenticated', email: 'pruebas@local.invalid', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
  const server = createServer(async (incoming, outgoing) => {
    try {
      if (![new URL(base).host, 'localhost:' + new URL(base).port].includes(incoming.headers.host)) { outgoing.writeHead(403).end(); return; }
      const url = new URL(incoming.url, base); const origin = incoming.headers.origin;
      if (origin && ![base, base.replace('127.0.0.1', 'localhost')].includes(origin)) { outgoing.writeHead(403).end(); return; }
      if (incoming.method === 'OPTIONS') { outgoing.writeHead(204, { 'Access-Control-Allow-Origin': origin || base, 'Access-Control-Allow-Headers': 'apikey,authorization,content-type,x-client-info,x-supabase-api-version', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS' }).end(); return; }
      if (url.pathname.startsWith('/reviews-api/')) {
        const request = new Request(url, { method: incoming.method, headers: incoming.headers, ...(incoming.method !== 'GET' ? { body: Readable.toWeb(incoming), duplex: 'half' } : {}) });
        const response = await handler(request); outgoing.writeHead(response.status, Object.fromEntries(response.headers)); outgoing.end(Buffer.from(await response.arrayBuffer())); return;
      }
      if (url.pathname.startsWith('/auth/v1/')) {
        if (incoming.method === 'POST' && !origin) { outgoing.writeHead(403).end(); return; }
        let body = ''; for await (const chunk of incoming) { body += chunk; if (body.length > 8192) throw new Error('Body too large'); }
        const input = body ? JSON.parse(body) : {}; const auth = incoming.headers.authorization;
        const send = (data, status = 200) => { outgoing.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); outgoing.end(JSON.stringify(data)); };
        if (url.pathname.endsWith('/token')) {
          const correct = input.email === user.email && input.password === 'resenas-local';
          if (!correct && !(url.searchParams.get('grant_type') === 'refresh_token' && input.refresh_token === token)) { send({ msg: 'Invalid login credentials', error_code: 'invalid_credentials' }, 400); return; }
          send({ access_token: token, refresh_token: token, expires_in: 3600, token_type: 'bearer', user }); return;
        }
        if (auth !== 'Bearer ' + token) { send({ msg: 'Unauthorized' }, 401); return; }
        if (url.pathname.endsWith('/user')) { send(user); return; }
        if (url.pathname.endsWith('/logout')) { send({}); return; }
        send({ msg: 'Password recovery is not available in local preview' }, 400); return;
      }
      if (url.pathname.startsWith('/local-review-photos/')) {
        const name = url.pathname.slice('/local-review-photos/'.length); const expiry = Number(url.searchParams.get('expires'));
        const provided = url.searchParams.get('signature') || ''; const expected = signature(name + ':' + expiry);
        if (expiry < Date.now() / 1000 || expiry > Date.now() / 1000 + 301 || provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) { outgoing.writeHead(403).end(); return; }
        const content = await readFile(photoPath(name));
        outgoing.writeHead(200, { 'Content-Type': mime[extname(name)], 'Cache-Control': 'private,no-store', 'X-Content-Type-Options': 'nosniff' }); outgoing.end(content); return;
      }
      if (incoming.method !== 'GET' && incoming.method !== 'HEAD') { outgoing.writeHead(405).end(); return; }
      if (url.pathname === '/js/reviews-config.js') {
        outgoing.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
        outgoing.end('window.ESTReviewsConfig = Object.freeze(' + JSON.stringify({ apiBaseUrl: base + '/reviews-api', supabaseUrl: base, publishableKey: 'sb_publishable_local_preview_only', localPreview: true, turnstileSiteKey: '' }) + ');'); return;
      }
      if (url.pathname === '/admin/supabase-client.js') { outgoing.writeHead(200, { 'Content-Type': 'text/javascript' }); outgoing.end(sdk); return; }
      let name = decodeURIComponent(url.pathname).slice(1); if (!name || name === 'admin/') name += 'index.html';
      const parts = name.split('/');
      if (parts.some(part => part.startsWith('.') || part.includes('\\')) || !(parts.length === 1 && name.endsWith('.html') || ['css', 'js', 'assets', 'data', 'admin'].includes(parts[0]))) { outgoing.writeHead(404).end(); return; }
      const target = await realpath(resolve(projectRoot, name));
      if (!target.startsWith(resolve(projectRoot) + sep)) { outgoing.writeHead(404).end(); return; }
      const content = await readFile(target); outgoing.writeHead(200, { 'Content-Type': mime[extname(name).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); outgoing.end(content);
    } catch (error) { if (!outgoing.headersSent) outgoing.writeHead(error.code === 'ENOENT' ? 404 : 500); outgoing.end('No disponible'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
  allowedOrigins.push(base, base.replace('127.0.0.1', 'localhost'));
  return { server, url: base };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const result = await startLocalReviewPreview({ port: Number(process.env.PORT || 8000) });
  console.log(`Prueba local: ${result.url}/ | Panel: ${result.url}/admin/`);
  console.log('Acceso de prueba: pruebas@local.invalid / resenas-local. Sin servicios externos.');
}
