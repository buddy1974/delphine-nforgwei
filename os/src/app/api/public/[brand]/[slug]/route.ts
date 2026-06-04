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

/**
 * GET /os/api/public/<brand>/<slug>
 * Returns one PUBLISHED page and its ordered sections for a brand site to render.
 * Public, read-only. Draft/review pages are never exposed.
 */
export async function GET(
  _req: Request,
  { params }: { params: { brand: string; slug: string } }
) {
  const db = createSupabaseAdminClient();

  const { data: page } = await db
    .from("pages")
    .select("id, slug, title, status")
    .eq("brand_key", params.brand)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
  }

  const { data: sections } = await db
    .from("sections")
    .select("type, title, subtitle, body, image_url, button_label, button_url, order")
    .eq("page_id", page.id)
    .order("order", { ascending: true });

  return NextResponse.json(
    {
      brand: params.brand,
      page: { slug: page.slug, title: page.title },
      sections: sections ?? [],
    },
    { headers: CORS }
  );
}
