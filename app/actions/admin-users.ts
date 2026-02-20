"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Suspend un utilisateur : ses annonces ne sont plus actives sur le site.
 * (Les salles restent en DB, le filtre profiles.suspended les exclut côté public.)
 */
export async function suspendUserAction(userId: string) {
  if (!userId) return { error: "ID manquant" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ suspended: true })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/annonces");
  return { success: true };
}

export async function reactivateUserAction(userId: string) {
  if (!userId) return { error: "ID manquant" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ suspended: false })
    .eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/annonces");
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  if (!userId) return { error: "ID manquant" };

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/annonces");
  return { success: true };
}
