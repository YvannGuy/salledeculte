-- =============================================================================
-- Signalements de salles (utilisateurs → admin)
-- Exécuter APRÈS supabase-tables-complete.sql
-- =============================================================================

create table if not exists public.salles_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  salle_id uuid not null references public.salles(id) on delete cascade,
  reason text not null check (reason in (
    'escroquerie',
    'fausse_annonce',
    'contenu_inappropriate',
    'informations_fausses',
    'autres'
  )),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  admin_notes text
);

create index if not exists idx_salles_reports_salle on public.salles_reports(salle_id);
create index if not exists idx_salles_reports_reporter on public.salles_reports(reporter_id);
create index if not exists idx_salles_reports_status on public.salles_reports(status);
create index if not exists idx_salles_reports_created on public.salles_reports(created_at);

alter table public.salles_reports enable row level security;

create policy "users_insert_own_reports"
  on public.salles_reports for insert
  with check (auth.uid() = reporter_id);

create policy "users_select_own_reports"
  on public.salles_reports for select
  using (auth.uid() = reporter_id);

-- Admin lit via service_role (createAdminClient)
