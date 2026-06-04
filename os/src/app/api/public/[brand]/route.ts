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
 * GET /os/api/public/<brand>
 * Lists PUBLISHED pages for a brand (slug + title). Public, read-only.
 */
export async function GET(
  _req: Request,
  { params }: { params: { brand: string } }
) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("pages")
    .select("slug, title")
    .eq("brand_key", params.brand)
    .eq("status", "published")
    .order("title", { ascending: true });

  return NextResponse.json({ brand: params.brand, pages: data ?? [] }, { headers: CORS });
}
