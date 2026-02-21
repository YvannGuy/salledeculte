-- Colonnes pour l'aperçu du dernier message dans la liste des conversations
-- Exécutez ce script dans l'éditeur SQL Supabase si "Aucun message" s'affiche systématiquement
-- Prérequis : supabase-messages-columns.sql et supabase-messages-edit-delete.sql (pour sent_at, deleted_at)

-- last_message_at : date/heure du dernier message (pour le tri et le timestamp)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- last_message_preview : aperçu du dernier message (pour la liste sans cliquer)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_preview TEXT;

-- Met à jour les conversations existantes à partir des messages (à exécuter une fois)
UPDATE conversations c
SET last_message_at = COALESCE(c.last_message_at, sub.sent_at),
    last_message_preview = COALESCE(c.last_message_preview, CASE
      WHEN LENGTH(TRIM(sub.content)) > 80 THEN LEFT(TRIM(sub.content), 77) || '...'
      ELSE TRIM(sub.content)
    END)
FROM (
  SELECT DISTINCT ON (conversation_id) conversation_id, COALESCE(sent_at, created_at) AS sent_at, content
  FROM messages
  WHERE deleted_at IS NULL AND content IS NOT NULL AND TRIM(content) != ''
  ORDER BY conversation_id, COALESCE(sent_at, created_at, NOW()) DESC
) sub
WHERE c.id = sub.conversation_id;
