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

/** GET /os/api/public/<brand>/events/<slug> — one published event. */
export async function GET(
  _req: Request,
  { params }: { params: { brand: string; slug: string } }
) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("os_events")
    .select(
      "slug, title, description, event_date, start_time, location, price_xaf, payunit_url, whatsapp_cta, facebook_embed_url, featured_image_url, registration_status"
    )
    .eq("brand_key", params.brand)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
  }
  return NextResponse.json({ brand: params.brand, event: data }, { headers: CORS });
}
