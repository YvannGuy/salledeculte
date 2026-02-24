-- Module Etats des lieux + dossiers de remboursement/litige
-- Exécuter dans Supabase SQL Editor

CREATE TABLE IF NOT EXISTS etat_des_lieux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('seeker', 'owner')),
  phase text NOT NULL CHECK (phase IN ('before', 'after')),
  notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (offer_id, role, phase)
);

CREATE TABLE IF NOT EXISTS etat_des_lieux_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etat_des_lieux_id uuid NOT NULL REFERENCES etat_des_lieux(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_etat_des_lieux_offer ON etat_des_lieux(offer_id);
CREATE INDEX IF NOT EXISTS idx_etat_des_lieux_photos_offer ON etat_des_lieux_photos(offer_id);
CREATE INDEX IF NOT EXISTS idx_etat_des_lieux_photos_edl ON etat_des_lieux_photos(etat_des_lieux_id);

CREATE TABLE IF NOT EXISTS refund_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NULL REFERENCES payments(id) ON DELETE SET NULL,
  offer_id uuid NULL REFERENCES offers(id) ON DELETE SET NULL,
  requested_by_role text NOT NULL CHECK (requested_by_role IN ('admin', 'owner', 'seeker')),
  side text NOT NULL DEFAULT 'none' CHECK (side IN ('owner', 'seeker', 'none')),
  case_type text NOT NULL CHECK (case_type IN ('refund_full', 'refund_partial', 'dispute')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
  amount_cents integer NOT NULL DEFAULT 0,
  reason text,
  stripe_refund_id text,
  evidence_required boolean NOT NULL DEFAULT false,
  created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refund_cases_payment ON refund_cases(payment_id);
CREATE INDEX IF NOT EXISTS idx_refund_cases_offer ON refund_cases(offer_id);
CREATE INDEX IF NOT EXISTS idx_refund_cases_status ON refund_cases(status);

CREATE TABLE IF NOT EXISTS refund_case_evidences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES refund_cases(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  description text,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refund_case_evidences_case ON refund_case_evidences(case_id);

ALTER TABLE etat_des_lieux ENABLE ROW LEVEL SECURITY;
ALTER TABLE etat_des_lieux_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_case_evidences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "etat_des_lieux_select_participants" ON etat_des_lieux;
DROP POLICY IF EXISTS "etat_des_lieux_upsert_participants" ON etat_des_lieux;
CREATE POLICY "etat_des_lieux_select_participants"
ON etat_des_lieux
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.id = etat_des_lieux.offer_id
      AND (o.seeker_id = auth.uid() OR o.owner_id = auth.uid())
  )
);
CREATE POLICY "etat_des_lieux_upsert_participants"
ON etat_des_lieux
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.id = etat_des_lieux.offer_id
      AND (
        (etat_des_lieux.role = 'seeker' AND o.seeker_id = auth.uid())
        OR
        (etat_des_lieux.role = 'owner' AND o.owner_id = auth.uid())
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.id = etat_des_lieux.offer_id
      AND (
        (etat_des_lieux.role = 'seeker' AND o.seeker_id = auth.uid())
        OR
        (etat_des_lieux.role = 'owner' AND o.owner_id = auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "etat_des_lieux_photos_select_participants" ON etat_des_lieux_photos;
DROP POLICY IF EXISTS "etat_des_lieux_photos_insert_participants" ON etat_des_lieux_photos;
CREATE POLICY "etat_des_lieux_photos_select_participants"
ON etat_des_lieux_photos
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.id = etat_des_lieux_photos.offer_id
      AND (o.seeker_id = auth.uid() OR o.owner_id = auth.uid())
  )
);
CREATE POLICY "etat_des_lieux_photos_insert_participants"
ON etat_des_lieux_photos
FOR INSERT
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM offers o
    JOIN etat_des_lieux e ON e.id = etat_des_lieux_photos.etat_des_lieux_id
    WHERE o.id = etat_des_lieux_photos.offer_id
      AND (
        (e.role = 'seeker' AND o.seeker_id = auth.uid())
        OR
        (e.role = 'owner' AND o.owner_id = auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "refund_cases_select_participants" ON refund_cases;
CREATE POLICY "refund_cases_select_participants"
ON refund_cases
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.id = refund_cases.offer_id
      AND (o.seeker_id = auth.uid() OR o.owner_id = auth.uid())
  )
  OR
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
  )
);

DROP POLICY IF EXISTS "refund_case_evidences_select_participants" ON refund_case_evidences;
CREATE POLICY "refund_case_evidences_select_participants"
ON refund_case_evidences
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM refund_cases rc
    JOIN offers o ON o.id = rc.offer_id
    WHERE rc.id = refund_case_evidences.case_id
      AND (o.seeker_id = auth.uid() OR o.owner_id = auth.uid())
  )
  OR
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = auth.uid()
      AND p.user_type = 'admin'
  )
);

COMMENT ON TABLE etat_des_lieux IS 'Etats des lieux avant/apres pour chaque offre payée';
COMMENT ON TABLE etat_des_lieux_photos IS 'Photos liées à un état des lieux';
COMMENT ON TABLE refund_cases IS 'Dossiers admin de remboursement total/partiel et litiges';
COMMENT ON TABLE refund_case_evidences IS 'Photos/preuves attachées à un dossier de remboursement/litige';
