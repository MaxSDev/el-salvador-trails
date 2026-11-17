import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as policy from '../supabase/functions/_shared/content-policy.mjs';
import { createContentHandler } from '../supabase/functions/_shared/content-handler.mjs';
import { localContentStore } from './content-local-store.mjs';
import { contentSeedSQL } from './content-seed.mjs';

const owner = '10000000-0000-4000-8000-000000000001';
export function partner(id = 'art-haus') {
  return { id: 'partner-' + id, slug: id, type: 'lodging', name: { es: 'Art Haus', en: '', pt: '' }, tagline: { es: 'Arte y descanso' }, shortDescription: { es: 'Un alojamiento aliado.' }, description: { es: 'Arte, hospedaje y experiencia local.' }, location: { es: 'El Salvador' }, address: 'Santa Ana', url: 'https://example.com', images: ['assets/img/slide_0.jpg'], imageCaptions: [{ es: 'Jardín' }], sortOrder: 1 };
}
async function setup(t, partners = []) {
  const dir = await mkdtemp(join(tmpdir(), 'est-partners-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = await localContentStore(dir, [], owner, partners);
  const handler = createContentHandler({ store, auth: { user: async token => token === 'owner' ? { id: owner } : token === 'visitor' ? { id: 'visitor' } : null } }, { allowedOrigins: ['http://localhost:8002'] });
  const call = async (path, body, token = 'owner') => {
    const response = await handler(new Request('http://localhost:8002/content-api' + path, { method: body ? 'POST' : 'GET', headers: { Origin: 'http://localhost:8002', Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) }));
    return { status: response.status, data: await response.json() };
  };
  return { dir, store, call };
}
test('partners accept incomplete drafts and require Spanish fields and an image to publish', () => {
  assert.equal(typeof policy.validatePartner, 'function');
  assert.equal(policy.validatePartner({ id: 'partner-nuevo' }, { publish: false }).slug, 'nuevo');
  const value = policy.validatePartner(partner());
  assert.equal(value.name.es, 'Art Haus');
  assert.equal(value.imageCaptions[0].es, 'Jardín');
  for (const change of [{ name: {} }, { shortDescription: {} }, { description: {} }, { images: [] }, { images: Array(31).fill('assets/img/slide_0.jpg') }, { url: 'javascript:alert(1)' }, { id: 'art-haus' }, { slug: 'other' }, { type: 'unknown' }]) assert.throws(() => policy.validatePartner({ ...partner(), ...change }));
  assert.throws(() => policy.validatePartner({ ...partner(), imageCaptions: Array(31).fill({ es: '' }) }));
});
test('real estate texts and hero image are editable with the existing site payload', () => {
  const value = policy.validateSite({ texts: { 'realestate.hero': { es: 'Alojamientos' }, 'realestate.signature': { es: 'Zenith Trails' } }, images: { estateHero: 'assets/img/slide_0.jpg' } });
  assert.equal(value.texts['realestate.hero'].es, 'Alojamientos');
  assert.equal(value.images.estateHero, 'assets/img/slide_0.jpg');
});
test('access reports only module permission after session validation', async t => {
  const { call } = await setup(t);
  assert.deepEqual((await call('/access')).data, { allowed: true });
  assert.deepEqual((await call('/access', null, 'visitor')).data, { allowed: false });
  assert.equal((await call('/access', null, 'bad')).status, 401);
});
test('partner public snapshots remain private while editing and can be hidden without stale overwrites', async t => {
  const { call } = await setup(t);
  const draft = partner();
  let result = await call('/admin', { id: draft.id, kind: 'partner', draft, action: 'save', version: 0 });
  assert.equal(result.status, 200);
  assert.deepEqual((await call('/public')).data.partners, []);
  result = await call('/admin', { id: draft.id, kind: 'partner', draft, action: 'publish', version: result.data.document.version });
  assert.equal(result.status, 200);
  assert.equal((await call('/public')).data.partners[0].name.es, 'Art Haus');
  const version = result.data.document.version;
  draft.name.es = 'Borrador pendiente';
  assert.equal((await call('/admin', { id: draft.id, kind: 'partner', draft, action: 'save', version })).status, 200);
  assert.equal((await call('/public')).data.partners[0].name.es, 'Art Haus');
  assert.equal((await call('/admin', { id: draft.id, kind: 'partner', draft, action: 'publish', version })).status, 409);
  assert.equal((await call('/admin', { id: draft.id, kind: 'partner', action: 'hide', version: version + 1 })).status, 200);
  assert.deepEqual((await call('/public')).data.partners, []);
  assert.deepEqual((await call('/public')).data.tours, []);
  assert.deepEqual((await call('/public')).data.site, {});
});
test('partner ids cannot collide with tours or change the public slug', async t => {
  const { call } = await setup(t);
  assert.equal((await call('/admin', { id: 'art-haus', kind: 'partner', draft: partner(), action: 'save', version: 0 })).status, 400);
  assert.equal((await call('/admin', { id: 'partner-other', kind: 'partner', draft: partner(), action: 'save', version: 0 })).status, 400);
  assert.equal((await call('/admin', { id: 'partner-art-haus', kind: 'tour', draft: partner(), action: 'save', version: 0 })).status, 400);
});
test('public partners are ordered and hidden partners stay absent across reimport', async t => {
  const first = { ...partner('first'), sortOrder: 0 };
  const second = { ...partner('second'), sortOrder: 2 };
  const { call, dir } = await setup(t, [second, first]);
  assert.deepEqual((await call('/public')).data.partners.map(value => value.id), [first.id, second.id]);
  await call('/admin', { id: first.id, kind: 'partner', action: 'hide', version: 0 });
  const reopened = await localContentStore(dir, [], owner, [first, second]);
  assert.equal((await reopened.list()).find(value => value.id === first.id).status, 'hidden');
});
test('current Art Haus seed validates every localized gallery caption', async () => {
  const { partners } = JSON.parse(await readFile(new URL('../data/real-estate.json', import.meta.url), 'utf8'));
  const artHaus = policy.validatePartner(partners.find(value => value.id === 'partner-art-haus'));
  assert.equal(artHaus.images.length, 16);
  assert.equal(artHaus.imageCaptions.length, artHaus.images.length);
  assert.ok(artHaus.imageCaptions.every(value => ['es', 'en', 'pt'].every(lang => value[lang])));
});
test('local bootstrap imports missing partners once and preserves owner edits and existing state', async t => {
  const { dir, store } = await setup(t, [partner()]);
  let row = (await store.list()).find(d => d.kind === 'partner');
  assert.ok(row);
  await store.write(owner, { id: row.id, kind: 'partner', action: 'save', version: row.version, draft: { ...row.draft, name: { es: 'Edición guardada' } } });
  const reopened = await localContentStore(dir, [], owner, [partner(), partner('second')]);
  row = (await reopened.list()).find(d => d.id === 'partner-art-haus');
  assert.equal(row.draft.name.es, 'Edición guardada');
  assert.equal(row.published.name.es, 'Art Haus');
  assert.equal((await reopened.list()).filter(d => d.kind === 'partner').length, 2);
  assert.equal((await reopened.list()).filter(d => d.kind === 'site').length, 1);
  const sql = contentSeedSQL([], '', [partner()]);
  assert.match(sql, /'partner-art-haus','partner'/);
  assert.match(sql, /on conflict\(id\) do nothing/);
});
