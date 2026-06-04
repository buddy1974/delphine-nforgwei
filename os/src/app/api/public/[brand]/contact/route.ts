import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * POST /os/api/public/<brand>/contact
 * Ingests a website contact / connect form into the Message Center.
 * Body: { name?, email?, phone?, message, support? }
 * Creates a conversation (channel=webform) + first inbound message,
 * then pings Telegram. Public (rate-limit at the edge in production).
 */
export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST a contact form here" }, { headers: CORS });
}

export async function POST(
  req: Request,
  { params }: { params: { brand: string } }
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }

  const name = String(body.name ?? "").slice(0, 200) || null;
  const email = String(body.email ?? "").slice(0, 200) || null;
  const phone = String(body.phone ?? "").slice(0, 50) || null;
  const message = String(body.message ?? "").slice(0, 5000).trim();
  const support = Boolean(body.support);

  if (!message && !name && !email) {
    return NextResponse.json({ error: "Empty submission" }, { status: 400, headers: CORS });
  }

  const db = createSupabaseAdminClient();
  const { data: convo, error } = await db
    .from("conversations")
    .insert({
      brand_key: params.brand,
      channel: "webform",
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      status: "open",
      flags: support ? ["human_support"] : [],
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !convo) {
    return NextResponse.json({ error: "Could not save" }, { status: 500, headers: CORS });
  }

  if (message) {
    await db.from("os_messages").insert({
      conversation_id: convo.id,
      direction: "in",
      body: message,
    });
  }

  await notify(
    support ? "human_support_request" : "new_message",
    params.brand,
    [
      name ? `👤 ${name}` : "",
      email ? `✉️ ${email}` : "",
      phone ? `📞 ${phone}` : "",
      message ? `💬 ${message.slice(0, 300)}` : "",
    ].filter(Boolean),
    `/messages/${convo.id}`
  );

  return NextResponse.json({ ok: true }, { headers: CORS });
}
