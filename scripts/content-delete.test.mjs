import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { createContentHandler } from '../supabase/functions/_shared/content-handler.mjs';
import { localContentStore } from './content-local-store.mjs';
import { contentSeedSQL } from './content-seed.mjs';

const owner = '10000000-0000-4000-8000-000000000001';
const tour = JSON.parse(await readFile(new URL('../data/tours.json', import.meta.url))).tours[0];
const partner = { id: 'partner-casa-prueba', slug: 'casa-prueba', type: 'lodging', name: { es: 'Casa de prueba' }, shortDescription: { es: 'Alojamiento' }, description: { es: 'Un lugar para descansar' }, images: ['assets/img/slide_0.jpg'] };

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'est-content-delete-'));
  const store = await localContentStore(directory, [tour], owner, [partner]);
  const handler = createContentHandler({ store, auth: { user: async token => token === 'owner' ? { id: owner } : token === 'visitor' ? { id: 'visitor' } : null } }, { allowedOrigins: ['http://localhost:8002'] });
  const call = async (path, body, token = 'owner') => {
    const response = await handler(new Request('http://localhost:8002/content-api' + path, { method: body ? 'POST' : 'GET', headers: { Origin: 'http://localhost:8002', Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }));
    return { status: response.status, data: await response.json() };
  };
  return { directory, store, call };
}

for (const kind of ['tour', 'partner']) {
  for (const status of ['draft', 'published', 'hidden']) {
    test(`delete removes a ${status} ${kind} from the panel and public page, preserving unrelated content and media`, async () => {
      const { call, store } = await setup();
      let row;
      if (status === 'draft') {
        const draft = kind === 'tour' ? { ...tour, id: 'draft-tour', slug: 'draft-tour' } : { ...partner, id: 'partner-draft', slug: 'draft' };
        row = (await call('/admin', { id: draft.id, kind, draft, action: 'save', version: 0 })).data.document;
      } else {
        row = (await store.list()).find(item => item.kind === kind);
        if (status === 'hidden') row = (await call('/admin', { id: row.id, kind, action: 'hide', version: row.version })).data.document;
      }
      const remaining = (await store.list()).filter(item => item.id !== row.id);
      const sharedImage = { path: 'shared.jpg', url: row.draft.images[0] };
      await store.addMedia(owner, sharedImage);
      const result = await call('/admin', { id: row.id, kind, action: 'delete', version: row.version });
      assert.equal(result.status, 200);
      assert.deepEqual(result.data, { deleted: { id: row.id } });
      assert.deepEqual((await call('/admin')).data.documents, remaining);
      assert.equal((await call('/public')).data[kind === 'tour' ? 'tours' : 'partners'].some(item => item.id === row.id), false);
      assert.deepEqual(await store.media(), [sharedImage]);
    });
  }
}

test('delete requires the current version and administrator session and cannot delete site settings or a missing item', async () => {
  const { call, store } = await setup();
  const original = await store.list();
  const row = original.find(item => item.kind === 'tour');
  const body = { id: row.id, kind: row.kind, action: 'delete', version: row.version };
  assert.equal((await call('/admin', body, 'bad')).status, 401);
  assert.equal((await call('/admin', body, 'visitor')).status, 403);
  assert.equal((await call('/admin', { ...body, version: row.version + 1 })).status, 409);
  assert.equal((await call('/admin', { ...body, id: 'missing-tour' })).status, 409);
  assert.equal((await call('/admin', { id: 'site', kind: 'site', action: 'delete', version: 0 })).status, 400);
  assert.deepEqual(await store.list(), original);
});

test('deleted imported content stays deleted after restart and stale editors cannot recreate it', async () => {
  const { directory, call, store } = await setup();
  const rows = (await store.list()).filter(item => item.kind !== 'site');
  for (const row of rows) assert.equal((await call('/admin', { id: row.id, kind: row.kind, action: 'delete', version: row.version })).status, 200);
  const reopened = await localContentStore(directory, [tour], owner, [partner]);
  assert.deepEqual((await reopened.list()).map(item => item.id), ['site']);
  for (const row of rows) await assert.rejects(reopened.write(owner, { ...row, action: 'save' }), error => error.status === 409);
  const persisted = JSON.parse(await readFile(join(directory, 'content.json'), 'utf8'));
  assert.deepEqual(persisted.audit.map(item => [item.document_id, item.action, item.version]), [[tour.id, 'delete', 1], [partner.id, 'delete', 1]]);
});

test('SQL deletes atomically with an audit record, protects permissions and does not resurrect deleted seeds', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage; create table auth.users(id uuid primary key);
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      insert into auth.users values ('${owner}');`);
    await db.exec(await readFile(new URL('../supabase/schemas/content.sql', import.meta.url), 'utf8'));
    await db.query('insert into public.content_admins(user_id) values ($1)', [owner]);
    const seed = contentSeedSQL([tour], '', [partner]);
    await db.exec(seed);
    const write = (id, kind, action, version, draft = null) => db.query('select public.write_site_content($1,$2,$3,$4::jsonb,$5,$6) as result', [owner, id, kind, JSON.stringify(draft), action, version]);
    await assert.rejects(write(tour.id, 'tour', 'delete', 1), /content-conflict/);
    await assert.rejects(write('site', 'site', 'delete', 0), /content-invalid/);
    await assert.rejects(write('missing', 'tour', 'delete', 0), /content-conflict/);
    await db.exec('set role authenticated');
    await assert.rejects(write(tour.id, 'tour', 'delete', 0), /permission denied/);
    await db.exec('reset role; set role service_role');
    for (const [id, kind] of [[tour.id, 'tour'], [partner.id, 'partner']]) {
      const result = (await write(id, kind, 'delete', 0)).rows[0].result;
      assert.deepEqual(result, { deleted: { id } });
      assert.deepEqual((await db.query('select * from public.content_documents where id=$1', [id])).rows, []);
    }
    await db.exec('reset role');
    assert.equal((await db.query("select count(*)::int as n from public.content_audit where action='delete' and version=1")).rows[0].n, 2);
    await db.exec(seed);
    assert.deepEqual((await db.query('select id from public.content_documents')).rows, [{ id: 'site' }]);
    await assert.rejects(write(tour.id, 'tour', 'save', 0, tour), /content-conflict/);
    await assert.rejects(write(partner.id, 'partner', 'save', 0, partner), /content-conflict/);
  } finally { await db.close(); }
});
