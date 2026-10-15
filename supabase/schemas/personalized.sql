-- Additive schema. Apply only this reviewed file/migration, never rerun reviews.sql.
create table public.personalized_requests (
  id uuid primary key,
  payload_hash text not null,
  schema_version integer not null check (schema_version=1),
  lang text not null check (lang in ('es','en','pt')),
  status text not null default 'new' check (status in ('new','contacted','quoted','closed')),
  contact jsonb not null,
  profile jsonb not null,
  consent_version text not null check (consent_version='personalized-v1'),
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index personalized_created_status on public.personalized_requests(created_at,status);
create index personalized_age on public.personalized_requests ((profile->>'age_range'));
create index personalized_interests on public.personalized_requests using gin ((profile->'interests'));
create index personalized_nationalities on public.personalized_requests using gin ((profile->'nationalities'));
create table public.personalized_rate_limits (request_id uuid primary key references public.personalized_requests(id),ip_hash text not null,created_at timestamptz not null default now());
create index personalized_rate_window on public.personalized_rate_limits(ip_hash,created_at);
create table public.personalized_mail_outbox (
  request_id uuid primary key references public.personalized_requests(id),
  status text not null default 'pending' check(status in ('pending','sending','sent','error')),
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  leased_at timestamptz,
  sent_at timestamptz,
  provider_id text,
  created_at timestamptz not null default now()
);
alter table public.personalized_requests enable row level security;
alter table public.personalized_rate_limits enable row level security;
alter table public.personalized_mail_outbox enable row level security;
revoke all on public.personalized_requests,public.personalized_rate_limits,public.personalized_mail_outbox from public,anon,authenticated;
grant all on public.personalized_requests,public.personalized_rate_limits,public.personalized_mail_outbox to service_role;

create function public.save_personalized_request(p_id uuid,p_digest text,p_ip text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare previous public.personalized_requests;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_ip,1));
  select * into previous from public.personalized_requests where id=p_id;
  if found then
    if previous.payload_hash<>p_digest then raise exception 'conflict'; end if;
    return jsonb_build_object('id',p_id);
  end if;
  delete from public.personalized_rate_limits where created_at<now()-interval '10 minutes';
  if (select count(*) from public.personalized_rate_limits where ip_hash=p_ip)>=3 then raise exception 'rate-limit'; end if;
  insert into public.personalized_requests(id,payload_hash,schema_version,lang,contact,profile,consent_version)
  values(p_id,p_digest,(p_data->>'schema_version')::integer,p_data->>'lang',p_data->'contact',p_data->'profile',p_data->>'consent_version');
  insert into public.personalized_rate_limits(request_id,ip_hash) values(p_id,p_ip);
  insert into public.personalized_mail_outbox(request_id) values(p_id);
  return jsonb_build_object('id',p_id);
end $$;

create function public.claim_personalized_mail(p_limit integer default 10)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
  with candidates as (
    select request_id from public.personalized_mail_outbox
    where status in ('pending','error','sending') and attempts<5
      and (leased_at is null or leased_at<now()-interval '10 minutes')
      and (first_attempt_at is null or first_attempt_at>now()-interval '23 hours')
    order by created_at limit least(greatest(p_limit,1),10) for update skip locked
  ), claimed as (
    update public.personalized_mail_outbox o set status='sending',attempts=attempts+1,leased_at=now(),first_attempt_at=coalesce(first_attempt_at,now())
    from candidates c where o.request_id=c.request_id returning o.request_id
  ) select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'request',to_jsonb(r))),'[]'::jsonb) into result
  from claimed c join public.personalized_requests r on r.id=c.request_id;
  return result;
end $$;

create function public.personalized_stats(p_from timestamptz,p_to timestamptz)
returns jsonb language sql security definer set search_path=public,pg_temp as $$
with base as (select created_at,profile from public.personalized_requests where created_at>=p_from and created_at<p_to),
expanded as (
 select 'nationality' as dimension,jsonb_array_elements_text(profile->'nationalities') as key from base
 union all select 'interests',jsonb_array_elements_text(profile->'interests') from base
 union all select 'age_range',profile->>'age_range' from base
 union all select 'group_size',profile->>'group_size' from base
 union all select 'stay_length',profile->>'stay_length' from base
 union all select 'budget',profile->>'budget' from base
 union all select 'accommodation',profile->>'accommodation' from base
),counts as (select dimension,key,count(*) as n from expanded group by dimension,key),
dimensions as (select dimension,jsonb_agg(jsonb_build_object('key',key,'count',n) order by key) as buckets from counts group by dimension),
months as (select to_char(created_at at time zone 'America/El_Salvador','YYYY-MM') as key,count(*) as n from base group by 1)
select jsonb_build_object('version',1,'unit','requests','timeZone','America/El_Salvador','from',p_from,'to',p_to,'total',(select count(*) from base),
 'byMonth',coalesce((select jsonb_agg(jsonb_build_object('key',key,'count',n) order by key) from months),'[]'::jsonb),
 'dimensions',jsonb_build_object('nationality','[]'::jsonb,'interests','[]'::jsonb,'age_range','[]'::jsonb,'group_size','[]'::jsonb,'stay_length','[]'::jsonb,'budget','[]'::jsonb,'accommodation','[]'::jsonb)||coalesce((select jsonb_object_agg(dimension,buckets) from dimensions),'{}'::jsonb));
$$;
revoke all on function public.save_personalized_request(uuid,text,text,jsonb),public.claim_personalized_mail(integer),public.personalized_stats(timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.save_personalized_request(uuid,text,text,jsonb),public.claim_personalized_mail(integer),public.personalized_stats(timestamptz,timestamptz) to service_role;
