-- Table platform_settings : configuration de la plateforme (clé-valeur)
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

-- Aucune policy publique : accès via service_role uniquement (admin)

-- Données initiales
INSERT INTO public.platform_settings (key, value) VALUES
  ('pass', '{"price_24h":4900,"price_48h":7900,"price_abonnement":2900,"demandes_gratuites":3,"pass_24h_enabled":true,"pass_48h_enabled":true,"abonnement_enabled":true}'::jsonb),
  ('validation', '{"validation_manuelle":true,"mode_publication":"manual"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
