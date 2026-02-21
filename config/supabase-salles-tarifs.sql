-- Colonnes optionnelles pour tarifs mensuel et horaire
ALTER TABLE salles
  ADD COLUMN IF NOT EXISTS price_per_month integer,
  ADD COLUMN IF NOT EXISTS price_per_hour integer;
