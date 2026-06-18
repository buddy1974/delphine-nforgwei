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
 *
 * P1C: Returns the PUBLISHED page and its sections for a brand site to render.
 *
 * Source priority:
 *   1. pages.published_version_id IS NOT NULL → serve page_versions.sections (immutable snapshot)
 *   2. published_version_id IS NULL AND status='published' → legacy fallback: mutable sections table
 *
 * Response includes publishedVersionId so clients can verify what is live.
 * Public, read-only. Draft/review pages are never exposed.
 */
export async function GET(
  _req: Request,
  { params }: { params: { brand: string; slug: string } }
) {
  const db = createSupabaseAdminClient();

  // Fetch page including published_version_id pointer (added in migration 0005)
  const { data: page } = await db
    .from("pages")
    .select("id, slug, title, status, published_version_id")
    .eq("brand_key", params.brand)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
  }

  // P1C path: serve immutable snapshot from page_versions
  if (page.published_version_id) {
    const { data: version } = await db
      .from("page_versions")
      .select("id, sections")
      .eq("id", page.published_version_id)
      .single();

    if (version) {
      return NextResponse.json(
        {
          brand: params.brand,
          page: { slug: page.slug, title: page.title },
          publishedVersionId: version.id as string,
          sections: (version.sections as unknown[]) ?? [],
        },
        { headers: CORS }
      );
    }
    // Snapshot row missing — fall through to legacy
  }

  // Legacy fallback: published_version_id IS NULL
  // Page was published before P1C or snapshot is missing.
  const { data: sections } = await db
    .from("sections")
    .select("id, type, title, subtitle, body, image_url, button_label, button_url, order, parent_id, col, layout")
    .eq("page_id", page.id)
    .order("order", { ascending: true });

  return NextResponse.json(
    {
      brand: params.brand,
      page: { slug: page.slug, title: page.title },
      publishedVersionId: null,
      sections: sections ?? [],
    },
    { headers: CORS }
  );
}
