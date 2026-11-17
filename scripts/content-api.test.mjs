import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContentHandler } from '../supabase/functions/_shared/content-handler.mjs';
import { validateTour, validateSite } from '../supabase/functions/_shared/content-policy.mjs';
import { localContentStore } from './content-local-store.mjs';

const seed = JSON.parse(await readFile(new URL('../data/tours.json', import.meta.url)));
const actor = '10000000-0000-4000-8000-000000000001';
async function setup() {
  const store = await localContentStore(await mkdtemp(join(tmpdir(), 'est-content-')), seed.tours, actor);
  const removed = [];
  const handler = createContentHandler({ store, auth: { user: async token => token === 'owner' ? { id: actor } : token === 'visitor' ? { id: 'visitor' } : null }, storage: { upload: async () => {}, remove: async paths => removed.push(...paths), publicUrl: path => 'https://project.supabase.co/storage/v1/object/public/site-media/' + path } }, { allowedOrigins: ['http://localhost:8002'], mediaOrigin: 'https://project.supabase.co', reportError: error => { throw error; } });
  async function call(path, body, token = 'owner', method = body ? 'POST' : 'GET') {
    const response = await handler(new Request('http://localhost:8002/content-api' + path, { method, headers: { Origin: 'http://localhost:8002', Authorization: 'Bearer ' + token, ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}) }));
    return { status: response.status, data: await response.json() };
  }
  return { store, call, removed, handler };
}
test('draft changes stay private, publish replaces public content and hide removes it', async () => {
  const { call } = await setup(); const row = (await call('/admin')).data.documents.find(d => d.kind === 'tour');
  row.draft.title.es = 'Título nuevo';
  let result = await call('/admin', { id: row.id, kind: 'tour', draft: row.draft, action: 'save', version: row.version });
  assert.equal(result.status, 200);
  assert.notEqual((await call('/public')).data.tours.find(t => t.id === row.id).title.es, 'Título nuevo');
  result = await call('/admin', { id: row.id, kind: 'tour', draft: row.draft, action: 'publish', version: result.data.document.version });
  assert.equal((await call('/public')).data.tours.find(t => t.id === row.id).title.es, 'Título nuevo');
  await call('/admin', { id: row.id, kind: 'tour', action: 'hide', version: result.data.document.version });
  assert.equal((await call('/public')).data.tours.some(t => t.id === row.id), false);
});
test('conflicting editors and unauthorized users cannot overwrite content', async () => {
  const { call } = await setup(); const row = (await call('/admin')).data.documents[0];
  const body = { id: row.id, kind: row.kind, draft: row.draft, action: 'save', version: row.version };
  assert.equal((await call('/admin', body)).status, 200);
  assert.equal((await call('/admin', body)).status, 409);
  assert.equal((await call('/admin', null, 'bad')).status, 401);
  assert.equal((await call('/admin', body, 'visitor')).status, 403);
});
test('tour validation preserves all existing tours but rejects executable URLs and malformed prices', () => {
  seed.tours.forEach(t => assert.equal(validateTour(t).id, t.id));
  assert.throws(() => validateTour({ ...seed.tours[0], images: ['javascript:alert(1)'] }));
  assert.throws(() => validateTour({ ...seed.tours[0], meetingPoint: { mapUrl: 'javascript:alert(1)' } }));
  assert.throws(() => validateTour({ ...seed.tours[0], price: { amount: -1, unit: 'person' } }));
  assert.throws(() => validateSite({ texts: { 'html.lang': { es: 'arbitrary' } } }));
});
test('only authorized image uploads are accepted and HTML disguised as an image is rejected', async () => {
  const { call } = await setup(); const form = new FormData();
  form.append('file', new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/png' }), 'photo.png');
  assert.equal((await call('/media', form)).status, 400);
  assert.equal((await call('/media', form, 'visitor')).status, 403);
});
test('origin restrictions apply to writes and public output never includes drafts or audit data', async () => {
  const { call, handler } = await setup(); const data = (await call('/public')).data;
  assert.equal('documents' in data, false); assert.equal('audit' in data, false);
  assert.ok(data.tours.length > 0);
  assert.deepEqual(data.tours.map(t=>t.id),seed.tours.map(t=>t.id));
  const response = await handler(new Request('http://localhost:8002/content-api/admin', {method:'POST',headers:{Origin:'https://other.invalid',Authorization:'Bearer owner'},body:'{}'}));
  assert.equal(response.status,403);
});
test('valid images are uploaded into the public site library and failed metadata writes clean up', async () => {
  const { call } = await setup();
  const form = new FormData(); form.append('file',new Blob([new Uint8Array([137,80,78,71,13,10,26,10,0])],{type:'image/png'}),'photo.png');
  const result = await call('/media',form); assert.equal(result.status,200); assert.ok(result.data.media.url.endsWith('.png'));
  assert.equal((await call('/admin')).data.media.length,1);
  const base = await setup(); base.store.addMedia = async () => { throw new Error('storage metadata unavailable'); };
  const handler = createContentHandler({store:base.store,auth:{user:async()=>({id:actor})},storage:{upload:async()=>{},remove:async paths=>base.removed.push(...paths),publicUrl:path=>'https://project.supabase.co/storage/v1/object/public/site-media/'+path}},{allowedOrigins:['http://localhost:8002'],mediaOrigin:'https://project.supabase.co'});
  const response = await handler(new Request('http://localhost:8002/content-api/media',{method:'POST',headers:{Origin:'http://localhost:8002'},body:form}));
  assert.equal(response.status,503); assert.equal(base.removed.length,1);
});
