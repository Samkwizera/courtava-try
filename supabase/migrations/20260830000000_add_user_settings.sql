begin;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notify_nearby_check_ins boolean not null default true,
  notify_new_games boolean not null default true,
  notify_communities boolean not null default true,
  court_reminders boolean not null default true,
  game_reminders boolean not null default true,
  email_updates boolean not null default false,
  location_enabled boolean not null default false,
  language text not null default 'en' check (language in ('en', 'rw', 'fr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view their own settings"
on public.user_settings for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own settings"
on public.user_settings for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own settings"
on public.user_settings for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create trigger update_user_settings_updated_at
before update on public.user_settings
for each row execute function public.update_updated_at_column();

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.courts set created_by = null where created_by = current_user_id;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

commit;
