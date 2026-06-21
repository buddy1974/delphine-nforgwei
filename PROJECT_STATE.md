# PROJECT STATE — DELPHINE (Authority Platform + Ecosystem OS)

Last Updated: 2026-06-19 (P1E)

---

## 1. What this repo is
TWO apps in one repo:
- Root: the public Delphine website (Vite + React), the rendering plane.
- `os/`: the Ecosystem OS (Next.js 14), the control/content plane for ALL four
  brands (delphine, smcc, ewoman, drimp). Served at delphine-nforgwei.com/os.

(The earlier "static authority site, no backend, no database" description was
stale and has been corrected.)

## 2. Hosting / deploy
- Site: GitHub → Vercel. Production: https://www.delphine-nforgwei.com
- OS: separate Vercel project, root `os/`, basePath `/os`.

## 3. Backend / data
- Supabase `mohogdfdzmewwvgcizga` (single ecosystem DB). RLS everywhere; OS
  service role only. Public sites read via the OS public API only.

## 4. Capabilities (Delphine)
- Website-first editing in the OS canvas (BrandWorkspace).
- Secure preview plane (preview_sessions + immutable page_versions + signed token).
- Click-to-edit bridge (P1D): SECTION_CLICK / EDIT_MODE / HIGHLIGHT_SECTION /
  FIELD_CHANGE / PREVIEW_INIT / PREVIEW_READY; inline autosave.
- Publish lifecycle (P1C): draft → snapshot → publish (published_version_id) →
  verify → rollback → unpublish; publish_history audit.
- P1E: the preview plane is now brand-agnostic (createPreviewSession,
  /api/preview/[brand], shared bridge + adapter modules, per-brand site-URL env).
  Only Delphine is activated (previewMode "secure").

## 5. Environment variables (OS)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
PREVIEW_TOKEN_SECRET, DELPHINE_PUBLIC_SITE_URL (active),
SMCC/EWOMAN/DRIMP_PUBLIC_SITE_URL (prepared, inert), TELEGRAM_*, OPENAI_API_KEY.

## 6. Messaging / payments
WhatsApp + email via direct links; OS Message Center + Payment Center for ops.

## 7. Known issues / next
- See docs/known-risks.md. Next phase after P1E is H8 (activate E-Woman secure
  preview) — NOT started. Owner approval required.
