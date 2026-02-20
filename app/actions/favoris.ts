"use server";

import { createClient } from "@/lib/supabase/server";

export type FavoriResult =
  | { success: true; added: boolean }
  | { success: false; error: string };

export async function toggleFavori(salleId: string): Promise<FavoriResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Connexion requise" };
  }

  const { data: existing } = await supabase
    .from("favoris")
    .select("id")
    .eq("user_id", user.id)
    .eq("salle_id", salleId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favoris")
      .delete()
      .eq("user_id", user.id)
      .eq("salle_id", salleId);
    if (error) return { success: false, error: error.message };
    return { success: true, added: false };
  }

  const { error } = await supabase.from("favoris").insert({
    user_id: user.id,
    salle_id: salleId,
  });
  if (error) return { success: false, error: error.message };
  return { success: true, added: true };
}

export async function isFavori(userId: string | null, salleId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("favoris")
    .select("id")
    .eq("user_id", userId)
    .eq("salle_id", salleId)
    .maybeSingle();
  return !!data;
}
