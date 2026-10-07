import assert from 'node:assert/strict';
import test from 'node:test';
import { publicConfiguration } from './build-site.mjs';

test('only explicitly public settings enter the browser configuration', async () => {
  const keys = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'PUBLIC_TURNSTILE_SITE_KEY', 'OPENAI_API_KEY', 'TURNSTILE_SECRET_KEY'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    Object.assign(process.env, { PUBLIC_SUPABASE_URL: 'https://example.supabase.co', PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example', PUBLIC_TURNSTILE_SITE_KEY: 'public-site-key', OPENAI_API_KEY: 'test-private-openai-marker', TURNSTILE_SECRET_KEY: 'test-private-turnstile-marker' });
    const config = await publicConfiguration();
    assert.equal(config.apiBaseUrl, 'https://example.supabase.co/functions/v1/reviews-api');
    assert.equal(JSON.stringify(config).includes('test-private'), false);
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_secret_should_not_be_public';
    await assert.rejects(publicConfiguration(), /publishable key/);
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_example';
    process.env.PUBLIC_SUPABASE_URL = 'http://evil.example';
    await assert.rejects(publicConfiguration(), /HTTPS Supabase/);
  } finally { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
});
