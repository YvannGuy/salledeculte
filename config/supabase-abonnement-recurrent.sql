-- Migration : abonnement récurrent Stripe
-- Exécutez ce script dans l'éditeur SQL Supabase

-- Colonne stripe_subscription_id sur profiles (pour savoir si l'utilisateur a un abonnement actif)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Colonne subscription_id sur payments (pour lier les paiements aux abonnements Stripe)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Index pour les recherches par subscription_id
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
