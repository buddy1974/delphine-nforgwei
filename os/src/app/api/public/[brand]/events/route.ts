import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=30, s-maxage=30",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** GET /os/api/public/<brand>/events — published events, soonest first. */
export async function GET(_req: Request, { params }: { params: { brand: string } }) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("os_events")
    .select(
      "slug, title, description, event_date, start_time, location, price_xaf, payunit_url, whatsapp_cta, facebook_embed_url, featured_image_url, registration_status"
    )
    .eq("brand_key", params.brand)
    .eq("status", "published")
    .order("event_date", { ascending: true });

  return NextResponse.json({ brand: params.brand, events: data ?? [] }, { headers: CORS });
}
