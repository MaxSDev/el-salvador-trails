import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { localReviewStore, LOCAL_ADMIN_ID } from './reviews-local-store.mjs';

test('new local stores use manual review and pending submissions remain unpublished', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'est-manual-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = await localReviewStore(dir);
  assert.equal((await store.settings()).manual_only, true);
  const saved = await store.createReview({ id: 'review', submission_id: 'submission', status: 'approved', moderation_reasons: [] }, []);
  assert.equal(saved.status, 'pending');
  assert.equal((await store.listPublic({ offset: 0, limit: 12 })).rows.length, 0);
});
test('legacy local settings upgrade once without clearing approved reviews or future explicit settings', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'est-manual-upgrade-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const old = { reviews: [{ id: 'keep', status: 'approved', body: 'Conservar' }], manual_only: false, audit: [{ action: 'keep' }], limits: { keep: { start: 1, attempts: 1 } } };
  await writeFile(join(dir, 'reviews.json'), JSON.stringify(old));
  const store = await localReviewStore(dir);
  assert.equal((await store.settings()).manual_only, true);
  const upgraded = JSON.parse(await readFile(join(dir, 'reviews.json'), 'utf8'));
  assert.deepEqual(upgraded.reviews, old.reviews);
  assert.deepEqual(upgraded.audit, old.audit);
  assert.deepEqual(upgraded.limits, old.limits);
  await store.setManualMode(LOCAL_ADMIN_ID, false);
  assert.equal((await (await localReviewStore(dir)).settings()).manual_only, false);
});
