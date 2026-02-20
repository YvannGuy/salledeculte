-- =============================================================================
-- ADMIN : autoriser user_type = 'admin' et définir un admin par email
-- Exécuter dans l'éditeur SQL Supabase
-- =============================================================================

-- 1. Modifier la contrainte user_type pour inclure 'admin'
DO $$
DECLARE
  cname text;
BEGIN
  FOR cname IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'profiles'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%user_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', cname);
  END LOOP;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_type_check
    CHECK (user_type IN ('seeker', 'owner', 'admin'));
END $$;

-- 2. Mettre un utilisateur en admin par son email
-- REMPLACER 'admin@exemple.com' par l'email de l'admin
UPDATE public.profiles
SET user_type = 'admin'
WHERE LOWER(email) = LOWER('admin@exemple.com');
