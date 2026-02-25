-- Autorise les offres liées uniquement à une demande de visite
-- (pas de demande de location associée)
ALTER TABLE offers
  ALTER COLUMN demande_id DROP NOT NULL;
