import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateTour } from '../supabase/functions/_shared/content-policy.mjs';
import { createContentHandler } from '../supabase/functions/_shared/content-handler.mjs';
import { localContentStore } from './content-local-store.mjs';
import { contentSeedSQL } from './content-seed.mjs';

const { tours } = JSON.parse(await readFile(new URL('../data/tours.json', import.meta.url), 'utf8'));
const metadata = ['contentSource', 'optionalExtras', 'imageDescriptions', 'mediaNote', 'rating', 'ratingCount'];
test('validation preserves every existing companion source, extra, image description and rating', () => {
  for (const tour of tours) {
    const saved = validateTour(tour);
    for (const key of metadata) if (key in tour) assert.deepEqual(saved[key], tour[key], tour.id + ': ' + key);
  }
});
test('source metadata and extras copy only validated known fields', () => {
  const original = tours.find(value => value.optionalExtras?.length);
  const saved = validateTour({ ...original, contentSource: { ...original.contentSource, internalToken: 'never-public' }, optionalExtras: [{ id: 'surf-lesson-1h', label: { es: ' Clase de surf ', en: '', pt: '', extra: 'omit' }, onclick: 'omit' }] });
  assert.equal(saved.contentSource.internalToken, undefined);
  assert.deepEqual(saved.optionalExtras, [{ id: 'surf-lesson-1h', label: { es: 'Clase de surf', en: '', pt: '' } }]);
  assert.equal(validateTour({ ...original, imageDescriptions: { es: ['', ' Segunda foto '], en: [], pt: [] } }).imageDescriptions.es[1], 'Segunda foto');
});
test('malformed source metadata, extra ids, caption arrays and ratings are rejected', () => {
  const original = tours[0];
  for (const change of [
    { contentSource: 'not-an-object' }, { contentSource: { receivedDate: '2026-02-30' } }, { contentSource: { sourceNumber: -1 } },
    { optionalExtras: [{ id: 'x" onclick="alert(1)', label: { es: 'Extra' } }] },
    { optionalExtras: [{ id: 'same', label: { es: 'Uno' } }, { id: 'same', label: { es: 'Dos' } }] },
    { optionalExtras: Array(31).fill({ id: 'extra', label: { es: 'Extra' } }) },
    { imageDescriptions: { es: 'invalid' } }, { imageDescriptions: { es: Array(31).fill('Foto') } },
    { mediaNote: { es: 'x'.repeat(2001) } }, { rating: 7 }, { rating: '5' }, { ratingCount: -1 }, { ratingCount: 1.5 }
  ]) assert.throws(() => validateTour({ ...original, ...change }));
});
test('bootstrapped, saved and published tours keep companion behavior and SQL imports include it', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'est-tour-metadata-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const owner = '10000000-0000-4000-8000-000000000001';
  const store = await localContentStore(dir, tours, owner);
  const original = tours.find(value => value.optionalExtras?.length);
  const row = (await store.list()).find(value => value.id === original.id);
  for (const key of metadata) if (key in original) assert.deepEqual(row.published[key], original[key]);
  row.draft.title.es = 'Título editado desde el panel';
  const handler = createContentHandler({ store, auth: { user: async () => ({ id: owner }) } }, { allowedOrigins: ['http://localhost:8002'] });
  let version = row.version;
  for (const action of ['save', 'publish']) {
    const response = await handler(new Request('http://localhost:8002/content-api/admin', { method: 'POST', headers: { Origin: 'http://localhost:8002', 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, kind: 'tour', draft: row.draft, version, action }) }));
    assert.equal(response.status, 200);
    const data = await response.json(); version = data.document.version;
    for (const key of metadata) if (key in original) assert.deepEqual(data.document.draft[key], original[key]);
  }
  const publicData = await (await handler(new Request('http://localhost:8002/content-api/public'))).json();
  assert.equal(publicData.tours.find(value => value.id === original.id).optionalExtras[0].id, original.optionalExtras[0].id);
  assert.deepEqual(publicData.tours.find(value => value.id === original.id).contentSource, original.contentSource);
  const sql = contentSeedSQL([original]);
  assert.match(sql, /"optionalExtras"/); assert.match(sql, /"contentSource"/); assert.match(sql, /"imageDescriptions"/);
});
test('legacy local metadata repair preserves owner snapshots, aligns photo captions and runs once', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'est-tour-repair-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const original = tours.find(value => value.optionalExtras?.length);
  const draft = { id: original.id, title: { es: 'Edición local' }, images: [original.images[1], 'assets/img/slide_0.jpg', original.images[0]], rating: null };
  const published = { id: original.id, title: { es: 'Versión publicada' }, images: [...original.images], contentSource: null, imageDescriptions: { es: ['Descripción editada'] } };
  const state = { documents: [{ id: original.id, kind: 'tour', status: 'hidden', version: 9, draft, published }, { id: 'own-tour', kind: 'tour', draft: { title: { es: 'Propio' } }, published: null, status: 'draft', version: 1 }], media: [{ path: 'keep' }], audit: [{ action: 'keep' }] };
  await writeFile(join(dir, 'content.json'), JSON.stringify(state));
  const store = await localContentStore(dir, tours, 'owner');
  const rows = await store.list();
  assert.equal(rows.length, 2, 'Repair must not insert missing canonical tours');
  const row = rows[0];
  assert.equal(row.draft.title.es, 'Edición local'); assert.deepEqual(row.draft.images, draft.images);
  assert.equal(row.draft.rating, null); assert.equal(row.version, 9); assert.equal(row.status, 'hidden');
  assert.deepEqual(row.draft.contentSource, original.contentSource);
  assert.deepEqual(row.draft.imageDescriptions.es, [original.imageDescriptions.es[1], '', original.imageDescriptions.es[0]]);
  assert.equal(row.published.contentSource, null);
  assert.deepEqual(row.published.imageDescriptions, published.imageDescriptions);
  assert.deepEqual(rows[1], state.documents[1]);
  const saved = JSON.parse(await readFile(join(dir, 'content.json'), 'utf8'));
  assert.deepEqual(saved.audit, state.audit); assert.deepEqual(saved.media, state.media);
  // An explicit later edit must not be replayed from the old canonical import on restart.
  delete saved.documents[0].draft.contentSource;
  await writeFile(join(dir, 'content.json'), JSON.stringify(saved));
  const reopened = await localContentStore(dir, tours, 'owner');
  assert.equal('contentSource' in (await reopened.list())[0].draft, false);
});
