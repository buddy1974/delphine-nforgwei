# Known Risks

## RISK-007 — P1B Preview Sessions Migration Pending Remote Application
**Severity:** Medium  
**Status:** RESOLVED — 2026-06-15

**Description:** P1B adds `os/supabase/migrations/0004_preview_sessions.sql`. Migration has been successfully applied — confirmed by `preview_sessions` rows with `access_count` incrementing in production Supabase project `mohogdfdzmewwvgcizga`. OS preview session creation and token validation are working end-to-end in production.

---

## RISK-001 — Windows Path Encoding: (shell)/(preview) App Router Groups
**Severity:** Medium  
**Status:** Active, managed

**Description:** Files inside Next.js App Router groups with parentheses in the path (e.g., `(shell)`, `(preview)`) cannot be reliably written via the Edit/Write tools in the Claude Code environment on Windows. The tool truncates the file at a random point when the path contains parentheses.

**Mitigation:** All writes to files inside `(shell)` or `(preview)` route groups must be performed via `python3` bash script using the mcp__workspace__bash tool. This has been established as the working pattern since H7.2.

**Example commands that work:**
```bash
python3 << 'EOF'
content = '''...file content...'''
with open('/sessions/.../os/src/app/(shell)/page.tsx', 'w') as f:
    f.write(content)
EOF
```

---

## RISK-002 — Next.js Build Timeout in Sandbox
**Severity:** Low  
**Status:** Known limitation

**Description:** `npm run build` consistently times out in the sandbox environment (>45s limit). TypeScript compilation (`npx tsc --noEmit`) works reliably and serves as the primary verification step.

**Mitigation:** Use `npx tsc --noEmit` for all TypeScript verification. Production builds are handled by Vercel CI.

---

## RISK-003 — Supabase Storage Not Configured
**Severity:** Medium  
**Status:** Pending — blocked on production credentials

**Description:** The Media Library uploads via `uploadMediaFile()` action, which calls Supabase Storage. If the `media` storage bucket does not exist or RLS policies are not configured, uploads will fail with a storage error.

**Mitigation:** Create the `media` bucket in Supabase Storage (project mohogdfdzmewwvgcizga). Set `public` access for the bucket or configure appropriate signed URL policies. Document the bucket name in env vars.

---

## RISK-004 — Brand Identity Changes Require Code Deploy
**Severity:** Low  
**Status:** By design — documented

**Description:** Brand name, domain, short name, and accent color are defined in `os/src/lib/brands.ts` (static registry). Any change to brand identity requires a code commit and Vercel redeploy.

**Mitigation:** Document this clearly in Settings UI (done). Brand DB edit UI is a planned future admin phase enhancement.

---

## RISK-005 — DRIMP Homepage Has No Featured Image URLs
**Severity:** Low  
**Status:** Content gap

**Description:** DRIMP sections were seeded with structured content but no image_url values for the image section or program_card sections. The canvas will render with empty image placeholders.

**Mitigation:** Upload images to the DRIMP media library and set image_url values via the section inspector. No code change required.

---

## RISK-006 — H8 Renderer Migration Pending Approval
**Severity:** Medium  
**Status:** Approved in principle — not yet implemented

**Description:** The architecture decision (H8) to make the Delphine public site the actual iframe renderer (replacing the internal OS preview renderer) is approved but not implemented. The current canvas uses the OS internal preview route (`/pages/{id}/preview`). The H8 migration is a significant architecture change requiring a dedicated implementation session.

**Mitigation:** Do not begin H8 in the same session as other work. Treat as a separate sprint.
