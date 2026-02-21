/**
 * Crée le bucket Supabase "message-attachments" pour les pièces jointes de la messagerie.
 * Exécuter une fois : node scripts/init-message-storage.mjs
 *
 * Prérequis : SUPABASE_SERVICE_ROLE_KEY dans .env.local
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const BUCKET_NAME = "message-attachments";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Erreur: définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);

  if (exists) {
    console.log(`Bucket "${BUCKET_NAME}" existe déjà.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  });

  if (error) {
    console.error("Erreur lors de la création du bucket:", error.message);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET_NAME}" créé avec succès (privé).`);
  console.log(
    "Exécutez config/supabase-message-attachments.sql dans l'éditeur SQL Supabase (table + politiques storage)."
  );
}

main();
