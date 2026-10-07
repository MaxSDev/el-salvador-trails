import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const admin = '10000000-0000-4000-8000-000000000001';
const visitor = '20000000-0000-4000-8000-000000000002';
const review = '30000000-0000-4000-8000-000000000003';
const submission = '40000000-0000-4000-8000-000000000004';
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated; grant select on storage.objects to authenticated;
    insert into auth.users values ('${admin}'), ('${visitor}');`);
  let sql;
  try { sql = await readFile(new URL('../supabase/schemas/reviews.sql', import.meta.url), 'utf8'); }
  catch { assert.fail('The review database and its access controls have not been implemented'); }
  await db.exec(sql);
  await db.query('insert into public.review_admins (user_id) values ($1)', [admin]);
  return db;
}
function draft(status = 'pending') {
  return { id: review, submission_id: submission, payload_hash: 'a'.repeat(64), author_name: 'Ana', country: 'El Salvador', rating: 1, body: 'El guía fue amable pero llegó tarde.', lang: 'es', tour_slug: '', status, moderation_reasons: [] };
}
async function create(db, value = draft(), photos = []) {
  return (await db.query('select public.create_guest_review($1::jsonb, $2::jsonb) as result', [JSON.stringify(value), JSON.stringify(photos)])).rows[0].result;
}

test('anonymous and ordinary signed-in users cannot read pending reviews or change their status', async () => {
  const db = await setup();
  try {
    await create(db);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.reviews'), /permission denied/);
    await assert.rejects(create(db), /permission denied/);
    await db.exec(`reset role; set request.jwt.claim.sub = '${visitor}'; set role authenticated`);
    assert.equal((await db.query('select * from public.reviews')).rows.length, 0);
    await assert.rejects(db.query("update public.reviews set status = 'approved'"), /permission denied/);
    await db.exec(`reset role; set request.jwt.claim.sub = '${admin}'; set role authenticated`);
    assert.equal((await db.query('select * from public.reviews')).rows.length, 1);
    await assert.rejects(db.query('insert into public.review_admins (user_id) values ($1)', [visitor]), /permission denied/);
  } finally { await db.close(); }
});

test('manual mode is checked at insertion and prevents auto publication, including in-flight requests', async () => {
  const db = await setup();
  try {
    await db.query('select public.set_review_manual_mode($1, true)', [admin]);
    const result = await create(db, draft('approved'));
    assert.equal(result.status, 'pending');
    assert.ok((await db.query('select moderation_reasons from public.reviews')).rows[0].moderation_reasons.includes('manual-mode'));
  } finally { await db.close(); }
});

test('idempotent creation does not insert two copies and detects reused IDs with changed content', async () => {
  const db = await setup();
  try {
    await create(db);
    assert.equal((await create(db)).id, review);
    assert.equal((await db.query('select count(*)::int as count from public.reviews')).rows[0].count, 1);
    await assert.rejects(create(db, { ...draft(), payload_hash: 'b'.repeat(64) }), /submission-conflict/);
  } finally { await db.close(); }
});

test('moderation requires an allowed admin, logs the change, and prevents stale overwrites', async () => {
  const db = await setup();
  try {
    await create(db);
    await assert.rejects(db.query("select public.moderate_guest_review($1, $2, 'approved', 0)", [visitor, review]), /forbidden/);
    await db.query("select public.moderate_guest_review($1, $2, 'approved', 0)", [admin, review]);
    assert.equal((await db.query('select status, version, published_at from public.reviews')).rows[0].status, 'approved');
    assert.equal((await db.query('select count(*)::int as count from public.review_audit')).rows[0].count, 1);
    await assert.rejects(db.query("select public.moderate_guest_review($1, $2, 'hidden', 0)", [admin, review]), /stale-review/);
    await db.query("select public.moderate_guest_review($1, $2, 'hidden', 1)", [admin, review]);
  } finally { await db.close(); }
});

test('rate limits are persisted and enforced atomically by PostgreSQL', async () => {
  const db = await setup();
  try {
    const attempts = [];
    for (let i = 0; i < 4; i++) attempts.push((await db.query("select public.consume_review_rate_limit('hashed-ip') as allowed")).rows[0].allowed);
    assert.deepEqual(attempts, [true, true, true, false]);
  } finally { await db.close(); }
});

test('photo metadata is atomic with the review and pending files are private', async () => {
  const db = await setup();
  try {
    const photo = { storage_path: `${review}/photo.png`, mime_type: 'image/png', size_bytes: 100, position: 0 };
    await create(db, draft(), [photo]);
    assert.equal((await db.query('select public from storage.buckets where id = $1', ['review-photos'])).rows[0].public, false);
    await db.query('insert into storage.objects (bucket_id, name) values ($1, $2)', ['review-photos', photo.storage_path]);
    await db.exec(`set request.jwt.claim.sub = '${visitor}'; set role authenticated`);
    assert.equal((await db.query('select * from public.review_photos')).rows.length, 0);
    assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
  } finally { await db.close(); }
});

test('permanent deletion removes the review and metadata and retains a durable photo cleanup job', async () => {
  const db = await setup();
  try {
    const photo = { storage_path: `${review}/photo.png`, mime_type: 'image/png', size_bytes: 100, position: 0 };
    await create(db, draft(), [photo]);
    await db.query("select public.moderate_guest_review($1, $2, 'approved', 0)", [admin, review]);
    await assert.rejects(db.query('select public.delete_guest_review($1, $2, 1)', [visitor, review]), /forbidden/);
    await assert.rejects(db.query('select public.delete_guest_review($1, $2, 0)', [admin, review]), /stale-review/);
    assert.equal((await db.query('select count(*)::int as n from public.reviews')).rows[0].n, 1);
    await db.exec('set role service_role');
    const deleted = (await db.query('select public.delete_guest_review($1, $2, 1) as result', [admin, review])).rows[0].result;
    assert.deepEqual(deleted, { id: review, storage_paths: [photo.storage_path] });
    assert.equal((await db.query('select count(*)::int as n from public.reviews')).rows[0].n, 0);
    assert.equal((await db.query('select count(*)::int as n from public.review_photos')).rows[0].n, 0);
    assert.equal((await db.query('select count(*)::int as n from public.review_audit where review_id is not null')).rows[0].n, 0);
    assert.deepEqual((await db.query('select storage_paths from public.review_photo_deletions')).rows[0].storage_paths, [photo.storage_path]);
    // Retrying a timed-out delete must still recover the file paths.
    assert.deepEqual((await db.query('select public.delete_guest_review($1, $2, 1) as result', [admin, review])).rows[0].result, deleted);
    await db.query('delete from public.review_photo_deletions where review_id = $1', [review]);
    assert.deepEqual((await db.query('select public.delete_guest_review($1, $2, 1) as result', [admin, review])).rows[0].result.storage_paths, []);
    await db.exec(`reset role; set request.jwt.claim.sub = '${admin}'; set role authenticated`);
    await assert.rejects(db.query('select * from public.review_photo_deletions'), /permission denied/);
    await assert.rejects(db.query('select public.delete_guest_review($1, $2, 1)', [admin, review]), /permission denied/);
  } finally { await db.close(); }
});
