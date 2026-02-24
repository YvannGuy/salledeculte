"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function loginAdminAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message === "Invalid login credentials" ? "Identifiants incorrects." : error.message || "Une erreur est survenue.";
    return { error: msg };
  }

  // Vérifier ADMIN_EMAILS (env) OU user_type = 'admin' (profiles)
  const adminEmails = getAdminEmails();
  const isAdminByEnv = adminEmails.length > 0 && adminEmails.includes(email);

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", data.user!.id)
    .maybeSingle();

  const isAdminByProfile = profile?.user_type === "admin";

  if (!isAdminByEnv && !isAdminByProfile) {
    await supabase.auth.signOut();
    return { error: "Accès refusé. Vous n'avez pas les droits administrateur." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signOutAdminAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/admin");
}
