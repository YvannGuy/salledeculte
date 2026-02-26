import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramLinkSuccessMessage, sendTelegramMessageToChat } from "@/lib/telegram";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id?: number | string };
    from?: { username?: string };
  };
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    const text = message?.text?.trim() ?? "";
    const chatIdRaw = message?.chat?.id;
    const chatId = chatIdRaw ? String(chatIdRaw) : "";

    if (!text || !chatId) {
      return NextResponse.json({ received: true });
    }

    if (!text.startsWith("/start")) {
      return NextResponse.json({ received: true });
    }

    const token = text.split(" ").slice(1).join(" ").trim();
    if (!token) {
      await sendTelegramMessageToChat(
        chatId,
        "Lien de connexion invalide. Merci de relancer depuis vos paramètres."
      );
      return NextResponse.json({ received: true });
    }

    const admin = createAdminClient();
    const { data: linkToken } = await admin
      .from("telegram_link_tokens")
      .select("token, user_id, expires_at, used_at")
      .eq("token", token)
      .maybeSingle();

    const row = linkToken as {
      token: string;
      user_id: string;
      expires_at: string;
      used_at: string | null;
    } | null;

    if (!row || row.used_at) {
      await sendTelegramMessageToChat(
        chatId,
        "Ce lien a déjà été utilisé ou n'est plus valide."
      );
      return NextResponse.json({ received: true });
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      await sendTelegramMessageToChat(
        chatId,
        "Ce lien a expiré. Relancez la connexion depuis vos paramètres."
      );
      return NextResponse.json({ received: true });
    }

    const now = new Date().toISOString();
    await admin
      .from("profiles")
      .update({
        telegram_chat_id: chatId,
        telegram_username: message?.from?.username ?? null,
        telegram_connected_at: now,
        updated_at: now,
      })
      .eq("id", row.user_id);

    await admin
      .from("telegram_link_tokens")
      .update({
        used_at: now,
        telegram_chat_id: chatId,
      })
      .eq("token", token);

    await sendTelegramLinkSuccessMessage(chatId);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[telegram webhook] error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

