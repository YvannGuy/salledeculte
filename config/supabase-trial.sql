-- Colonne pour savoir si l'utilisateur a activé son essai gratuit
-- IMPORTANT: Ne pas mettre de DEFAULT - les nouveaux comptes doivent avoir NULL
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMPTZ;

-- Vérifier qu'aucun trigger ne définit trial_activated_at à l'insertion
