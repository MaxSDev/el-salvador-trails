// Prepare a reviewed import; this script does not connect to Supabase.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './build-site.mjs';
import { validateTour, validatePartner } from '../supabase/functions/_shared/content-policy.mjs';
const literal = value => "'" + String(value).replaceAll("'", "''") + "'";
export function contentSeedSQL(tours, email = '', partners = []) {
  let sql = '-- Initial import only; ON CONFLICT preserves existing owner edits.\nbegin;\n';
  for (const [index,tour] of tours.entries()) {
    const value = literal(JSON.stringify(validateTour({...tour,sortOrder:index}))) + '::jsonb';
    sql += `insert into public.content_documents(id,kind,draft,published,status) select ${literal(tour.id)},'tour',${value},${value},'published' where not exists (select 1 from public.content_audit where document_id=${literal(tour.id)} and action='delete') on conflict(id) do nothing;\n`;
  }
  for (const partner of partners) {
    const data = validatePartner(partner); const value = literal(JSON.stringify(data)) + '::jsonb';
    sql += `insert into public.content_documents(id,kind,draft,published,status) select ${literal(data.id)},'partner',${value},${value},'published' where not exists (select 1 from public.content_audit where document_id=${literal(data.id)} and action='delete') on conflict(id) do nothing;\n`;
  }
  sql += "insert into public.content_documents(id,kind,draft,published,status) values ('site','site','{}'::jsonb,'{}'::jsonb,'published') on conflict(id) do nothing;\n";
  if (email) {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) throw new Error('Provide the existing owner email.');
    sql += `do $$ begin if not exists(select 1 from auth.users where lower(email) = lower(${literal(email)})) then raise exception 'Create the owner in Supabase Auth first'; end if; end $$;\n`;
    sql += `insert into public.content_admins(user_id) select id from auth.users where lower(email) = lower(${literal(email)}) on conflict(user_id) do nothing;\n`;
  }
  return sql + 'commit;\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tours = JSON.parse(await readFile(join(projectRoot,'data/tours.json'),'utf8')).tours;
  const partners = JSON.parse(await readFile(join(projectRoot,'data/real-estate.json'),'utf8')).partners;
  const index = process.argv.indexOf('--admin-email');
  if (index >= 0 && !process.argv[index + 1]) throw new Error('Provide the existing owner email.');
  const sql = contentSeedSQL(tours, index >= 0 ? process.argv[index + 1] : '', partners);
  await mkdir(join(projectRoot,'.local'),{recursive:true});
  await writeFile(join(projectRoot,'.local/content-seed.sql'),sql);
  console.log(`Prepared .local/content-seed.sql with ${tours.length} tours and ${partners.length} allies. No remote data was changed.`);
}
