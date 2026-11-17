import { ContentError, identifier, validateTour, validatePartner, validateSite } from './content-policy.mjs';
import { validatePhotos } from './review-policy.mjs';

export function createContentHandler({ store, auth, storage }, { allowedOrigins = [], mediaOrigin = '', reportError = () => {} } = {}) {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    if (origin && allowedOrigins.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const send = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    try {
      if (origin && !allowedOrigins.includes(origin)) throw new ContentError('Origen no autorizado.', 403);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' } });
      const path = new URL(request.url).pathname.replace(/^.*\/content-api/, '');
      if (request.method === 'GET' && path === '/public') {
        const rows = (await store.list()).filter(row => row.status === 'published' && row.published);
        const published = kind => rows.filter(d => d.kind === kind).map(d => d.published).sort((a,b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
        return send({ tours: published('tour'), partners: published('partner'), site: rows.find(d => d.kind === 'site')?.published || {} });
      }
      let user;
      try { user = await auth.user((request.headers.get('authorization') || '').replace(/^Bearer /, '')); } catch { /* Invalid tokens don't disclose auth details. */ }
      if (!user?.id) throw new ContentError('Inicia sesión para entrar al panel.', 401);
      const allowed = !!await store.isAdmin(user.id);
      if (request.method === 'GET' && path === '/access') return send({ allowed });
      if (!allowed) throw new ContentError('Tu cuenta no tiene permiso para editar el contenido.', 403);
      if (request.method === 'GET' && path === '/admin') return send({ documents: await store.list(), media: await store.media() });
      if (request.method !== 'POST' || !['/admin', '/media'].includes(path)) throw new ContentError('Ruta no disponible.', 404);
      if (!origin || !allowedOrigins.includes(origin)) throw new ContentError('Origen no autorizado.', 403);
      // Bound the body while streaming; Content-Length alone is untrusted.
      const max = path === '/media' ? 5 * 1024 * 1024 + 8192 : 128 * 1024;
      if (Number(request.headers.get('content-length')) > max) throw new ContentError('Archivo o contenido demasiado grande.', 413);
      const reader = request.body?.getReader(); const chunks = []; let size = 0;
      if (reader) { for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > max) { await reader.cancel(); throw new ContentError('Archivo o contenido demasiado grande.', 413); } chunks.push(value); } }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const parsed = new Request(request.url, { method: 'POST', headers: request.headers, body: bytes });
      if (path === '/media') {
        let photos;
        try { const form = await parsed.formData(); const file = form.get('file'); if (!file || typeof file === 'string') throw new Error(); photos = await validatePhotos([file]); } catch { throw new ContentError('Sube una imagen JPEG, PNG o WebP válida de máximo 5 MB.'); }
        const photo = photos[0]; const name = crypto.randomUUID() + '.' + photo.extension;
        await storage.upload(name, photo.bytes, photo.mime);
        const item = { path: name, url: storage.publicUrl(name), created_at: new Date().toISOString() };
        try { await store.addMedia(user.id, item); } catch (e) { await storage.remove([name]); throw e; }
        return send({ media: item });
      }
      let input; try { input = await parsed.json(); } catch { throw new ContentError('Contenido inválido.'); }
      if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ContentError('Contenido inválido.');
      identifier(input.id);
      if (!['tour', 'partner', 'site'].includes(input.kind) || (input.kind === 'site' && input.id !== 'site') || (input.kind === 'tour' && (input.id === 'site' || input.id.startsWith('partner-'))) || (input.kind === 'partner' && !input.id.startsWith('partner-')) || !['save', 'publish', 'hide', 'delete'].includes(input.action) || !Number.isSafeInteger(input.version) || input.version < 0) throw new ContentError('Acción inválida.');
      if (input.kind === 'site' && ['hide', 'delete'].includes(input.action)) throw new ContentError('La información general no se puede ocultar ni borrar.');
      const validate = input.kind === 'tour' ? validateTour : input.kind === 'partner' ? validatePartner : validateSite;
      const draft = ['hide', 'delete'].includes(input.action) ? null : validate(input.draft, { publish: input.action === 'publish', mediaOrigin });
      if (draft && input.kind === 'tour' && (draft.id !== input.id || draft.slug !== input.id)) throw new ContentError('El identificador del tour no se puede cambiar.');
      if (draft && input.kind === 'partner' && draft.id !== input.id) throw new ContentError('El identificador del aliado no se puede cambiar.');
      const result = await store.write(user.id, { ...input, draft });
      return send(input.action === 'delete' ? result : { document: result });
    } catch (error) {
      if (error instanceof ContentError) return send({ error: error.message }, error.status);
      if (/content-conflict/.test(error.message)) return send({ error: 'Otro editor cambió o borró este contenido. Actualiza la lista antes de continuar.' }, 409);
      reportError(error);
      return send({ error: 'No se pudo completar la operación. Inténtalo de nuevo.' }, 503);
    }
  };
}
