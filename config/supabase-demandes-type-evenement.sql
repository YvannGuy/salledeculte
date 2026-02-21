-- Colonne type_evenement pour les demandes (formulaire Vérifier la disponibilité)
-- Exécuter dans l'éditeur SQL Supabase si la colonne n'existe pas

ALTER TABLE demandes ADD COLUMN IF NOT EXISTS type_evenement TEXT;
