# Production Readiness — delphine.nforgwei

Last updated: 2026-06-19 (P1E). Scope: Delphine OS + public site only.

## Gate status
| Gate | Status |
|---|---|
| Type safety (root `npx tsc --noEmit`) | PASS (0 errors) |
| Type safety (os `npx tsc --noEmit`) | PASS (0 errors) |
| Production build (`next build` / `vite build`) | Verified by Vercel CI (sandbox times out — RISK-002) |
| Lint / unit tests | Minimal (vitest present; no broad suite) |
| Security — RLS | PASS (all tables, zero anon policies) |
| Security — preview tokens | PASS (HMAC + nonce + TTL + revocation + origin allow-list) |
| Database migrations | Versioned + additive (0001–0005) |
| Secrets management | `.env.example` documented; secrets server-only |
| Observability | Minimal (console diagnostics); no APM |

## P1E exit state
- Preview plane generalized (brand-agnostic) with Delphine as regression baseline.
- Delphine behaviour unchanged (static regression verified; live smoke test pending owner).
- Other brands NOT activated (previewMode "generic").

## Conditions before H8
1. Owner runs the live Delphine regression smoke test (see release-checklist.md).
2. Owner commits P1E on Windows (sandbox could not — see known-risks RISK-010).
3. Remove the inert `os/src/app/api/preview/__probe[x]` folder on Windows.
4. Provide `<BRAND>_PUBLIC_SITE_URL` and flip `previewMode:"secure"` only when a
   brand's rendering plane (components + `/os-preview` route) is built.

## Human approval gate
Releases and architecture changes require explicit Product Owner approval
(CLAUDE.md). No AI self-approval.
