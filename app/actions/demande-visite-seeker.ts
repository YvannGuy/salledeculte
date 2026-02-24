"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function accepterPropositionVisite(demandeVisiteId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const { data: demande } = await supabase
    .from("demandes_visite")
    .select("id, seeker_id, status, date_proposee, heure_debut_proposee, heure_fin_proposee")
    .eq("id", demandeVisiteId)
    .eq("seeker_id", user.id)
    .maybeSingle();

  if (!demande) return { success: false, error: "Demande introuvable" };
  if (demande.status !== "reschedule_proposed") {
    return { success: false, error: "Aucune proposition à valider" };
  }
  if (!demande.date_proposee || !demande.heure_debut_proposee || !demande.heure_fin_proposee) {
    return { success: false, error: "Proposition incomplète" };
  }

  const { error } = await admin
    .from("demandes_visite")
    .update({
      status: "accepted",
      date_visite: demande.date_proposee,
      heure_debut: demande.heure_debut_proposee,
      heure_fin: demande.heure_fin_proposee,
      date_proposee: null,
      heure_debut_proposee: null,
      heure_fin_proposee: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", demandeVisiteId)
    .eq("seeker_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/demandes");
  revalidatePath(`/dashboard/demandes/visite/${demandeVisiteId}`);
  revalidatePath("/proprietaire/visites");
  return { success: true };
}

export async function refuserPropositionVisite(demandeVisiteId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const { data: demande } = await supabase
    .from("demandes_visite")
    .select("id, status")
    .eq("id", demandeVisiteId)
    .eq("seeker_id", user.id)
    .maybeSingle();
  if (!demande) return { success: false, error: "Demande introuvable" };
  if (demande.status !== "reschedule_proposed") {
    return { success: false, error: "Aucune proposition à refuser" };
  }

  const { error } = await admin
    .from("demandes_visite")
    .update({
      status: "refused",
      updated_at: new Date().toISOString(),
    })
    .eq("id", demandeVisiteId)
    .eq("seeker_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/demandes");
  revalidatePath(`/dashboard/demandes/visite/${demandeVisiteId}`);
  revalidatePath("/proprietaire/visites");
  return { success: true };
}
