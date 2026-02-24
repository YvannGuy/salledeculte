-- Politiques storage pour le bucket privé "etat-des-lieux"
-- Exécuter dans Supabase SQL Editor

DROP POLICY IF EXISTS "edl select participants" ON storage.objects;
CREATE POLICY "edl select participants"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'etat-des-lieux'
  AND EXISTS (
    SELECT 1
    FROM offers o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND (
        o.seeker_id = auth.uid()
        OR o.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'admin'
        )
      )
  )
);
