-- Ajouter type_evenement aux demandes de visite (aligné avec demandes de location)
-- Exécuter dans Supabase SQL Editor après supabase-visites.sql

ALTER TABLE demandes_visite ADD COLUMN IF NOT EXISTS type_evenement text;

COMMENT ON COLUMN demandes_visite.type_evenement IS 'Type d''événement prévu: culte-regulier, conference, celebration, bapteme, retraite';
