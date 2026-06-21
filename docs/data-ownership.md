# Data Ownership — Delphine Ecosystem

## Single database
Supabase project `mohogdfdzmewwvgcizga`. One DB for the whole ecosystem.
RLS enabled on every table; **zero anon/authenticated policies**. Only the OS
server (service role) reads/writes. Public sites never touch the DB directly —
they read only through the OS public API.

## OS-owned tables (content + operations), keyed by `brand_key`
- `brands` — registry (delphine, smcc, ewoman, drimp).
- `pages`, `sections` — structured page content (draft surface). `pages.published_version_id` → immutable snapshot.
- `page_versions` — immutable version snapshots (drafts, secure previews, published).
- `preview_sessions` — short-lived secure preview sessions (token-gated).
- `publish_history` — append-only publish/rollback/unpublish audit log.
- `posts` — blog. `os_events` — events. `media` — image registry.
- `conversations`, `os_messages` — message center. `payment_claims` — payments.
- `notifications` — Telegram layer. `ai_drafts` — AI Studio (never auto-published).

## Hybrid ownership note (SMCC)
The SMCC business app (separate repo) owns its own operational data — `leads`,
`enrollments`, `chat_sessions`, `chat_messages`, `appointments`, payments — in the
SAME Supabase project but OUTSIDE the OS schema. These legacy tables were RLS-locked
by OS migration `0001`. So: the OS owns SMCC's marketing content (blog/events/pages);
the SMCC app code owns SMCC's enrollment/payment/CRM data.

## Source of truth
The repository documents (this `docs/` set) and the database schema/migrations are
the source of truth. Chat history is NOT (see CLAUDE.md MEMORY RULE).

## Secrets
Service role key, `PREVIEW_TOKEN_SECRET`, Telegram/OpenAI keys are server-only and
never prefixed `NEXT_PUBLIC_`. `.env.local` is gitignored. Per-brand public site
URLs (`<BRAND>_PUBLIC_SITE_URL`) are non-secret config.
