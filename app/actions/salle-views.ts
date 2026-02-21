"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const RECENT_DAYS = 7;

/** Enregistre une consultation de salle (uniquement pour utilisateurs connectés) */
export async function recordSalleView(salleId: string, viewerId: string | null): Promise<void> {
  if (!viewerId) return;
  try {
    const supabase = createAdminClient();
    await supabase.from("salle_views").insert({
      salle_id: salleId,
      viewer_id: viewerId,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Ignore (table sans viewer_id ou autre erreur)
  }
}

/** Nombre de salles (d'autres propriétaires) consultées par cet owner (pour l'essai demandes gratuites) */
export async function getOwnerOtherSallesViewCount(ownerId: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const { data: views } = await supabase
      .from("salle_views")
      .select("salle_id")
      .eq("viewer_id", ownerId);

    if (!views?.length) return 0;

    const salleIds = [...new Set((views as { salle_id: string }[]).map((v) => v.salle_id))];
    const { data: salles } = await supabase
      .from("salles")
      .select("owner_id")
      .in("id", salleIds);

    return (salles ?? []).filter((s) => (s as { owner_id: string }).owner_id !== ownerId).length;
  } catch {
    return 0;
  }
}

/** Nombre d'organisateurs distincts ayant consulté la salle dans les N derniers jours */
export async function getSalleRecentViewerCount(salleId: string): Promise<number> {
  try {
    const supabase = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - RECENT_DAYS);

    const { data, error } = await supabase
      .from("salle_views")
      .select("viewer_id")
      .eq("salle_id", salleId)
      .gte("created_at", since.toISOString());

    if (error) return 0;

    const ids = (data ?? []).map((r) => (r as { viewer_id?: string | null }).viewer_id).filter(Boolean) as string[];
    return new Set(ids).size;
  } catch {
    return 0;
  }
}
