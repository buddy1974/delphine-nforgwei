# Architecture — Delphine Ecosystem

## Two planes (locked)
1. **Control / content plane** = the Ecosystem OS (`os/`, Next.js 14). Owns all
   content and operations. Validates, snapshots, and serves published content.
2. **Rendering plane** = the public brand websites. They render published content
   fetched from the OS. They never own canonical content.

ADR-E01/E02 (see DRIMP decision-log) fix this split. P1B corrected an earlier
violation where an OS-hosted route rendered the visual page directly.

## Data
Single Supabase project `mohogdfdzmewwvgcizga`. Brand is a column (`brand_key`)
FK-bound to `brands(key)`. RLS enabled on every table with zero anon/authenticated
policies — only the OS server (service role) reads/writes. Public sites read only
through the OS public API.

## Content lifecycle (P1C — immutable snapshot publishing)
- `pages` + `sections` are the mutable draft surface (editors change them live).
- Publish snapshots `sections` into an immutable `page_versions` row, then sets
  `pages.published_version_id` to that row.
- The public API serves `page_versions.sections` when `published_version_id` is
  set; otherwise it falls back to the mutable `sections` (legacy pages).
- Rollback = move `published_version_id` to a prior version. Zero section mutation.
- `publish_history` is an append-only audit log of publish/rollback/unpublish.

## Secure preview plane (P1B + P1D, generalized in P1E)
- The OS creates a `preview_sessions` row + an immutable `page_versions` snapshot
  and mints a short-lived HMAC-signed, nonce-hashed, TTL-bound, revocable token.
- The brand website route `/os-preview/:brand?token=...` fetches
  `OS/api/preview/:brand?token=...`; the OS validates origin + token + session and
  returns the exact snapshot. The website renders it with real brand components.
- **P1E generalization:** `createPreviewSession(brandKey)`, `/api/preview/[brand]`,
  a shared bridge contract (`preview-bridge.ts`), a shared adapter layer
  (`preview-adapters.tsx`), and per-brand site-URL env resolution
  (`preview-config.ts`). A brand participates only if `brands.ts` marks its
  `previewMode: "secure"`. Today only Delphine is "secure"; all others remain
  "generic" (OS-internal block preview). No behaviour changed for any brand.

## Click-to-edit bridge (P1D)
postMessage contract between OS BrandWorkspace (parent) and the preview iframe:
- Parent → iframe: `PREVIEW_INIT`, `EDIT_MODE`, `HIGHLIGHT_SECTION`.
- iframe → parent: `SECTION_CLICK`, `FIELD_CHANGE`, `PREVIEW_READY`.
Inline edits autosave (debounced) to `sections`; the canvas reflects changes.

## Deploy topology
- OS: own Vercel project, root `os/`, `basePath:/os`, exposed at delphine-nforgwei.com/os.
- Each site: `VITE_OS_URL` (Vite sites) / `OS_URL` (Next sites) → the OS base URL.
- Secure preview per brand: `<BRAND>_PUBLIC_SITE_URL` (only Delphine active).

## Security headers
OS sets X-Frame-Options SAMEORIGIN, nosniff, referrer policy globally; the preview
API adds no-store + noindex + no-referrer and origin-restricted CORS.
