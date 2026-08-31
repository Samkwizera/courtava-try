begin;

create table if not exists public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reporter_email text,
  category text not null check (category in ('bug', 'account', 'court_data', 'feature', 'other')),
  subject text not null check (char_length(btrim(subject)) between 3 and 120),
  description text not null check (char_length(btrim(description)) between 10 and 4000),
  page_path text,
  app_version text,
  user_agent text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.issue_reports enable row level security;

create policy "Users can create their own issue reports"
on public.issue_reports for insert to authenticated
with check ((select auth.uid()) = user_id);

create trigger update_issue_reports_updated_at
before update on public.issue_reports
for each row execute function public.update_updated_at_column();

create index issue_reports_status_created_at_idx
on public.issue_reports (status, created_at desc);

commit;
