"use server";

import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const BUCKET_MESSAGE_ATTACHMENTS = "message-attachments";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export async function getOrCreateConversation(demandeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté", conversationId: null };

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("demande_id", demandeId)
    .maybeSingle();

  if (conv) return { conversationId: conv.id, error: null };

  const { data: demande } = await supabase
    .from("demandes")
    .select("seeker_id, salle_id")
    .eq("id", demandeId)
    .maybeSingle();

  if (!demande) return { error: "Demande introuvable", conversationId: null };

  const { data: salle } = await supabase
    .from("salles")
    .select("owner_id")
    .eq("id", (demande as { salle_id: string }).salle_id)
    .maybeSingle();

  if (!salle) return { error: "Salle introuvable", conversationId: null };

  const demandeRow = demande as { seeker_id: string; salle_id: string };
  const salleRow = salle as { owner_id: string };
  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({
      demande_id: demandeId,
      seeker_id: demandeRow.seeker_id,
      owner_id: salleRow.owner_id,
      salle_id: demandeRow.salle_id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message, conversationId: null };
  return { conversationId: newConv.id, error: null };
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: "Message vide" };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: trimmed,
  });

  if (error) return { success: false, error: error.message };

  const preview = trimmed.length > 80 ? trimmed.slice(0, 77) + "..." : trimmed;
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return { success: true };
}

export async function sendMessageWithAttachments(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const content = (formData.get("content") as string)?.trim() ?? "";
  const conversationId = formData.get("conversationId") as string;
  const files = formData.getAll("attachments") as File[];

  if (!conversationId) return { success: false, error: "Conversation manquante" };
  if (!content && files.length === 0)
    return { success: false, error: "Message vide ou pièce jointe requise" };

  const validFiles = files.filter((f) => {
    if (!f.size) return false;
    if (f.size > MAX_FILE_SIZE) return false;
    if (!ALLOWED_MIME_TYPES.includes(f.type)) return false;
    return true;
  });

  if (files.length > 0 && validFiles.length === 0)
    return {
      success: false,
      error: "Fichiers invalides : JPG, PNG, GIF, WebP ou PDF, max 10 Mo chacun.",
    };

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, seeker_id, owner_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.seeker_id !== user.id && conv.owner_id !== user.id))
    return { success: false, error: "Accès refusé" };

  const { data: msg, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content || "[Pièce(s) jointe(s)]",
    })
    .select("id")
    .single();

  if (insertError) return { success: false, error: insertError.message };

  const messageId = msg.id;

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
  const storagePath = `${conversationId}/${messageId}/${randomUUID()}-${file.name}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_MESSAGE_ATTACHMENTS)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Erreur upload (${file.name}) : ${uploadError.message}`,
      };
    }

    const { error: attachError } = await supabase.from("message_attachments").insert({
      message_id: messageId,
      storage_path: storagePath,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });

    if (attachError) {
      return {
        success: false,
        error: `Erreur enregistrement pièce jointe : ${attachError.message}`,
      };
    }
  }

  const preview =
    content.length > 80 ? content.slice(0, 77) + "..." : content || "[Pièce(s) jointe(s)]";
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return { success: true };
}

export async function getAttachmentSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const parts = storagePath.split("/");
  const conversationId = parts[0];
  if (!conversationId) return null;

  const { data: conv } = await supabase
    .from("conversations")
    .select("seeker_id, owner_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.seeker_id !== user.id && conv.owner_id !== user.id)) return null;

  const { data } = await supabase.storage
    .from(BUCKET_MESSAGE_ATTACHMENTS)
    .createSignedUrl(storagePath, 3600); // 1h

  return data?.signedUrl ?? null;
}

export async function getAttachmentSignedUrls(
  paths: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const p of paths) {
    const url = await getAttachmentSignedUrl(p);
    if (url) result[p] = url;
  }
  return result;
}
