import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OS_BRANDS } from "@/lib/brands";
import BrandWorkspace from "@/components/BrandWorkspace";
import type { PageRow, SectionRow, PageStatus } from "@/lib/db/pages";

export const dynamic = "force-dynamic";

const SECTION_COLS =
  "id, page_id, type, title, subtitle, body, image_url, button_label, button_url, order, parent_id, col, layout";

export default async function BrandWorkspacePage({
  params,
}: {
  params: { brand: string };
}) {
  const brand = OS_BRANDS.find((b) => b.key === params.brand);
  if (!brand) notFound();

  const db = createSupabaseAdminClient();

  /* Load all pages for this brand */
  const { data: rawPages } = await db
    .from("pages")
    .select("id, title, slug, status")
    .eq("brand_key", params.brand)
    .order("title", { ascending: true });

  const pages = (rawPages ?? []) as Pick<PageRow, "id" | "title" | "slug" | "status">[];

  /* No pages yet → onboarding CTA */
  if (pages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center -mx-8 -my-8 min-h-[calc(100vh-3.5rem)] bg-gray-50">
        <span
          className="w-5 h-5 rounded-full mb-4 inline-block"
          style={{ backgroundColor: brand.accent }}
        />
        <h1 className="text-2xl font-bold text-charcoal mb-2">{brand.name}</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          No pages yet. Create the first page to get started.
        </p>
        <Link
          href={`/${brand.key}/pages`}
          className="bg-plum text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-plum/20 hover:bg-plum/90 transition-all"
        >
          + Create first page
        </Link>
      </div>
    );
  }

  /* Default to the "home" page, or the first page alphabetically */
  const homePage =
    pages.find((p) => p.slug === "home") ??
    pages.find((p) => p.slug === "index") ??
    pages[0];

  /* Load sections for the default page */
  const { data: rawSections } = await db
    .from("sections")
    .select(SECTION_COLS)
    .eq("page_id", homePage.id)
    .order("order", { ascending: true });

  const sections = (rawSections ?? []) as SectionRow[];

  return (
    <BrandWorkspace
      brand={brand}
      pages={pages}
      initialPageId={homePage.id}
      initialSections={sections}
      initialStatus={homePage.status as PageStatus}
    />
  );
}
