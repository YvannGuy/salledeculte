"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UpdateStatusResult =
  | { success: true }
  | { success: false; error: string };

export async function updateReportStatus(
  reportId: string,
  status: string
): Promise<UpdateStatusResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non autorisé" };

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAdminByEnv = adminEmails.includes(user.email?.toLowerCase() ?? "");
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle();
  const isAdminByProfile = profile?.user_type === "admin";
  if (!isAdminByEnv && !isAdminByProfile) return { success: false, error: "Non autorisé" };

  const valid = ["pending", "reviewed", "dismissed", "action_taken"];
  if (!valid.includes(status)) return { success: false, error: "Statut invalide" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("salles_reports")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
