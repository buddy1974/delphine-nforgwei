"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPreviewToken } from "@/lib/preview-tokens";
import type { SectionRow } from "@/lib/db/pages";
import { randomUUID } from "crypto";

function getDelphinePublicSiteUrl() {
  const configured = process.env.DELPHINE_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:5173";
  throw new Error("DELPHINE_PUBLIC_SITE_URL must be set in production.");
}

export async function createDelphinePreviewSession(
  pageId: string,
  title: string,
  sections: SectionRow[]
): Promise<{ previewUrl: string; pageVersionId: string } | { error: string }> {
  const db = createSupabaseAdminClient();

  const { data: page, error: pageError } = await db
    .from("pages")
    .select("id, brand_key, title, status")
    .eq("id", pageId)
    .single();

  if (pageError || !page) return { error: "Page not found." };
  if (page.brand_key !== "delphine") {
    return { error: "Secure website preview is only enabled for Delphine in P1B." };
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
    brand_key: "delphine",
    nonce_hash: nonceHash,
    token_expires_at: expiresAt,
  });

  if (sessionError) {
    return { error: sessionError.message };
  }

  return {
    pageVersionId: version.id as string,
    previewUrl: `${getDelphinePublicSiteUrl()}/os-preview/delphine?token=${encodeURIComponent(token)}`,
  };
}
