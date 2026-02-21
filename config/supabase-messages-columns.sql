-- Si la table messages n'affiche pas le dernier message, exécutez ce script dans Supabase SQL Editor.
-- Vérifie / ajoute les colonnes nécessaires.

-- Ajouter created_at si absent (fallback pour tri)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Ajouter sent_at si absent (utilisé pour le tri des messages)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT NOW();

-- Mettre à jour sent_at pour les messages existants qui n'en ont pas
UPDATE messages SET sent_at = COALESCE(sent_at, created_at, NOW()) WHERE sent_at IS NULL;
