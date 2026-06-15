import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashPreviewNonce, verifyPreviewToken } from "@/lib/preview-tokens";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function allowedPreviewOrigin(request: NextRequest) {
  const configured = process.env.DELPHINE_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const origin = request.headers.get("origin");

  if (configured) return origin === configured ? configured : null;
  if (origin === "http://localhost:5173" || origin === "http://localhost:4173") {
    return origin;
  }
  return null;
}

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
  return NextResponse.json(body, {
    status,
    headers: previewHeaders(origin),
  });
}

export async function OPTIONS(request: NextRequest) {
  const origin = allowedPreviewOrigin(request);
  if (!origin) return new NextResponse(null, { status: 403, headers: previewHeaders(null) });
  return new NextResponse(null, { status: 204, headers: previewHeaders(origin) });
}

export async function GET(request: NextRequest) {
  const origin = allowedPreviewOrigin(request);
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
  if (session.brand_key !== "delphine") return json(404, { error: "Preview session not found." }, origin);
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
