-- Crédits gratuits supplémentaires (recharges admin) pour le pass gratuit
-- remaining = (pass.demandes_gratuites - used) + free_pass_credits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_pass_credits INTEGER NOT NULL DEFAULT 0;
