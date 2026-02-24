"use server";

import { redirect } from "next/navigation";
import { getOrCreateConversationForVisite } from "./messagerie";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Crée ou ouvre la conversation pour une demande de visite, puis redirige vers la messagerie */
export async function contactProprietaireVisiteAction(demandeVisiteId: string) {
  const res = await getOrCreateConversationForVisite(demandeVisiteId);
  if (res.error || !res.conversationId) {
    return { success: false, error: res.error ?? "Impossible de créer la conversation" };
  }
  redirect(`${siteUrl}/dashboard/messagerie?conversationId=${res.conversationId}`);
}
