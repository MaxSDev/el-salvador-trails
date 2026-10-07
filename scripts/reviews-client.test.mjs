import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function load(fetch) {
  const window = { ESTReviewsConfig: { apiBaseUrl: 'https://example.supabase.co/functions/v1/reviews-api', publishableKey: 'sb_publishable_example' } };
  let source;
  try { source = await readFile(new URL('../js/reviews-api.js', import.meta.url), 'utf8'); }
  catch { assert.fail('The real review client has not been implemented'); }
  vm.runInNewContext(source, { window, fetch, FormData, Error, URL, AbortController, setTimeout, clearTimeout });
  return window.ESTReviews;
}
test('submits actual form data and refuses to report success on HTTP failures', async () => {
  const requests = [];
  const client = await load(async (url, options) => { requests.push({ url, options }); return new Response(JSON.stringify({ error: 'captcha' }), { status: 400 }); });
  const data = new FormData(); data.set('comment', 'Una experiencia inolvidable.');
  await assert.rejects(client.submit(data), error => error.code === 'captcha');
  assert.equal(requests[0].url, 'https://example.supabase.co/functions/v1/reviews-api/submit');
  assert.equal(requests[0].options.body, data);
  assert.equal(requests[0].options.headers['Content-Type'], undefined);
});
test('rejects malformed success and listing responses instead of treating them as saved', async () => {
  const client = await load(async () => new Response('{}'));
  await assert.rejects(client.submit(new FormData()), error => error.code === 'unavailable');
  await assert.rejects(client.list(0), error => error.code === 'unavailable');
});
test('a public listing is always loaded from the server without private status parameters', async () => {
  const requests = [];
  const client = await load(async url => { requests.push(url); return new Response(JSON.stringify({ reviews: [], hasMore: false })); });
  assert.equal((await client.list(2)).reviews.length, 0);
  assert.equal(requests[0], 'https://example.supabase.co/functions/v1/reviews-api/public?page=2');
});
test('missing configuration disables submission instead of reverting to a simulated success', async () => {
  const window = { ESTReviewsConfig: {} };
  vm.runInNewContext(await readFile(new URL('../js/reviews-api.js', import.meta.url), 'utf8'), { window, Error, URL });
  assert.equal(window.ESTReviews.configured(), false);
  await assert.rejects(window.ESTReviews.submit(new FormData()), error => error.code === 'configuration');
});
