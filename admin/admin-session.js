import { createClient } from './supabase-client.js';

let client;
const modulePages = { 'content.html': 'content', 'real-estate.html': 'content', 'site.html': 'content', 'reviews.html': 'reviews' };

export function getAdminClient() {
  if (client) return client;
  const config = window.ESTReviewsConfig || {};
  if (!config.supabaseUrl || !config.publishableKey) return null;
  client = createClient(config.supabaseUrl, config.publishableKey, {
    auth: { storage: sessionStorage, storageKey: 'est-review-admin', autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });
  return client;
}

export function isLocalPreview() {
  return Boolean(window.ESTReviewsConfig?.localPreview && ['127.0.0.1', 'localhost'].includes(location.hostname));
}

export function recoveryRequested() {
  return ['invite', 'recovery'].includes(new URLSearchParams(location.hash.slice(1)).get('type'));
}

export function adminHomeUrl() { return new URL('./', import.meta.url).href; }

export function redirectToAdminLogin() {
  const home = new URL(adminHomeUrl());
  const page = location.pathname.split('/').at(-1);
  if (modulePages[page]) home.searchParams.set('next', page);
  if (recoveryRequested()) home.hash = location.hash;
  location.assign(home.href);
}

export async function loadAdminAccess(adminClient = getAdminClient()) {
  const { data, error } = adminClient ? await adminClient.auth.getSession() : { data: {}, error: true };
  if (error || !data.session) return { session: null };
  const config = window.ESTReviewsConfig || {};
  async function access(base) {
    if (!base) return { allowed: null, reason: 'unconfigured' };
    try {
      const response = await fetch(base.replace(/\/$/, '') + '/access', {
        headers: { apikey: config.publishableKey, Authorization: 'Bearer ' + data.session.access_token },
        cache: 'no-store', signal: AbortSignal.timeout(15000)
      });
      if (response.status === 401) return { allowed: null, reason: 'session-required' };
      if (response.status === 403) return { allowed: false };
      if (!response.ok) return { allowed: null, reason: 'unavailable' };
      const result = await response.json();
      return typeof result.allowed === 'boolean' ? { allowed: result.allowed } : { allowed: null, reason: 'unavailable' };
    } catch { return { allowed: null, reason: 'unavailable' }; }
  }
  const [content, reviews] = await Promise.all([access(config.contentApiBaseUrl), access(config.apiBaseUrl)]);
  return { session: data.session, content, reviews };
}

export async function initializeAdminNavigation(adminClient = getAdminClient()) {
  const access = await loadAdminAccess(adminClient);
  if (!access.session) return access;
  document.querySelectorAll('.admin-header nav a').forEach(link => {
    const page = new URL(link.href).pathname.split('/').at(-1);
    const module = modulePages[page];
    if (module && access[module]?.allowed === false) link.hidden = true;
  });
  return access;
}
