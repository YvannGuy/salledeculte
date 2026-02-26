-- Telegram user notification setup
-- Exécuter dans Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id text,
  ADD COLUMN IF NOT EXISTS telegram_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS telegram_username text,
  ADD COLUMN IF NOT EXISTS telegram_last_test_at timestamptz,
  ADD COLUMN IF NOT EXISTS notification_channel text NOT NULL DEFAULT 'email';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_notification_channel_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_notification_channel_check
      CHECK (notification_channel IN ('email', 'telegram', 'both'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS telegram_link_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id text,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_user_id
  ON telegram_link_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_expires_at
  ON telegram_link_tokens(expires_at);

