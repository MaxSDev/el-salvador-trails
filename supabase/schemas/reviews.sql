-- Declarative schema for the reviews phase. No example testimonials are imported.
create table public.review_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.review_settings (
  singleton boolean primary key default true check (singleton),
  manual_only boolean not null default false
);
insert into public.review_settings (singleton) values (true);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  author_name text not null check (char_length(author_name) between 2 and 80),
  country text not null default '' check (char_length(country) <= 80),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 20 and 2000),
  lang text not null check (lang ~ '^[a-z]{2,5}$'),
  tour_slug text not null default '' check (tour_slug = '' or tour_slug ~ '^[a-z0-9-]{1,100}$'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  moderation_reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  consent_at timestamptz not null default now(),
  consent_version text not null default 'reviews-v1',
  published_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  version integer not null default 0,
  check (status <> 'approved' or published_at is not null)
);
create index reviews_published_idx on public.reviews (published_at desc, id) where status = 'approved';
create index reviews_queue_idx on public.reviews (status, created_at desc);
create table public.review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  position smallint not null check (position between 0 and 3),
  unique (review_id, position)
);
create table public.review_audit (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  detail jsonb not null,
  created_at timestamptz not null default now()
);
create table public.review_rate_limits (
  key_hash text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
create index review_rate_expiry_idx on public.review_rate_limits (window_start);

alter table public.review_admins enable row level security;
alter table public.review_settings enable row level security;
alter table public.reviews enable row level security;
alter table public.review_photos enable row level security;
alter table public.review_audit enable row level security;
alter table public.review_rate_limits enable row level security;
revoke all on public.review_admins, public.review_settings, public.reviews, public.review_photos, public.review_audit, public.review_rate_limits from public, anon, authenticated;
grant usage on schema public to authenticated, service_role;
grant select on public.review_admins, public.review_settings, public.reviews, public.review_photos, public.review_audit to authenticated;
grant select, insert, update, delete on public.review_admins, public.review_settings, public.reviews, public.review_photos, public.review_audit, public.review_rate_limits to service_role;
create policy review_admin_self_read on public.review_admins for select to authenticated using (user_id = (select auth.uid()));
create policy reviews_admin_read on public.reviews for select to authenticated using (exists (select 1 from public.review_admins where user_id = (select auth.uid())));
create policy review_photos_admin_read on public.review_photos for select to authenticated using (exists (select 1 from public.review_admins where user_id = (select auth.uid())));
create policy review_settings_admin_read on public.review_settings for select to authenticated using (exists (select 1 from public.review_admins where user_id = (select auth.uid())));
create policy review_audit_admin_read on public.review_audit for select to authenticated using (exists (select 1 from public.review_admins where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
create policy review_storage_admin_read on storage.objects for select to authenticated
using (bucket_id = 'review-photos' and exists (select 1 from public.review_admins where user_id = (select auth.uid())));
-- No visitor storage read/write policies: uploads and short-lived read URLs go through the server.

create function public.consume_review_rate_limit(p_key text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  delete from public.review_rate_limits where window_start < now() - interval '1 day';
  insert into public.review_rate_limits (key_hash, window_start, attempts) values (p_key, now(), 1)
  on conflict (key_hash) do update set
    attempts = case when public.review_rate_limits.window_start < now() - interval '10 minutes' then 1 else public.review_rate_limits.attempts + 1 end,
    window_start = case when public.review_rate_limits.window_start < now() - interval '10 minutes' then now() else public.review_rate_limits.window_start end
  returning attempts into n;
  return n <= 3;
end $$;

create function public.create_guest_review(p_review jsonb, p_photos jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare existing public.reviews; item jsonb; result public.reviews; reasons text[]; new_status text; manual boolean;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_review->>'submission_id', 0));
  select * into existing from public.reviews where submission_id = (p_review->>'submission_id')::uuid;
  if found then
    if existing.payload_hash <> p_review->>'payload_hash' then raise exception 'submission-conflict'; end if;
    return jsonb_build_object('id', existing.id, 'status', existing.status, 'created', false);
  end if;
  select manual_only into manual from public.review_settings where singleton = true for share;
  new_status := p_review->>'status';
  if new_status not in ('pending', 'approved') or new_status is null then raise exception 'invalid-status'; end if;
  select coalesce(array_agg(value), '{}') into reasons from jsonb_array_elements_text(p_review->'moderation_reasons');
  if jsonb_typeof(p_photos) <> 'array' or jsonb_array_length(p_photos) > 4 then raise exception 'photo-count'; end if;
  if manual then new_status := 'pending'; reasons := array_append(reasons, 'manual-mode'); end if;
  if jsonb_array_length(p_photos) > 0 then new_status := 'pending'; reasons := array_append(reasons, 'photos'); end if;
  insert into public.reviews (id, submission_id, payload_hash, author_name, country, rating, body, lang, tour_slug, status, moderation_reasons, published_at)
  values ((p_review->>'id')::uuid, (p_review->>'submission_id')::uuid, p_review->>'payload_hash', p_review->>'author_name', coalesce(p_review->>'country', ''),
    (p_review->>'rating')::smallint, p_review->>'body', p_review->>'lang', coalesce(p_review->>'tour_slug', ''), new_status, reasons,
    case when new_status = 'approved' then now() else null end) returning * into result;
  for item in select value from jsonb_array_elements(p_photos) loop
    if item->>'storage_path' not like result.id::text || '/%' then raise exception 'photo-path'; end if;
    insert into public.review_photos (review_id, storage_path, mime_type, size_bytes, position)
    values (result.id, item->>'storage_path', item->>'mime_type', (item->>'size_bytes')::integer, (item->>'position')::smallint);
  end loop;
  return jsonb_build_object('id', result.id, 'status', result.status, 'created', true);
end $$;

create function public.moderate_guest_review(p_actor uuid, p_id uuid, p_status text, p_version integer) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare old public.reviews;
begin
  if not exists (select 1 from public.review_admins where user_id = p_actor) then raise exception 'forbidden'; end if;
  if p_status not in ('approved', 'rejected', 'hidden') then raise exception 'invalid-status'; end if;
  select * into old from public.reviews where id = p_id for update;
  if not found then raise exception 'review-not-found'; end if;
  if old.version <> p_version then raise exception 'stale-review'; end if;
  update public.reviews set status = p_status, reviewed_by = p_actor, reviewed_at = now(), version = version + 1,
    published_at = case when p_status = 'approved' then now() else published_at end where id = p_id;
  insert into public.review_audit (review_id, actor_id, action, detail)
    values (p_id, p_actor, 'moderate', jsonb_build_object('from', old.status, 'to', p_status));
  return jsonb_build_object('id', p_id, 'status', p_status, 'version', p_version + 1);
end $$;

create function public.set_review_manual_mode(p_actor uuid, p_manual boolean) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.review_admins where user_id = p_actor) then raise exception 'forbidden'; end if;
  update public.review_settings set manual_only = p_manual where singleton = true;
  insert into public.review_audit (actor_id, action, detail) values (p_actor, 'manual-mode', jsonb_build_object('enabled', p_manual));
end $$;

revoke all on function public.consume_review_rate_limit(text), public.create_guest_review(jsonb,jsonb), public.moderate_guest_review(uuid,uuid,text,integer), public.set_review_manual_mode(uuid,boolean) from public, anon, authenticated;
grant execute on function public.consume_review_rate_limit(text), public.create_guest_review(jsonb,jsonb), public.moderate_guest_review(uuid,uuid,text,integer), public.set_review_manual_mode(uuid,boolean) to service_role;

-- Durable cleanup: database deletion and external Storage deletion cannot share a transaction.
-- Keep only file paths here until Storage confirms removal; no review text or author is retained.
create table public.review_photo_deletions (
  review_id uuid primary key,
  storage_paths text[] not null check (cardinality(storage_paths) between 1 and 4),
  created_at timestamptz not null default now()
);
create index review_photo_deletions_created_idx on public.review_photo_deletions (created_at);
alter table public.review_photo_deletions enable row level security;
revoke all on public.review_photo_deletions from public, anon, authenticated;
grant select, insert, delete on public.review_photo_deletions to service_role;

create function public.delete_guest_review(p_actor uuid, p_id uuid, p_version integer) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare old public.reviews; paths text[];
begin
  if not exists (select 1 from public.review_admins where user_id = p_actor) then raise exception 'forbidden'; end if;
  if p_version is null or p_version < 0 then raise exception 'invalid-version'; end if;
  select * into old from public.reviews where id = p_id for update;
  if found then
    if old.version <> p_version then raise exception 'stale-review'; end if;
    select coalesce(array_agg(storage_path order by position), '{}') into paths from public.review_photos where review_id = p_id;
    if cardinality(paths) > 0 then
      insert into public.review_photo_deletions (review_id, storage_paths) values (p_id, paths);
    end if;
    delete from public.review_audit where review_id = p_id;
    delete from public.reviews where id = p_id; -- photo metadata is removed by ON DELETE CASCADE
    insert into public.review_audit (actor_id, action, detail)
      values (p_actor, 'delete', jsonb_build_object('deleted_review_id', p_id));
  else
    -- A retry after a lost response must recover any unfinished Storage cleanup.
    select storage_paths into paths from public.review_photo_deletions where review_id = p_id;
  end if;
  return jsonb_build_object('id', p_id, 'storage_paths', coalesce(paths, '{}'));
end $$;
revoke all on function public.delete_guest_review(uuid,uuid,integer) from public, anon, authenticated;
grant execute on function public.delete_guest_review(uuid,uuid,integer) to service_role;
