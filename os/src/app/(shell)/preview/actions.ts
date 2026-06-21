"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPreviewToken } from "@/lib/preview-tokens";
import { getBrandPublicSiteUrl } from "@/lib/preview-config";
import { getOsBrand } from "@/lib/brands";
import type { SectionRow } from "@/lib/db/pages";
import { randomUUID } from "crypto";

/**
 * P1E — Brand-generic secure preview session creator.
 *
 * Generalised from createDelphinePreviewSession. Snapshots the current
 * sections into an immutable page_versions row, mints a short-lived signed
 * token, records a preview_sessions row, and returns the brand's public-site
 * preview URL. Only brands whose previewMode is "secure" are permitted —
 * everything else is rejected, so SMCC / E-Woman / DRIMP behaviour is
 * unchanged (they continue to use the generic OS-internal preview).
 */
export async function createPreviewSession(
  brandKey: string,
  pageId: string,
  title: string,
  sections: SectionRow[]
): Promise<{ previewUrl: string; pageVersionId: string } | { error: string }> {
  const brand = getOsBrand(brandKey);
  if (!brand) return { error: "Unknown brand." };
  if (brand.previewMode !== "secure") {
    return { error: `Secure website preview is not enabled for ${brand.shortName}.` };
  }

  const db = createSupabaseAdminClient();

  const { data: page, error: pageError } = await db
    .from("pages")
    .select("id, brand_key, title, status")
    .eq("id", pageId)
    .single();

  if (pageError || !page) return { error: "Page not found." };
  if (page.brand_key !== brand.key) {
    return { error: "Page does not belong to this brand." };
  }

  const { data: version, error: versionError } = await db
    .from("page_versions")
    .insert({
      page_id: pageId,
      title: title || page.title,
      status: page.status ?? "draft",
      sections: JSON.parse(JSON.stringify(sections)),
      label: "Secure preview",
    })
    .select("id")
    .single();

  if (versionError || !version) {
    return { error: versionError?.message ?? "Could not create preview version." };
  }

  const sessionId = randomUUID();
  const { token, nonceHash, expiresAt } = createPreviewToken(sessionId);

  const { error: sessionError } = await db.from("preview_sessions").insert({
    id: sessionId,
    page_id: pageId,
    page_version_id: version.id,
    brand_key: brand.key,
    nonce_hash: nonceHash,
    token_expires_at: expiresAt,
  });

  if (sessionError) {
    return { error: sessionError.message };
  }

  return {
    pageVersionId: version.id as string,
    previewUrl: `${getBrandPublicSiteUrl(brand.key)}/os-preview/${brand.key}?token=${encodeURIComponent(token)}`,
  };
}

/**
 * @deprecated P1E — thin backward-compatible wrapper. Prefer
 * createPreviewSession(brandKey, ...). Retained so any other caller keeps
 * working; delegates to the generic implementation with brand "delphine".
 */
export async function createDelphinePreviewSession(
  pageId: string,
  title: string,
  sections: SectionRow[]
) {
  return createPreviewSession("delphine", pageId, title, sections);
}
