import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { localReviewStore, LOCAL_ADMIN_ID } from './reviews-local-store.mjs';
import { createReviewHandler } from '../supabase/functions/_shared/review-handler.mjs';

test('module access verifies the session and reports membership without exposing reviews', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'est-admin-access-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = await localReviewStore(directory);
  const handler = createReviewHandler({ store, auth: { user: async token => {
    if (token === 'owner-token') return { id: LOCAL_ADMIN_ID };
    if (token === 'visitor-token') return { id: 'visitor' };
    throw new Error('invalid token');
  } } }, { allowedOrigins: ['http://127.0.0.1:8000'] });
  const request = token => new Request('http://127.0.0.1:8000/reviews-api/access', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  assert.equal((await handler(request())).status, 401);
  assert.equal((await handler(request('invalid-token'))).status, 401);
  const denied = await handler(request('visitor-token'));
  assert.equal(denied.status, 200);
  assert.deepEqual(await denied.json(), { allowed: false });
  const granted = await handler(request('owner-token'));
  assert.equal(granted.status, 200);
  assert.deepEqual(await granted.json(), { allowed: true });
  assert.deepEqual(await store.pendingPhotoDeletions(), []);
});
