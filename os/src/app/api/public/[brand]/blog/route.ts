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
 * GET /os/api/public/<brand>/blog
 * Published posts for a brand, newest first. Public, read-only.
 */
export async function GET(
  _req: Request,
  { params }: { params: { brand: string } }
) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("posts")
    .select("slug, title, excerpt, featured_image_url, author, category, tags, published_at")
    .eq("brand_key", params.brand)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return NextResponse.json({ brand: params.brand, posts: data ?? [] }, { headers: CORS });
}
