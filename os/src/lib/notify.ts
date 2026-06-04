import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Notification layer (Phase J) — SERVER ONLY.
 * Writes an audit row to `notifications` and sends a Telegram message
 * to the team chat with a deep link back into the OS.
 * Fire-and-forget: never throws, never blocks the calling action.
 */

const OS_PUBLIC_URL =
  process.env.OS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_OS_URL ||
  "http://localhost:3100/os";

export type NotifyType =
  | "post_published"
  | "post_draft_created"
  | "event_published"
  | "registration_interest"
  | "payment_claim"
  | "payment_confirmed"
  | "payment_issue"
  | "human_support_request"
  | "new_message"
  | "ai_draft_review";

const TITLES: Record<NotifyType, string> = {
  post_published: "📰 Post published",
  post_draft_created: "✍️ New blog draft",
  event_published: "📅 Event published",
  registration_interest: "🎟 New registration interest",
  payment_claim: "💰 New payment claim",
  payment_confirmed: "✅ Payment confirmed",
  payment_issue: "⚠️ Payment issue reported",
  human_support_request: "🙋 Human support requested",
  new_message: "💬 New message",
  ai_draft_review: "🤖 AI content needs review",
};

export async function notify(
  type: NotifyType,
  brandKey: string | null,
  lines: string[],
  osPath: string
): Promise<void> {
  const link = `${OS_PUBLIC_URL}${osPath}`;

  // 1. Audit row (non-fatal)
  try {
    const db = createSupabaseAdminClient();
    await db.from("notifications").insert({
      type,
      brand_key: brandKey,
      payload: { lines },
      os_link: link,
      telegram_sent: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    });
  } catch (e) {
    console.error("[notify] db insert failed:", e);
  }

  // 2. Telegram (non-fatal)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    `<b>${TITLES[type]}</b>`,
    brandKey ? `🏷 Brand: ${brandKey}` : "",
    ...lines,
    "",
    `🔗 Open in OS:\n${link}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("[notify] telegram failed:", e);
  }
}
