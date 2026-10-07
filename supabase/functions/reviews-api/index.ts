import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { createReviewHandler } from '../_shared/review-handler.mjs';
import { supabaseReviewAdapter } from '../_shared/supabase-review-adapter.mjs';

const env = (name: string) => Deno.env.get(name) || '';
const client = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
const allowedOrigins = env('REVIEW_ALLOWED_ORIGINS').split(',').map(value => value.trim()).filter(Boolean);
const allowedHostnames = new Set(allowedOrigins.map(value => new URL(value).hostname));
const handler = createReviewHandler({
  ...supabaseReviewAdapter(client),
  hashIP: async (ip: string) => {
    const salt = env('REVIEW_RATE_SALT');
    if (salt.length < 32) throw new Error('Rate salt is missing');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(salt), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip + ':' + new Date().toISOString().slice(0, 10)));
    return [...new Uint8Array(signature)].map(v => v.toString(16).padStart(2, '0')).join('');
  },
  verifyTurnstile: async (token: string, ip: string) => {
    const secret = env('TURNSTILE_SECRET_KEY');
    // Testing keys must never be accepted by the deployed production handler.
    if (!secret || /^[123]x0000000000000000000000000000000/.test(secret)) return false;
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== 'unknown') body.set('remoteip', ip);
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && result.action === 'review' && allowedHostnames.has(result.hostname);
  },
  moderate: async (text: string) => {
    const key = env('OPENAI_API_KEY'); if (!key) throw new Error('Moderation is not configured');
    const response = await fetch('https://api.openai.com/v1/moderations', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'omni-moderation-latest', input: text }), signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Moderation failed');
    return (await response.json()).results?.[0];
  }
}, { allowedOrigins });

// Public visitor endpoints and verified admin endpoints share this router.
// JWT verification is intentionally performed by auth.getUser for admin operations.
Deno.serve(handler);
