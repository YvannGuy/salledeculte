-- Paiement en acompte + solde J-1 pour les offres
-- Exécuter dans Supabase SQL Editor

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'full'
    CHECK (payment_mode IN ('full', 'split')),
  ADD COLUMN IF NOT EXISTS upfront_amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_amount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_plan_status text NOT NULL DEFAULT 'pending_deposit'
    CHECK (
      payment_plan_status IN (
        'pending_deposit',
        'deposit_paid',
        'balance_scheduled',
        'balance_paid',
        'balance_failed',
        'fully_paid',
        'expired_unpaid'
      )
    ),
  ADD COLUMN IF NOT EXISTS upfront_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS balance_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS balance_last_error text,
  ADD COLUMN IF NOT EXISTS balance_retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_paid_at timestamptz;

-- Backfill offres historiques (paiement en 1 fois)
UPDATE offers
SET
  payment_mode = 'full',
  upfront_amount_cents = COALESCE(NULLIF(upfront_amount_cents, 0), amount_cents),
  balance_amount_cents = COALESCE(balance_amount_cents, 0),
  payment_plan_status = CASE
    WHEN status = 'paid' THEN 'fully_paid'
    WHEN status = 'pending' THEN 'pending_deposit'
    ELSE payment_plan_status
  END
WHERE payment_mode IS NULL
   OR upfront_amount_cents = 0;

-- Sécurité minimale sur la table payments pour distinguer acompte / solde
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT 'full'
    CHECK (payment_type IN ('full', 'deposit', 'balance'));

CREATE INDEX IF NOT EXISTS idx_offers_payment_plan_status ON offers(payment_plan_status);
CREATE INDEX IF NOT EXISTS idx_offers_balance_due_at ON offers(balance_due_at);
CREATE INDEX IF NOT EXISTS idx_payments_offer_payment_type ON payments(offer_id, payment_type);

COMMENT ON COLUMN offers.payment_mode IS 'Mode de paiement de la réservation: full ou split';
COMMENT ON COLUMN offers.upfront_amount_cents IS 'Montant d''acompte (ou montant total si full), en centimes';
COMMENT ON COLUMN offers.balance_amount_cents IS 'Montant restant à prélever, en centimes';
COMMENT ON COLUMN offers.balance_due_at IS 'Date prévue du prélèvement du solde (J-1)';
COMMENT ON COLUMN offers.payment_plan_status IS 'Etat du plan de paiement en plusieurs échéances';
COMMENT ON COLUMN offers.upfront_paid_at IS 'Date de paiement de l''acompte';
COMMENT ON COLUMN offers.balance_payment_intent_id IS 'PaymentIntent Stripe du solde';
COMMENT ON COLUMN offers.balance_last_error IS 'Dernière erreur Stripe sur tentative de solde';
COMMENT ON COLUMN offers.balance_retry_count IS 'Nombre de tentatives de prélèvement du solde';
COMMENT ON COLUMN offers.balance_paid_at IS 'Date de paiement du solde';
COMMENT ON COLUMN payments.payment_type IS 'Type de paiement réservation: full, deposit, balance';
