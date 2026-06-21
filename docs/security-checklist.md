# Security Checklist — delphine.nforgwei

## Database / RLS
- [x] RLS enabled on every table in `mohogdfdzmewwvgcizga`.
- [x] Zero anon/authenticated policies — service role only.
- [x] Legacy SMCC tables (leads/chat/appointments) RLS-locked (migration 0001).

## Auth
- [x] OS routes gated by Supabase auth in `middleware.ts`.
- [x] Public exceptions limited to `/login`, `/auth`, `/api/public`, `/api/preview/*`.

## Secure preview tokens (P1B, generalized P1E)
- [x] HMAC-SHA256 signed, server-only `PREVIEW_TOKEN_SECRET`.
- [x] Random nonce; only the nonce HASH is stored.
- [x] TTL (10 min) enforced; expiry checked server-side.
- [x] Revocation honored (`revoked_at`).
- [x] Origin allow-list per brand via `<BRAND>_PUBLIC_SITE_URL`.
- [x] Session brand must match the requested brand.
- [x] Responses: no-store, noindex/nofollow, no-referrer, restricted CORS.
- [x] Brand must be `previewMode:"secure"` to use the plane at all.

## Headers
- [x] X-Frame-Options SAMEORIGIN; X-Content-Type-Options nosniff; referrer policy; noindex (OS).

## P1E review notes
- Security logic was moved into the shared `preview-api.ts` handler VERBATIM
  (no checks weakened or removed). Both `/api/preview/delphine` and
  `/api/preview/[brand]` run the identical audited handler.

## Open items (tracked elsewhere)
- SMCC app security P0s (separate repo / track) — see smcc.solutions/AUDIT_REPORT.md.
- Supabase Storage bucket/policies for real media uploads (RISK-003).
