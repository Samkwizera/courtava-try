begin;

alter table public.user_settings
drop column if exists language;

commit;
