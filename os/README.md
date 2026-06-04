# DELPHINE ECOSYSTEM OS

Central admin backend for the Delphine ecosystem (delphine · smcc · ewoman · drimp).
Phase C: authenticated shell + brand switcher + dashboard + 8 placeholder modules.
Plan & data model: `drimp-ecosystem/docs/ecosystem-os-architecture.md`.

## Stack

Next.js 14 (App Router, `basePath: /os`) · TypeScript · Tailwind · Supabase (DB + Auth).
Database: Supabase project `mohogdfdzmewwvgcizga` — schema in `supabase/migrations/0001_os_core_schema_and_rls.sql` (applied 2026-06-04). RLS enabled on every table; no anon policies — all data access is server-side.

## Local setup

```bash
cd os
npm install
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                   # http://localhost:3100/os
```

## Create the first admin user

Supabase Dashboard → Authentication → Users → **Add user** → email + password (auto-confirm).
Any authenticated user is treated as team in Phase C; roles come with a later phase.

## Deployment (separate Vercel project)

1. Vercel → New Project → import the GitHub repo → **Root Directory: `os/`**.
2. Set env vars from `.env.example`.
3. The app serves under `/os` (basePath). To expose it at `delphine-nforgwei.com/os`, add to the MAIN delphine site's `vercel.json` (deferred — Owner point 5):

```json
{ "rewrites": [{ "source": "/os/:path*", "destination": "https://<os-project>.vercel.app/os/:path*" }] }
```

Until then, use the OS project's own `*.vercel.app/os` URL.

## Phase C boundaries

No live data wiring, no public-site changes, AI never auto-publishes (enforced later by `ai_drafts.status` workflow). Modules are placeholders listing their planned scope.
