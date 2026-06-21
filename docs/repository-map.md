# Repository Map — delphine.nforgwei

This repository holds TWO independently-built applications plus governance docs.

## 1. Public Delphine website (repository root) — rendering plane
- Stack: Vite + React + TypeScript + Tailwind + shadcn/ui, React Router.
- Deploy: GitHub → Vercel. Production: https://www.delphine-nforgwei.com
- Key paths:
  - `src/pages/` — public pages (Index, About, Programs, Books, Events, Gallery, Contact, Connect, ThankYou) plus OS-driven routes: `OsPage.tsx` (`/p/:slug`), `OsEvents.tsx` (`/os-events`), `Blog.tsx` (`/blog`), and `OsPreview.tsx` (`/os-preview/:brand`, the secure edit-the-website canvas).
  - `src/components/sections/` — brand-specific visual section components (Hero, About, Programs, Books, Events, Gallery, Contact, Transformation, Testimonials, Ecosystem).
  - `src/components/sections/preview-adapters.tsx` — P1E shared adapter layer (section-type → props mapping + switch routing + generic fallback renderer).
  - `src/lib/preview-bridge.ts` — P1E shared postMessage contract (rendering side).
  - `src/App.tsx` — routes. `/os-preview/:brand` renders outside the public Layout.

## 2. Ecosystem OS (`os/` subfolder) — control / content plane
- Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase. `basePath: "/os"`.
- Deploy: separate Vercel project, Root Directory `os/`, exposed at delphine-nforgwei.com/os.
- Single multi-tenant admin for all four brands (delphine, smcc, ewoman, drimp). Brand is a data field.
- Key paths:
  - `os/src/app/(shell)/` — authenticated admin shell: dashboard, pages, blog, events, media, messages, payments, ai-studio, settings, help, and per-brand `[brand]/` workspace routes.
  - `os/src/app/(preview)/pages/[id]/preview/` — OS-internal generic block preview (used by non-secure brands).
  - `os/src/app/api/public/[brand]/...` — read-only public content API consumed by the brand sites.
  - `os/src/app/api/preview/[brand]/route.ts` — P1E brand-generic secure preview validator. `os/src/app/api/preview/delphine/route.ts` — retained static delegate (identical behaviour).
  - `os/src/components/BrandWorkspace.tsx` — the website-first editing canvas + toolbar + inspector.
  - `os/src/components/builder/` — PageEditor, SectionCard, VersionHistory, editors.
  - `os/src/lib/` — `brands.ts` (registry + previewMode), `preview-config.ts` (server site-URL resolver), `preview-api.ts` (shared preview handler), `preview-bridge.ts` (contract), `preview-tokens.ts` (HMAC tokens), `db/` (pages/posts/events/messages/payments), `supabase/` clients.
  - `os/supabase/migrations/` — `0001`..`0005` (additive, version-controlled).

## 3. Governance docs (`docs/`)
repository-map · product-brief · architecture · workflow-map · decision-log · change-log · known-risks · data-ownership · production-readiness · release-checklist · security-checklist.

## Single database
Supabase project `mohogdfdzmewwvgcizga`. RLS on every table; only the OS service role reads/writes. See `data-ownership.md`.
