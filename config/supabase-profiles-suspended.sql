-- Colonne suspended sur profiles (suspendre un utilisateur = ses annonces ne sont plus actives)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='suspended') THEN
    ALTER TABLE public.profiles ADD COLUMN suspended boolean not null default false;
  END IF;
END $$;

-- RLS salles : exclure les salles dont le propriétaire est suspendu
DROP POLICY IF EXISTS "public_select_approved_salles" ON public.salles;
CREATE POLICY "public_select_approved_salles"
  ON public.salles FOR SELECT
  USING (
    status = 'approved'
    AND NOT COALESCE(
      (SELECT suspended FROM public.profiles WHERE id = owner_id),
      false
    )
  );
