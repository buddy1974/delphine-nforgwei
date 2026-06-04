/** Shared types for the Message Center. Mirrors conversations + os_messages. */

export const CONVO_CHANNELS = ["whatsapp", "email", "telegram", "webform"] as const;
export type ConvoChannel = (typeof CONVO_CHANNELS)[number];

export const CONVO_STATUSES = ["open", "pending", "resolved"] as const;
export type ConvoStatus = (typeof CONVO_STATUSES)[number];

export interface ConversationRow {
  id: string;
  brand_key: string;
  channel: ConvoChannel;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  status: ConvoStatus;
  flags: string[];
  last_message_at: string | null;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  direction: "in" | "out";
  body: string | null;
  created_at: string;
}
