import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { localReviewStore, LOCAL_ADMIN_ID } from './reviews-local-store.mjs';
const api = await import('../supabase/functions/_shared/review-handler.mjs').catch(() => ({}));
const origin = 'http://127.0.0.1:8000';
const id = '4b79dc77-141c-4f8d-ad27-9db174095c0b';
function fixture(overrides = {}) {
  const records = new Map(); const uploaded = new Set(); const removed = []; let calls = 0;
  const store = {
    consumeRate: async () => ++calls <= 3,
    settings: async () => ({ manual_only: false }),
    findSubmission: async value => records.get(value),
    createReview: async (row, photos) => { records.set(row.submission_id, { ...row, photos }); return { id: row.id, status: row.status, created: true }; },
    listPublic: async () => ({ rows: [...records.values()].filter(row => row.status === 'approved').map(row => ({ ...row, review_photos: row.photos })), hasMore: false }),
    listAdmin: async () => ({ rows: [...records.values()].map(row => ({ ...row, review_photos: row.photos })), hasMore: false }),
    isAdmin: async user => user === 'owner',
    moderateReview: async () => { throw new Error('stale-review'); },
    setManualMode: async () => {},
    pendingPhotoDeletions: async () => []
  };
  const deps = { store, storage: { upload: async path => uploaded.add(path), remove: async paths => { paths.forEach(path => uploaded.delete(path)); removed.push(...paths); }, signedUrl: async path => 'https://example.supabase.co/private/' + path }, auth: { user: async token => token === 'owner-token' ? { id: 'owner' } : { id: 'visitor' } }, hashIP: async () => 'hashed-ip', verifyTurnstile: async token => token === 'valid', moderate: async () => ({ flagged: false }), ...overrides };
  assert.equal(typeof api.createReviewHandler, 'function');
  return { handler: api.createReviewHandler(deps, { allowedOrigins: [origin] }), records, uploaded, removed, store };
}
function submission(change = {}, photo) {
  const form = new FormData();
  const value = { name: 'Ana López', country: 'El Salvador', rating: '1', comment: 'El recorrido fue bueno, pero la recogida llegó tarde.', lang: 'es', consent: 'true', submissionId: id, tourSlug: '', turnstileToken: 'valid', website: '', ...change };
  for (const [key, item] of Object.entries(value)) form.append(key, item);
  if (photo) form.append('photos', photo);
  return new Request(origin + '/reviews-api/submit', { method: 'POST', headers: { Origin: origin }, body: form });
}

test('submits a real guest review and exposes only its public fields', async () => {
  const f = fixture();
  const response = await f.handler(submission());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).status, 'published');
  assert.equal(f.records.size, 1);
  const publicResponse = await f.handler(new Request(origin + '/reviews-api/public', { headers: { Origin: origin } }));
  const data = await publicResponse.json();
  assert.equal(data.reviews[0].rating, 1);
  assert.equal(data.reviews[0].author.name, 'Ana López');
  for (const key of ['payload_hash', 'submission_id', 'moderation_reasons', 'reviewed_by']) assert.equal(key in data.reviews[0], false);
});

test('CAPTCHA failures, honeypots, unknown origins and limits do not create records', async () => {
  const f = fixture();
  assert.equal((await f.handler(submission({ turnstileToken: 'forged' }))).status, 400);
  assert.equal((await f.handler(submission({ website: 'spam' }))).status, 400);
  const evil = submission(); evil.headers.set('Origin', 'https://evil.example');
  assert.equal((await f.handler(evil)).status, 403);
  await f.handler(submission({ submissionId: crypto.randomUUID() }));
  assert.equal((await f.handler(submission())).status, 429);
  assert.equal(f.records.size, 1);
});

test('retries return the original result even after the request quota is exhausted', async () => {
  const f = fixture();
  await f.handler(submission());
  for (let i = 0; i < 5; i++) {
    const response = await f.handler(submission({ turnstileToken: 'already-consumed' }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'published');
  }
  assert.equal(f.records.size, 1);
  assert.equal((await f.handler(submission({ comment: 'He cambiado el comentario usando el mismo identificador.' }))).status, 409);
});

test('photos are retained privately and failed writes clean up uploaded files', async () => {
  const photo = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'photo.png', { type: 'image/png' });
  const f = fixture();
  assert.equal((await (await f.handler(submission({}, photo))).json()).status, 'pending');
  assert.equal((await (await f.handler(new Request(origin + '/reviews-api/public'))).json()).reviews.length, 0);
  const failed = fixture(); failed.store.createReview = async () => { throw new Error('database down'); };
  assert.equal((await failed.handler(submission({}, photo))).status, 503);
  assert.equal(failed.uploaded.size, 0);
  assert.equal(failed.removed.length, 1);
});

test('admin requests require a verified session and current membership; conflicts are reported', async () => {
  const f = fixture();
  assert.equal((await f.handler(new Request(origin + '/reviews-api/admin'))).status, 401);
  assert.equal((await f.handler(new Request(origin + '/reviews-api/admin', { headers: { Authorization: 'Bearer visitor-token' } }))).status, 403);
  assert.equal((await f.handler(new Request(origin + '/reviews-api/admin', { headers: { Authorization: 'Bearer owner-token' } }))).status, 200);
  const response = await f.handler(new Request(origin + '/reviews-api/admin', { method: 'PATCH', headers: { Origin: origin, Authorization: 'Bearer owner-token', 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'approved', version: 0 }) }));
  assert.equal(response.status, 409);
});

test('oversized requests, unapproved statuses and unknown routes are rejected', async () => {
  const f = fixture();
  const large = submission(); large.headers.set('Content-Length', String(25 * 1024 * 1024));
  assert.equal((await f.handler(large)).status, 413);
  assert.equal((await f.handler(new Request(origin + '/reviews-api/public?status=pending'))).status, 400);
  assert.equal((await f.handler(new Request(origin + '/reviews-api/unknown'))).status, 404);
});

test('an uncertain transaction never deletes photos that might belong to a saved review', async () => {
  const f = fixture(); let lookups = 0;
  f.store.findSubmission = async () => { if (++lookups === 1) return null; throw new Error('database timeout'); };
  f.store.createReview = async () => { throw new Error('commit result lost'); };
  const photo = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'photo.png', { type: 'image/png' });
  assert.equal((await f.handler(submission({}, photo))).status, 503);
  assert.equal(f.uploaded.size, 1, 'Preserve private files until the commit can be checked');
});

async function deletionFixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'est-delete-review-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = await localReviewStore(directory);
  const uploaded = new Set();
  let storageUnavailable = false;
  const handler = api.createReviewHandler({
    store,
    auth: { user: async token => token === 'owner-token' ? { id: LOCAL_ADMIN_ID } : { id: 'visitor' } },
    storage: {
      upload: async path => uploaded.add(path),
      signedUrl: async path => 'https://example.supabase.co/private/' + path,
      remove: async paths => { if (storageUnavailable) throw new Error('storage offline'); paths.forEach(path => uploaded.delete(path)); }
    },
    hashIP: async () => 'hashed-ip', verifyTurnstile: async () => true, moderate: async () => ({ flagged: false })
  }, { allowedOrigins: [origin] });
  const photo = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'photo.png', { type: 'image/png' });
  const saved = await (await handler(submission({}, photo))).json();
  return { handler, store, uploaded, saved, offline: value => { storageUnavailable = value; } };
}
function deleteRequest(reviewId, version = 0, token = 'owner-token') {
  return new Request(origin + '/reviews-api/admin', { method: 'DELETE', headers: { Origin: origin, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reviewId, version }) });
}

test('only an authorized admin can permanently delete a review and its files', async t => {
  const f = await deletionFixture(t);
  const anonymous = deleteRequest(f.saved.id); anonymous.headers.delete('Authorization');
  assert.equal((await f.handler(anonymous)).status, 401);
  const foreign = deleteRequest(f.saved.id); foreign.headers.set('Origin', 'https://untrusted.example');
  assert.equal((await f.handler(foreign)).status, 403);
  assert.equal((await f.handler(deleteRequest(f.saved.id, 0, 'visitor-token'))).status, 403);
  assert.equal((await f.handler(deleteRequest(f.saved.id, -1))).status, 400);
  assert.equal((await f.handler(deleteRequest(f.saved.id, 1))).status, 409);
  assert.equal(f.uploaded.size, 1);
  const response = await f.handler(deleteRequest(f.saved.id));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: f.saved.id, deleted: true, photosPending: false });
  assert.equal(f.uploaded.size, 0);
  assert.equal((await f.store.listAdmin({ status: 'pending', offset: 0, limit: 12 })).rows.length, 0);
  assert.equal(await f.store.findSubmission(id), undefined);
  assert.equal((await f.handler(deleteRequest(f.saved.id))).status, 200, 'A lost response can be retried safely');
  const preflight = await f.handler(new Request(origin + '/reviews-api/admin', { method: 'OPTIONS', headers: { Origin: origin } }));
  assert.ok(preflight.headers.get('access-control-allow-methods').split(',').map(method => method.trim()).includes('DELETE'));
});

test('failed file deletion is reported honestly and retried on an authorized admin refresh', async t => {
  const f = await deletionFixture(t);
  f.offline(true);
  const response = await f.handler(deleteRequest(f.saved.id));
  assert.deepEqual(await response.json(), { id: f.saved.id, deleted: true, photosPending: true });
  assert.equal(f.uploaded.size, 1);
  assert.equal((await f.store.listAdmin({ status: 'pending', offset: 0, limit: 12 })).rows.length, 0);
  f.offline(false);
  assert.equal((await f.handler(new Request(origin + '/reviews-api/admin'))).status, 401);
  assert.equal(f.uploaded.size, 1, 'An unauthenticated request must not process cleanup jobs');
  await f.handler(new Request(origin + '/reviews-api/admin', { headers: { Origin: origin, Authorization: 'Bearer owner-token' } }));
  assert.equal(f.uploaded.size, 0);
  assert.equal((await f.store.pendingPhotoDeletions()).length, 0);
});
