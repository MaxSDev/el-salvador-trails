import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { createContentHandler } from '../_shared/content-handler.mjs';
import { supabaseContentAdapter } from '../_shared/supabase-content-adapter.mjs';
const env = (name: string) => Deno.env.get(name) || '';
const client = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(createContentHandler(supabaseContentAdapter(client), {
  allowedOrigins: env('REVIEW_ALLOWED_ORIGINS').split(',').map(value => value.trim()).filter(Boolean),
  mediaOrigin: new URL(env('SUPABASE_URL')).origin,
  reportError: (error: Error) => console.error('Content operation failed:', error.name)
}));
