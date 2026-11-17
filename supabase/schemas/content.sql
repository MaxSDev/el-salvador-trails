-- Desired state. Deploy only the reviewed delta; don't rerun the reviews schema.
create table public.content_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.content_documents (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 100),
  kind text not null check (kind in ('tour','partner','site')),
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  status text not null default 'draft' check (status in ('draft','published','hidden')),
  version integer not null default 0 check (version >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check ((kind = 'site' and id = 'site') or (kind = 'tour' and id <> 'site' and id not like 'partner-%') or (kind = 'partner' and id ~ '^partner-[a-z0-9]+(-[a-z0-9]+)*$')),
  check (status <> 'published' or published is not null)
);
create table public.content_media (
  path text primary key check (path ~ '^[0-9a-f-]{36}\.(png|jpg|webp)$'),
  url text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
create table public.content_audit (
  id uuid primary key default gen_random_uuid(),
  -- Keep the identifier after deletion so audit history survives and imports cannot restore it.
  document_id text not null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('save','publish','hide','delete')),
  version integer not null,
  created_at timestamptz not null default now()
);
create index content_audit_document_idx on public.content_audit(document_id, created_at desc);
create index content_media_created_idx on public.content_media(created_at desc);
alter table public.content_admins enable row level security;
alter table public.content_documents enable row level security;
alter table public.content_media enable row level security;
alter table public.content_audit enable row level security;
revoke all on public.content_admins, public.content_documents, public.content_media, public.content_audit from anon, authenticated;
grant select, insert, update, delete on public.content_admins, public.content_documents, public.content_media, public.content_audit to service_role;

create or replace function public.write_site_content(p_actor uuid, p_id text, p_kind text, p_draft jsonb, p_action text, p_version integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare item public.content_documents;
begin
  if not exists (select 1 from public.content_admins where user_id = p_actor) then raise exception 'content-forbidden'; end if;
  if p_action is null or p_action not in ('save','publish','hide','delete') or p_kind is null or p_kind not in ('tour','partner','site') or p_version is null or p_version < 0 then raise exception 'content-invalid'; end if;
  if p_id is null or p_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(p_id) > 100 then raise exception 'content-invalid'; end if;
  if (p_kind = 'site' and p_id <> 'site') or (p_kind = 'tour' and (p_id = 'site' or p_id like 'partner-%')) or (p_kind = 'partner' and p_id !~ '^partner-[a-z0-9]+(-[a-z0-9]+)*$') then raise exception 'content-invalid'; end if;
  if p_kind = 'site' and p_action in ('hide','delete') then raise exception 'content-invalid'; end if;
  if p_action not in ('hide','delete') and (p_draft is null or jsonb_typeof(p_draft) <> 'object' or octet_length(p_draft::text) > 131072) then raise exception 'content-invalid'; end if;
  if p_kind = 'tour' and p_action not in ('hide','delete') and (p_draft->>'id' is distinct from p_id or p_draft->>'slug' is distinct from p_id) then raise exception 'content-invalid'; end if;
  if p_kind = 'tour' and p_action = 'publish' and (coalesce(p_draft#>>'{title,es}', '') = '' or jsonb_typeof(p_draft->'images') is distinct from 'array' or jsonb_array_length(p_draft->'images') = 0) then raise exception 'content-invalid'; end if;
  if p_kind = 'partner' and p_action not in ('hide','delete') and (p_draft->>'id' is distinct from p_id or coalesce(p_draft->>'slug', substring(p_id from 9)) is distinct from substring(p_id from 9)) then raise exception 'content-invalid'; end if;
  if p_kind = 'partner' and p_action = 'publish' then
    if coalesce(p_draft->>'type', '') not in ('lodging','partner')
      or coalesce(trim(p_draft#>>'{name,es}'), '') = ''
      or coalesce(trim(p_draft#>>'{shortDescription,es}'), '') = ''
      or coalesce(trim(p_draft#>>'{description,es}'), '') = ''
      or jsonb_typeof(p_draft->'images') is distinct from 'array' then raise exception 'content-invalid'; end if;
    if jsonb_array_length(p_draft->'images') not between 1 and 30 then raise exception 'content-invalid'; end if;
  end if;
  select * into item from public.content_documents where id = p_id for update;
  if found then
    if item.version <> p_version or item.kind <> p_kind then raise exception 'content-conflict'; end if;
  else
    if p_version <> 0 or p_action = 'delete' or exists (select 1 from public.content_audit where document_id = p_id and action = 'delete') then raise exception 'content-conflict'; end if;
    if p_action = 'hide' or (select count(*) from public.content_documents) >= 201 then raise exception 'content-invalid'; end if;
    insert into public.content_documents(id,kind,draft) values(p_id,p_kind,p_draft) returning * into item;
  end if;
  if p_action = 'delete' then
    insert into public.content_audit(document_id,actor_id,action,version) values(p_id,p_actor,'delete',item.version + 1);
    delete from public.content_documents where id = p_id;
    return jsonb_build_object('deleted', jsonb_build_object('id', p_id));
  end if;
  update public.content_documents set
    draft = case when p_action = 'hide' then draft else p_draft end,
    published = case when p_action = 'publish' then p_draft else published end,
    status = case when p_action = 'publish' then 'published' when p_action = 'hide' then 'hidden' else status end,
    version = version + 1, updated_at = now(), updated_by = p_actor
    where id = p_id returning * into item;
  insert into public.content_audit(document_id,actor_id,action,version) values(p_id,p_actor,p_action,item.version);
  return to_jsonb(item);
exception when unique_violation then raise exception 'content-conflict';
end $$;
revoke all on function public.write_site_content(uuid,text,text,jsonb,text,integer) from public, anon, authenticated;
grant execute on function public.write_site_content(uuid,text,text,jsonb,text,integer) to service_role;

-- Tourism images are intentionally public; uploads/listing still require the content API.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('site-media','site-media',true,5242880,array['image/jpeg','image/png','image/webp']);
