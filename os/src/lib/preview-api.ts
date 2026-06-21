/**
 * P1E — Shared, brand-generic secure preview API handler.
 *
 * Generalised from the original Delphine-only /api/preview/delphine route.
 * Security is UNCHANGED: HMAC token verification, nonce-hash check, TTL
 * expiry, revocation, origin allow-listing, no-store/noindex headers, and a
 * brand match between the URL brand and the preview_sessions.brand_key.
 *
 * Both /api/preview/[brand] and the retained /api/preview/delphine delegate
 * here, so all brands share one audited implementation.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashPreviewNonce, verifyPreviewToken } from "@/lib/preview-tokens";
import { getOsBrand, PREVIEW_SITE_URL_ENV, type OsBrand } from "@/lib/brands";

function previewHeaders(origin: string | null) {
  const headers = new Headers({
    "Cache-Control": "private, no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "Vary": "Origin",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return headers;
}

function json(status: number, body: unknown, origin: string | null) {
  return NextResponse.json(body, { status, headers: previewHeaders(origin) });
}

/**
 * Resolve the allowed origin for a brand's secure preview.
 * Identical logic to the pre-P1E Delphine route, parameterised by brand.
 */
function allowedPreviewOrigin(request: NextRequest, brandKey: OsBrand["key"]) {
  const envName = PREVIEW_SITE_URL_ENV[brandKey];
  const configured = (envName ? process.env[envName] : undefined)?.replace(/\/+$/, "");
  const origin = request.headers.get("origin");

  if (configured) return origin === configured ? configured : null;
  if (origin === "http://localhost:5173" || origin === "http://localhost:4173") {
    return origin;
  }
  return null;
}

/** A brand may use the secure preview plane only if it exists and is "secure". */
function secureBrandOrNull(brandKey: string): OsBrand | null {
  const brand = getOsBrand(brandKey);
  if (!brand || brand.previewMode !== "secure") return null;
  return brand;
}

export function handlePreviewOptions(request: NextRequest, brandKey: string) {
  const brand = secureBrandOrNull(brandKey);
  if (!brand) return new NextResponse(null, { status: 403, headers: previewHeaders(null) });
  const origin = allowedPreviewOrigin(request, brand.key);
  if (!origin) return new NextResponse(null, { status: 403, headers: previewHeaders(null) });
  return new NextResponse(null, { status: 204, headers: previewHeaders(origin) });
}

export async function handlePreviewRequest(request: NextRequest, brandKey: string) {
  // Brand must exist and have secure preview enabled. Otherwise behave as
  // "not found / not allowed" without leaking which brands are configured.
  const brand = secureBrandOrNull(brandKey);
  if (!brand) return json(403, { error: "Preview is not enabled for this brand." }, null);

  const origin = allowedPreviewOrigin(request, brand.key);
  if (!origin) return json(403, { error: "Preview origin is not allowed." }, null);

  const token = request.nextUrl.searchParams.get("token");
  if (!token) return json(404, { error: "Preview token is required." }, origin);

  const verified = verifyPreviewToken(token);
  if (!verified) return json(404, { error: "Preview token is invalid or expired." }, origin);

  const db = createSupabaseAdminClient();
  const { data: session } = await db
    .from("preview_sessions")
    .select("id, page_id, page_version_id, brand_key, nonce_hash, token_expires_at, revoked_at, access_count")
    .eq("id", verified.previewSessionId)
    .single();

  if (!session) return json(404, { error: "Preview session not found." }, origin);
  if (session.brand_key !== brand.key) return json(404, { error: "Preview session not found." }, origin);
  if (session.revoked_at) return json(404, { error: "Preview session was revoked." }, origin);
  if (new Date(session.token_expires_at).getTime() <= Date.now()) {
    return json(404, { error: "Preview session expired." }, origin);
  }
  if (session.nonce_hash !== hashPreviewNonce(verified.nonce)) {
    return json(404, { error: "Preview token is invalid." }, origin);
  }

  const { data: version } = await db
    .from("page_versions")
    .select("id, page_id, title, status, sections, created_at")
    .eq("id", session.page_version_id)
    .single();

  if (!version || version.page_id !== session.page_id) {
    return json(404, { error: "Preview version not found." }, origin);
  }

  await db
    .from("preview_sessions")
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: ((session.access_count as number | null) ?? 0) + 1,
    })
    .eq("id", session.id);

  return json(
    200,
    {
      brand: brand.key,
      page: {
        id: session.page_id,
        versionId: version.id,
        title: version.title,
        status: version.status,
        createdAt: version.created_at,
      },
      sections: version.sections ?? [],
    },
    origin
  );
}
