-- Exécuter dans l'éditeur SQL Supabase (Dashboard > SQL Editor)
-- 1. Crée la table message_attachments
-- 2. Crée la fonction pour vérifier l'accès aux conversations
-- 3. Les politiques RLS du bucket doivent être ajoutées après la création du bucket (voir README)

-- ============================================
-- Table message_attachments
-- ============================================
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(storage_path)
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS : accès uniquement aux participants de la conversation
CREATE POLICY "message_attachments_select"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_attachments.message_id
        AND (c.seeker_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

CREATE POLICY "message_attachments_insert"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_attachments.message_id
        AND (c.seeker_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

CREATE POLICY "message_attachments_delete"
  ON message_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_attachments.message_id
        AND (c.seeker_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

-- ============================================
-- Fonction pour les politiques Storage
-- Vérifie si l'utilisateur peut accéder à une conversation (via le chemin)
-- ============================================
CREATE OR REPLACE FUNCTION can_access_conversation_for_storage(conv_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id::text = conv_id
      AND (c.seeker_id = auth.uid() OR c.owner_id = auth.uid())
  );
$$;

-- ============================================
-- Politiques Storage (à exécuter APRÈS création du bucket message-attachments)
-- Créer le bucket via: npm run supabase:init-message-storage
-- ============================================

-- Politique SELECT sur storage.objects
DROP POLICY IF EXISTS "message_attachments_storage_select" ON storage.objects;
CREATE POLICY "message_attachments_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments'
    AND can_access_conversation_for_storage(split_part(name, '/', 1))
  );

-- Politique INSERT
DROP POLICY IF EXISTS "message_attachments_storage_insert" ON storage.objects;
CREATE POLICY "message_attachments_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments'
    AND can_access_conversation_for_storage(split_part(name, '/', 1))
  );

-- Politique DELETE
DROP POLICY IF EXISTS "message_attachments_storage_delete" ON storage.objects;
CREATE POLICY "message_attachments_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments'
    AND can_access_conversation_for_storage(split_part(name, '/', 1))
  );
