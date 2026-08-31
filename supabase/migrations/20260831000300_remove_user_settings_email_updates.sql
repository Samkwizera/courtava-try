begin;

alter table public.user_settings
drop column if exists email_updates;

commit;
