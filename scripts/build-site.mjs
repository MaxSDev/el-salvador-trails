import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile, readdir, lstat, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('..', import.meta.url));
export async function publicConfiguration() {
  let local = {};
  try {
    const text = await readFile(join(projectRoot, '.env.local'), 'utf8');
    local = Object.fromEntries(text.split(/\r?\n/).filter(line => /^[A-Z_]+=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')]; }));
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const value = key => process.env[key] ?? local[key] ?? '';
  const url = value('PUBLIC_SUPABASE_URL').replace(/\/$/, '');
  const key = value('PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (key && !key.startsWith('sb_publishable_')) throw new Error('Use a publishable key. Private service keys must never be bundled.');
  if (url && (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))) throw new Error('PUBLIC_SUPABASE_URL must be the HTTPS Supabase project URL.');
  return { apiBaseUrl: url ? url + '/functions/v1/reviews-api' : '', supabaseUrl: url, publishableKey: key, turnstileSiteKey: value('PUBLIC_TURNSTILE_SITE_KEY'), localPreview: false };
}
export async function browserBundle() {
  const result = await build({ entryPoints: [join(projectRoot, 'admin/supabase-client-entry.js')], bundle: true, format: 'esm', target: ['es2022'], minify: true, write: false });
  return result.outputFiles[0].contents;
}
export async function buildSite() {
  const output = resolve(projectRoot, 'dist');
  // Remove only this project's generated directory; reject a symlink before a recursive operation.
  if (output !== join(resolve(projectRoot), 'dist')) throw new Error('Invalid build directory');
  try { if ((await lstat(output)).isSymbolicLink()) throw new Error('Build directory cannot be a symlink'); await rm(output, { recursive: true }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(output, { recursive: true });
  for (const dir of ['assets', 'css', 'js']) await cp(join(projectRoot, dir), join(output, dir), { recursive: true });
  await mkdir(join(output, 'data')); await mkdir(join(output, 'admin'));
  for (const name of await readdir(join(projectRoot, 'data'))) {
    if (name.startsWith('reviews')) continue;
    await cp(join(projectRoot, 'data', name), join(output, 'data', name));
  }
  for (const name of await readdir(projectRoot)) if (name.endsWith('.html')) await cp(join(projectRoot, name), join(output, name));
  for (const name of ['index.html', 'reviews-admin.css', 'reviews-admin.js']) await cp(join(projectRoot, 'admin', name), join(output, 'admin', name));
  await writeFile(join(output, 'admin/supabase-client.js'), await browserBundle());
  await writeFile(join(output, 'js/reviews-config.js'), 'window.ESTReviewsConfig = Object.freeze(' + JSON.stringify(await publicConfiguration()) + ');\n');
  console.log('Site built in dist/. No private configuration or review records are included.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildSite();
