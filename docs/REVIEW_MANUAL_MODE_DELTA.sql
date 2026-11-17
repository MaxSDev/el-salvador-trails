-- Prepared for review only. This file is not run by the local server or build.
-- Apply only after Oscar explicitly authorizes the remote Supabase change.
-- The deployed reviews module already exists; do not rerun reviews.sql.
-- Existing published reviews and their photos are preserved.
begin;
alter table public.review_settings alter column manual_only set default true;
update public.review_settings set manual_only = true where singleton = true;
commit;

-- Verify after the authorized application:
-- select singleton, manual_only from public.review_settings;
-- New review submissions must remain pending until an administrator approves them.
-- Content/partner schema changes are maintained in supabase/schemas/content.sql.
-- Generate and review that declarative schema delta separately before deployment.
