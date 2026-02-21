"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminTrialResult =
  | { success: true }
  | { success: false; error: string };

async function requireAdmin(): Promise<{ ok: false; error: string } | { ok: true }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autorisé" };

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdminByEnv = adminEmails.includes(user.email?.toLowerCase() ?? "");
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle();
  const isAdminByProfile = profile?.user_type === "admin";
  if (!isAdminByEnv && !isAdminByProfile) return { ok: false, error: "Non autorisé" };
  return { ok: true };
}

/** Révoque le pass gratuit d'un utilisateur (trial_activated_at = null, free_pass_credits = 0) */
export async function revokeTrialForUser(userId: string): Promise<AdminTrialResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!userId) return { success: false, error: "ID utilisateur manquant" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      trial_activated_at: null,
      free_pass_credits: 0,
    })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/paiements");
  revalidatePath("/admin");
  return { success: true };
}

/** Recharge le pass gratuit en ajoutant des crédits (sans toucher aux demandes déjà utilisées) */
export async function rechargeTrialForUser(
  userId: string,
  creditsToAdd: number
): Promise<AdminTrialResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!userId) return { success: false, error: "ID utilisateur manquant" };
  if (!Number.isInteger(creditsToAdd) || creditsToAdd < 1)
    return { success: false, error: "Nombre de crédits invalide (minimum 1)" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("free_pass_credits, trial_activated_at")
    .eq("id", userId)
    .maybeSingle();

  const current = (profile as { free_pass_credits?: number } | null)?.free_pass_credits ?? 0;
  const newCredits = current + creditsToAdd;
  const trialActivated = (profile as { trial_activated_at?: string | null } | null)?.trial_activated_at;
  const updates: Record<string, unknown> = { free_pass_credits: newCredits };
  if (!trialActivated) {
    updates.trial_activated_at = new Date().toISOString();
  }

  const { error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/paiements");
  revalidatePath("/admin");
  return { success: true };
}
