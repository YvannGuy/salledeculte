-- Lot 1 security hardening (safe-first)
-- Scope:
-- 1) Fix "RLS Policy Always True" on public.salle_views
-- 2) Fix "Function Search Path Mutable" on trigger functions
-- 3) Keep changes minimal to avoid app regressions
--
-- Execute in Supabase SQL Editor.

BEGIN;

-- -------------------------------------------------------------------
-- 1) public.salle_views : lock down access for anon/authenticated
-- -------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.salle_views') IS NOT NULL THEN
    -- Remove broad grants
    REVOKE ALL ON TABLE public.salle_views FROM PUBLIC;
    REVOKE ALL ON TABLE public.salle_views FROM anon;
    REVOKE ALL ON TABLE public.salle_views FROM authenticated;

    -- Ensure RLS is enabled
    ALTER TABLE public.salle_views ENABLE ROW LEVEL SECURITY;

    -- Remove suspicious policies generated as always-true
    DROP POLICY IF EXISTS "Allow all" ON public.salle_views;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.salle_views;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.salle_views;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.salle_views;
  END IF;
END $$;

-- -------------------------------------------------------------------
-- 2) Fix mutable search_path on known functions
-- -------------------------------------------------------------------
DO $$
DECLARE
  fn regprocedure;
BEGIN
  -- set_contract_templates_updated_at
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'set_contract_templates_updated_at'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
  END LOOP;

  -- set_offers_updated_at
  FOR fn IN
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'set_offers_updated_at'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn);
  END LOOP;
END $$;

COMMIT;

-- -------------------------------------------------------------------
-- 3) Manual step (Dashboard, not SQL):
-- Auth -> Password security -> Enable "Leaked password protection"
-- -------------------------------------------------------------------
