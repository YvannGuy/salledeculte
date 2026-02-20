-- =============================================================================
-- Salles : notes 5 étoiles
-- Exécuter APRÈS supabase-tables-complete.sql
-- =============================================================================

create table if not exists public.salles_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  salle_id uuid not null references public.salles(id) on delete cascade,
  stars int not null check (stars >= 1 and stars <= 5),
  created_at timestamptz not null default now(),
  unique(user_id, salle_id)
);

create index if not exists idx_salles_ratings_salle on public.salles_ratings(salle_id);
create index if not exists idx_salles_ratings_user on public.salles_ratings(user_id);

alter table public.salles_ratings enable row level security;

create policy "users_insert_own_ratings"
  on public.salles_ratings for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_ratings"
  on public.salles_ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "public_select_ratings"
  on public.salles_ratings for select
  using (true);
