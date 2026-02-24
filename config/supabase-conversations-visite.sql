-- Conversations pour demandes de visite (en plus des demandes de location)
-- Exécuter dans Supabase SQL Editor après supabase-visites.sql
-- Permet au locataire et au propriétaire d'échanger après une demande de visite (acceptée, refusée, etc.)

-- Rendre demande_id nullable pour les conversations liées à une visite
ALTER TABLE conversations ALTER COLUMN demande_id DROP NOT NULL;

-- Ajouter demande_visite_id (nullable)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS demande_visite_id uuid REFERENCES demandes_visite(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_demande_visite ON conversations(demande_visite_id);

COMMENT ON COLUMN conversations.demande_visite_id IS 'Lien optionnel vers une demande de visite (conversation vis-à-vis d''une salle suite à une visite)';
