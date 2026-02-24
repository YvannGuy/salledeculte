-- Politiques RLS pour les buckets Storage Supabase.
-- Exécuter dans l'éditeur SQL Supabase (Dashboard → SQL Editor).
--
-- Permet aux utilisateurs authentifiés d'uploader des photos
-- dans leur dossier (premier segment du path = auth.uid()).

-- ============ Bucket salle-photos ============
DROP POLICY IF EXISTS "salle-photos insert authenticated own folder" ON storage.objects;
CREATE POLICY "salle-photos insert authenticated own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "salle-photos select public" ON storage.objects;
CREATE POLICY "salle-photos select public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'salle-photos');

