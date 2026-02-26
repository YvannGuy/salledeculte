-- Lot 2 SAFE: reduce noisy policy issues without breaking app flows
-- What this script does:
-- 1) Ensures RLS is enabled on key tables (no policy rewrite here)
-- 2) Removes ONLY exact duplicate policies (same table/role/cmd/qual/check)
-- 3) Outputs a report of potentially risky permissive policies for manual review
--
-- Safe principle: no grant revocation and no semantic policy changes.

BEGIN;

-- -------------------------------------------------------------------
-- 1) Ensure RLS enabled on key tables mentioned by Security Advisor
-- -------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY[
    'public.conversations',
    'public.messages',
    'public.offers',
    'public.offres',
    'public.payments',
    'public.demandes',
    'public.demandes_visite',
    'public.reservations',
    'public.salles',
    'public.profiles',
    'public.etat_des_lieux',
    'public.etat_des_lieux_photos',
    'public.message_attachments',
    'public.refund_cases',
    'public.refund_case_evidences',
    'public.salle_views',
    'public.salle_location_exclusions',
    'public.salle_visite_exclusions',
    'public.user_conversation_preferences',
    'public.salles_ratings',
    'public.salles_reports',
    'public.favoris',
    'public.subscriptions'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    IF to_regclass(t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- -------------------------------------------------------------------
-- 2) Remove exact duplicate policies only
-- -------------------------------------------------------------------
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    WITH normalized AS (
      SELECT
        n.nspname AS schemaname,
        c.relname AS tablename,
        p.polname,
        p.polpermissive,
        p.polcmd,
        pg_get_expr(p.polqual, p.polrelid) AS using_expr,
        pg_get_expr(p.polwithcheck, p.polrelid) AS check_expr,
        COALESCE(
          array_to_string(
            ARRAY(
              SELECT r.rolname
              FROM unnest(p.polroles) pr
              JOIN pg_roles r ON r.oid = pr
              ORDER BY r.rolname
            ),
            ','
          ),
          ''
        ) AS roles_key,
        row_number() OVER (
          PARTITION BY
            n.nspname,
            c.relname,
            p.polpermissive,
            p.polcmd,
            COALESCE(pg_get_expr(p.polqual, p.polrelid), ''),
            COALESCE(pg_get_expr(p.polwithcheck, p.polrelid), ''),
            COALESCE(
              array_to_string(
                ARRAY(
                  SELECT r.rolname
                  FROM unnest(p.polroles) pr
                  JOIN pg_roles r ON r.oid = pr
                  ORDER BY r.rolname
                ),
                ','
              ),
              ''
            )
          ORDER BY p.polname
        ) AS rn
      FROM pg_policy p
      JOIN pg_class c ON c.oid = p.polrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
    )
    SELECT schemaname, tablename, polname
    FROM normalized
    WHERE rn > 1
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      rec.polname,
      rec.schemaname,
      rec.tablename
    );
  END LOOP;
END $$;

COMMIT;

-- -------------------------------------------------------------------
-- 3) Report candidates to review manually
-- (run this SELECT after script execution in SQL editor)
-- -------------------------------------------------------------------
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (
--     lower(COALESCE(qual, '')) IN ('true', '(true)')
--     OR lower(COALESCE(with_check, '')) IN ('true', '(true)')
--   )
-- ORDER BY tablename, policyname;
