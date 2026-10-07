import { ReviewError, REQUEST_MAX_BYTES, UUID, validateReview, validatePhotos, decideReview } from './review-policy.mjs';

export async function sha256(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
}

async function boundedBody(request, max) {
  if (Number(request.headers.get('content-length') || 0) > max) throw new ReviewError('request-size', 413);
  if (!request.body) throw new ReviewError('request-body');
  const reader = request.body.getReader(); const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > max) { await reader.cancel(); throw new ReviewError('request-size', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  return body;
}

function pagination(url) {
  const page = Number(url.searchParams.get('page') || 0);
  if (!Number.isSafeInteger(page) || page < 0 || page > 10000) throw new ReviewError('page');
  return { offset: page * 12, limit: 12 };
}

export function createReviewHandler(deps, { allowedOrigins }) {
  async function representation(row, admin = false) {
    const photos = await Promise.all((row.review_photos || []).sort((a, b) => a.position - b.position).map(async photo => ({ url: await deps.storage.signedUrl(photo.storage_path) })));
    const result = { id: row.id, author: { name: row.author_name, country: row.country }, rating: row.rating, comment: row.body, lang: row.lang, tourRef: row.tour_slug, photos, createdAt: row.created_at, publishedAt: row.published_at };
    if (admin) Object.assign(result, { status: row.status, reasons: row.moderation_reasons, version: row.version, reviewedAt: row.reviewed_at });
    return result;
  }
  function outcome(row) { return { id: row.id, status: row.status === 'approved' ? 'published' : 'pending' }; }
  async function adminUser(request) {
    const token = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '')?.[1];
    if (!token) throw new ReviewError('session-required', 401);
    let user;
    try { user = await deps.auth.user(token); } catch { throw new ReviewError('session-required', 401); }
    if (!user?.id) throw new ReviewError('session-required', 401);
    if (!await deps.store.isAdmin(user.id)) throw new ReviewError('admin-required', 403);
    return user;
  }
  async function cleanDeletedPhotos(id, paths) {
    if (!paths.length) return true;
    try {
      await deps.storage.remove(paths);
      await deps.store.completePhotoDeletion(id);
      return true;
    } catch {
      console.error('review-deleted-photo-cleanup-pending');
      return false;
    }
  }
  async function retryDeletedPhotos() {
    try {
      const jobs = await deps.store.pendingPhotoDeletions();
      const outcomes = await Promise.all(jobs.slice(0, 12).map(job => cleanDeletedPhotos(job.review_id, job.storage_paths)));
      return jobs.length > 12 || outcomes.some(done => !done);
    } catch {
      console.error('review-photo-cleanup-unavailable');
      return true;
    }
  }
  async function submit(request) {
    const body = await boundedBody(request, REQUEST_MAX_BYTES);
    let form;
    try { form = await new Request(request.url, { method: 'POST', headers: { 'Content-Type': request.headers.get('content-type') || '' }, body }).formData(); }
    catch { throw new ReviewError('request-body'); }
    const input = Object.fromEntries(['name', 'country', 'rating', 'comment', 'lang', 'tourSlug', 'submissionId'].map(key => [key, form.get(key)]));
    input.consent = form.get('consent') === 'true';
    const review = validateReview(input);
    const files = form.getAll('photos').filter(file => typeof file !== 'string' && file.size);
    if (form.getAll('photos').some(file => typeof file === 'string')) throw new ReviewError('photo-format');
    const photos = await validatePhotos(files);
    const hashes = await Promise.all(photos.map(photo => sha256(photo.bytes)));
    const payloadHash = await sha256(JSON.stringify({ ...review, photos: hashes }));
    const previous = await deps.store.findSubmission(review.submissionId);
    if (previous) {
      if (previous.payload_hash !== payloadHash) throw new ReviewError('submission-conflict', 409);
      return { body: outcome(previous), status: 200 };
    }
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    if (!await deps.store.consumeRate(await deps.hashIP(ip))) throw new ReviewError('rate-limit', 429);
    if (form.get('website')) throw new ReviewError('spam');
    const token = form.get('turnstileToken');
    if (typeof token !== 'string' || !token || token.length > 2048 || !await deps.verifyTurnstile(token, ip)) throw new ReviewError('captcha');
    const settings = await deps.store.settings();
    const decision = await decideReview(review, { photoCount: photos.length, manualOnly: settings.manual_only, moderate: deps.moderate });
    const reviewId = crypto.randomUUID(); const paths = []; const metadata = [];
    let keepPhotos = false;
    try {
      for (const [position, photo] of photos.entries()) {
        const path = `${reviewId}/${crypto.randomUUID()}.${photo.extension}`;
        // Track the path before upload so a partial/uncertain upload can also be removed.
        paths.push(path);
        await deps.storage.upload(path, photo.bytes, photo.mime);
        metadata.push({ storage_path: path, mime_type: photo.mime, size_bytes: photo.size, position });
      }
      const row = await deps.store.createReview({ id: reviewId, submission_id: review.submissionId, payload_hash: payloadHash, author_name: review.name, country: review.country, rating: review.rating, body: review.comment, lang: review.lang, tour_slug: review.tourSlug, status: decision.status, moderation_reasons: decision.reasons }, metadata);
      keepPhotos = row.created;
      return { body: outcome(row), status: row.created ? 201 : 200 };
    } catch (error) {
      // A network timeout may have happened after the transaction committed. Verify before deleting its files.
      try {
        const saved = await deps.store.findSubmission(review.submissionId);
        if (saved?.payload_hash === payloadHash) {
          keepPhotos = saved.id === reviewId;
          return { body: outcome(saved), status: 200 };
        }
      } catch {
        // Preserve private files if the database cannot tell us whether the transaction committed.
        // A maintenance check can remove unreferenced files after the database recovers.
        keepPhotos = true;
      }
      throw error;
    } finally {
      if (!keepPhotos && paths.length) {
        try { await deps.storage.remove(paths); } catch { console.error('review-upload-cleanup-failed'); }
      }
    }
  }
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (origin && allowedOrigins.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    try {
      if (origin && !allowedOrigins.includes(origin)) throw new ReviewError('origin', 403);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey' } });
      if (request.method !== 'GET' && (!origin || !allowedOrigins.includes(origin))) throw new ReviewError('origin', 403);
      const url = new URL(request.url); const route = url.pathname.split('/').filter(Boolean).at(-1);
      if (route === 'public' && request.method === 'GET') {
        if (url.searchParams.has('status')) throw new ReviewError('status');
        const list = await deps.store.listPublic(pagination(url));
        return json({ reviews: await Promise.all(list.rows.map(row => representation(row))), hasMore: list.hasMore });
      }
      if (route === 'submit' && request.method === 'POST') { const result = await submit(request); return json(result.body, result.status); }
      if (route === 'admin' || route === 'settings') {
        const user = await adminUser(request);
        if (route === 'admin' && request.method === 'GET') {
          const status = url.searchParams.get('status') || 'pending';
          if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) throw new ReviewError('status');
          const photosPending = await retryDeletedPhotos();
          const list = await deps.store.listAdmin({ ...pagination(url), status });
          return json({ reviews: await Promise.all(list.rows.map(row => representation(row, true))), hasMore: list.hasMore, settings: await deps.store.settings(), photosPending });
        }
        if (request.method === 'PATCH' || (route === 'admin' && request.method === 'DELETE')) {
          let body;
          try { body = JSON.parse(new TextDecoder().decode(await boundedBody(request, 8192))); }
          catch (error) { if (error instanceof ReviewError) throw error; throw new ReviewError('request-body'); }
          if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ReviewError('request-body');
          if (request.method === 'DELETE') {
            if (!UUID.test(body.id || '') || !Number.isSafeInteger(body.version) || body.version < 0) throw new ReviewError('moderation');
            const result = await deps.store.deleteReview(user.id, body.id, body.version);
            const cleaned = await cleanDeletedPhotos(result.id, result.storage_paths);
            return json({ id: result.id, deleted: true, photosPending: !cleaned });
          }
          if (route === 'settings') {
            if (typeof body.manualOnly !== 'boolean') throw new ReviewError('manual-mode');
            await deps.store.setManualMode(user.id, body.manualOnly);
            return json({ manualOnly: body.manualOnly });
          }
          if (!UUID.test(body.id || '') || !['approved', 'rejected', 'hidden'].includes(body.status) || !Number.isSafeInteger(body.version) || body.version < 0) throw new ReviewError('moderation');
          return json(await deps.store.moderateReview(user.id, body.id, body.status, body.version));
        }
      }
      throw new ReviewError('route', 404);
    } catch (error) {
      if (error instanceof ReviewError) return json({ error: error.code }, error.status);
      const message = String(error?.message || '');
      if (/stale-review|submission-conflict/.test(message)) return json({ error: /stale-review/.test(message) ? 'stale-review' : 'submission-conflict' }, 409);
      if (/review-not-found/.test(message)) return json({ error: 'review-not-found' }, 404);
      if (/forbidden/.test(message)) return json({ error: 'admin-required' }, 403);
      console.error('review-request-failed');
      return json({ error: 'unavailable' }, 503);
    }
  };
}
