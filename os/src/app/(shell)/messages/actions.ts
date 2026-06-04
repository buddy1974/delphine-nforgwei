"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ConversationRow, MessageRow, ConvoStatus } from "@/lib/db/messages";

export async function listConversations(brandKey: string): Promise<ConversationRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("conversations")
    .select("*")
    .eq("brand_key", brandKey)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ConversationRow[];
}

export async function getThread(
  id: string
): Promise<{ conversation: ConversationRow; messages: MessageRow[] } | null> {
  const db = createSupabaseAdminClient();
  const { data: conversation } = await db.from("conversations").select("*").eq("id", id).single();
  if (!conversation) return null;
  const { data: messages } = await db
    .from("os_messages")
    .select("id, conversation_id, direction, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });
  return {
    conversation: conversation as ConversationRow,
    messages: (messages ?? []) as MessageRow[],
  };
}

export async function setConversationStatus(id: string, status: ConvoStatus): Promise<void> {
  const db = createSupabaseAdminClient();
  await db.from("conversations").update({ status }).eq("id", id);
  revalidatePath("/messages");
}

/** Log an internal/outbound note against a conversation (reply-later record). */
export async function addReplyNote(conversationId: string, body: string): Promise<void> {
  if (!body.trim()) return;
  const db = createSupabaseAdminClient();
  await db.from("os_messages").insert({
    conversation_id: conversationId,
    direction: "out",
    body: body.trim(),
  });
  await db
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
  revalidatePath("/messages");
}
