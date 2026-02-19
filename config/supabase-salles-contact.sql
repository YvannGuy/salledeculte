-- Colonne contact_phone pour le numéro du propriétaire
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='salles' AND column_name='contact_phone') THEN
    ALTER TABLE public.salles ADD COLUMN contact_phone text;
  END IF;
END $$;
