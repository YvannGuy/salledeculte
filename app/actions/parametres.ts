"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getTelegramBotUsername,
  sendTelegramMessageToChat,
} from "@/lib/telegram";

export type ParametresState = {
  error?: string;
  success?: string;
};

const defaultError = "Une erreur est survenue. Veuillez réessayer.";
const DEFAULT_CHANNEL = "email";
const CHANNELS = new Set(["email", "telegram", "both"]);

export async function updateProfileAction(
  _: ParametresState,
  formData: FormData
): Promise<ParametresState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié." };
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      full_name: fullName || null,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message || defaultError };
  }

  revalidatePath("/proprietaire/parametres");
  revalidatePath("/dashboard/parametres");
  revalidatePath("/proprietaire", "layout");
  return { success: "Profil enregistré." };
}

export async function updatePasswordAction(
  _: ParametresState,
  formData: FormData
): Promise<ParametresState> {
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message || defaultError };
  }

  // Enregistrer la date de changement
  await supabase
    .from("profiles")
    .update({
      last_password_change: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/proprietaire/parametres");
  revalidatePath("/dashboard/parametres");
  return { success: "Mot de passe mis à jour." };
}

export async function deleteAccountAction(): Promise<ParametresState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non authentifié." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: error.message || defaultError };
  }

  revalidatePath("/", "layout");
  redirect("/auth");
}

export async function updateNotificationPreferencesAction(
  _: ParametresState,
  formData: FormData
): Promise<ParametresState> {
  const notificationChannel = String(formData.get("notificationChannel") ?? DEFAULT_CHANNEL);
  if (!CHANNELS.has(notificationChannel)) {
    return { error: "Canal de notification invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_chat_id")
    .eq("id", user.id)
    .maybeSingle();

  const telegramChatId = (profile as { telegram_chat_id?: string | null } | null)?.telegram_chat_id ?? null;
  if (notificationChannel === "telegram" && !telegramChatId) {
    return { error: "Connectez Telegram avant de choisir ce canal." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      notification_channel: notificationChannel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: error.message || defaultError };

  revalidatePath("/proprietaire/parametres");
  revalidatePath("/dashboard/parametres");
  return { success: "Préférences de notifications enregistrées." };
}

export async function createTelegramLinkAction(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const botUsername = getTelegramBotUsername();
  if (!botUsername) {
    return { success: false, error: "TELEGRAM_BOT_USERNAME non configuré." };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const admin = createAdminClient();
  const { error } = await admin.from("telegram_link_tokens").insert({
    token,
    user_id: user.id,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });
  if (error) return { success: false, error: error.message || defaultError };

  return {
    success: true,
    url: `https://t.me/${botUsername}?start=${token}`,
  };
}

export async function disconnectTelegramAction(): Promise<ParametresState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_channel")
    .eq("id", user.id)
    .maybeSingle();
  const channel = (profile as { notification_channel?: string | null } | null)?.notification_channel ?? DEFAULT_CHANNEL;

  const { error } = await supabase
    .from("profiles")
    .update({
      telegram_chat_id: null,
      telegram_connected_at: null,
      telegram_username: null,
      notification_channel: channel === "telegram" ? DEFAULT_CHANNEL : channel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: error.message || defaultError };

  revalidatePath("/proprietaire/parametres");
  revalidatePath("/dashboard/parametres");
  return { success: "Telegram déconnecté." };
}

export async function sendTelegramTestAction(): Promise<ParametresState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_chat_id")
    .eq("id", user.id)
    .maybeSingle();

  const chatId = (profile as { telegram_chat_id?: string | null } | null)?.telegram_chat_id ?? null;
  if (!chatId) return { error: "Telegram non connecté." };

  const test = await sendTelegramMessageToChat(
    chatId,
    "Test de notification Telegram reussi."
  );
  if (!test.success) {
    return { error: "Échec d'envoi Telegram. Vérifiez la connexion du bot." };
  }

  await supabase
    .from("profiles")
    .update({
      telegram_last_test_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return { success: "Notification Telegram de test envoyée." };
}
