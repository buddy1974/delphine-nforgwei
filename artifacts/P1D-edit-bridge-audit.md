# P1D — Read-Only Root Cause Audit: Visual Preview + Edit Bridge

**Mode:** READ-ONLY. No code, edits, commits, deployments, or migrations were made.
**Repository:** delphine.nforgwei (Delphine Ecosystem OS)
**Date:** 2026-06-18
**Auditor role:** Principal AI Systems Architect (Cowork / Inspector)
**Scope:** Why Delphine renders but click-to-edit is dead; true status of SMCC, E-Woman, DRIMP.

---

## 0. What I read (evidence base)

- `os/src/components/BrandWorkspace.tsx` — OS canvas, iframe host, postMessage listener
- `src/pages/OsPreview.tsx` — Delphine secure-preview renderer (Vite public site, `/os-preview/delphine`)
- `os/src/app/(preview)/pages/[id]/preview/page.tsx` — generic Next.js draft preview (other brands)
- `os/src/app/(shell)/preview/actions.ts` — `createDelphinePreviewSession`
- `os/src/app/api/preview/delphine/route.ts` — token/session validation + CORS
- `os/src/app/(shell)/[brand]/page.tsx` — workspace data loader
- `os/next.config.js`, `os/src/middleware.ts`, `.env.example`, `vercel.json`
- `src/App.tsx`, `src/components/sections/*`
- `docs/change-log.md`, `docs/decision-log.md`, `docs/known-risks.md`

---

## 1. Executive diagnosis

There are **two separate, divergent preview + edit-bridge implementations**, and Delphine was moved from one to the other in P1B/P1B.7A **without porting the full bridge contract**:

| | Generic preview (Path A) | Delphine secure preview (Path B) |
|---|---|---|
| File | `os/.../(preview)/pages/[id]/preview/page.tsx` | `src/pages/OsPreview.tsx` |
| Origin | **Same-origin** (`/os/pages/{id}/preview`) | **Cross-origin** (public site `/os-preview/delphine`) |
| Fidelity | Low (generic boxes, placeholder cards, brand-accent color) | High (real Delphine components) |
| Bridge | **Full** `BRIDGE_SCRIPT`: SECTION_CLICK + EDIT_MODE + HIGHLIGHT_SECTION + FIELD_CHANGE + `data-editable` + link-nav guard | **Partial**: SECTION_CLICK only |
| Used by | SMCC, E-Woman, DRIMP (+ Delphine before P1B) | Delphine only |

P1B.7A fixed **rendering fidelity** for Delphine by routing it through the real components on the public website. But the real-component path (`OsPreview.tsx`) only re-implemented the **outbound click** half of the bridge. It does not handle `EDIT_MODE` / `HIGHLIGHT_SECTION`, never emits `FIELD_CHANGE`, the real components carry no `data-field` / `data-editable`, and there is no link-navigation guard. On top of that, click delivery now depends on a **cross-origin `postMessage`** whose target origin is a separately-configured env var.

**This is a predictable regression, not a failure.** Preview fidelity was lifted onto a new rendering plane; the edit overlay/bridge did not come with it. Marcel's read is essentially correct.

The other three brands were **never in scope** for the high-fidelity path — `createDelphinePreviewSession` hard-rejects them ("Secure website preview is only enabled for Delphine in P1B"). They still run on the generic renderer, which is why colours are off and logo/images are missing. That is expected output of the generic renderer, not breakage.

---

## 2. Delphine root cause

### 2a. Primary cause — cross-origin `postMessage` target coupling (explains "nothing happens")

`OsPreview.tsx` fires the click upstream like this:

```ts
const OS_URL = import.meta.env.VITE_OS_URL || "http://localhost:3100/os";
...
window.parent.postMessage(
  { type: "SECTION_CLICK", sectionId: section.dataset.sectionId, field: field?.dataset.field || "title" },
  new URL(OS_URL).origin          // ← target origin = origin baked into VITE_OS_URL
);
```

The browser **silently drops** a `postMessage` whose `targetOrigin` does not exactly match the parent window's real origin. Critically, three origins are configured **independently**:

1. **Parent origin** — where Marcel actually has the OS open (e.g. `os-alpha-vert.vercel.app` vs the production `www.delphine-nforgwei.com/os`).
2. **`VITE_OS_URL`** (baked into the public-site build) — the `postMessage` **target**.
3. **`DELPHINE_PUBLIC_SITE_URL`** (OS env) — gates the **CORS fetch** and `previewOriginRef`.

Rendering only needs (2) + (3) to be correct, because the preview loads its data over a CORS `fetch`. **Click-to-edit additionally requires `VITE_OS_URL`'s origin to be byte-for-byte identical to the parent origin Marcel is viewing.** If Marcel opens the OS on a domain different from the one baked into the public site's `VITE_OS_URL` (very likely now that ADR-005 puts the OS at `www.delphine-nforgwei.com/os` while verification was done on `os-alpha-vert.vercel.app`), then:

- the data fetch still succeeds → **preview renders correctly**, but
- every `SECTION_CLICK` is posted to the wrong origin → **dropped → clicking does nothing.**

This single mechanism reproduces the exact symptom: *renders, but click is dead.*

### 2b. Secondary cause — incomplete bridge contract (true even if origins align)

Even with origins aligned so `SECTION_CLICK` arrives, the Delphine path is only half-wired versus the generic `BRIDGE_SCRIPT`:

- **No `EDIT_MODE` listener** → `data-editable`/contentEditable never activates; the parent's `sendToIframe({type:"EDIT_MODE"})` is ignored.
- **No `HIGHLIGHT_SECTION` listener** → selected-section highlight never shows.
- **Never emits `FIELD_CHANGE`** → BrandWorkspace's `FIELD_CHANGE` handler (inline autosave) is dead code for Delphine.
- **Real components expose no `data-field` / `data-editable`** → `field` always defaults to `"title"`; inline text editing is impossible.
- **No link/button navigation guard** → real marketing CTAs (`<a href>`) navigate the iframe on click instead of selecting the section.

### 2c. Ruled out — section IDs (this is NOT the problem)

`createDelphinePreviewSession` snapshots `JSON.parse(JSON.stringify(sections))` into `page_versions`, and the API returns `version.sections` unchanged. The rendered `data-section-id` therefore equals the live `sections` row id held in `BrandWorkspace` state, so `sections.find(s => s.id === selectedSectionId)` resolves correctly. **ID preservation is intact.** No DB or schema change is required to fix click-to-edit.

---

## 3. SMCC status

- **Renders:** yes, via the **generic** same-origin Next preview (`/os/pages/{id}/preview`), not the secure preview.
- **Wrong colours / missing logo / missing images:** **expected**, not a bug. The generic renderer uses only `brand.accent`, renders placeholder skeleton cards, has no logo, and shows images only where `image_url` is set. There is no SMCC real-component set and no `os-preview/smcc` route.
- **Edit:** the generic preview's `BRIDGE_SCRIPT` is the **full** bridge — click-to-edit technically works here (same-origin, `targetOrigin: '*'`). Perceived "no edit possibility" is most likely the fidelity gap (it doesn't look like the real site) rather than a broken bridge.
- **Data:** seeded to 9 sections in H8.0.
- **Expected to work at real-site fidelity now?** **No.** Out of scope until the renderer is generalized.

## 4. E-Woman status

- Identical situation to SMCC: generic renderer, 9 sections (H8.0), no real components, no `os-preview/ewoman` route, rejected by `createDelphinePreviewSession`.
- Missing/incorrect assets = generic-renderer output, not a defect.
- Edit bridge present via generic preview; real-fidelity editing **not in scope yet.**

## 5. DRIMP status

- Generic renderer; homepage created in H8.0 with 9 sections.
- **Additional content gap (RISK-005):** DRIMP sections were seeded **without `image_url` values**, so image/program blocks render empty placeholders — compounds the "loads incompletely" impression. Content fix, no code change.
- No real components, no preview route, rejected by the secure-preview action.
- **Expected to work now? No.**

---

## 6. Architecture gap

1. **Two bridge implementations, one contract, no shared source.** The vanilla `BRIDGE_SCRIPT` (Path A) is the complete contract; `OsPreview.tsx` (Path B) re-implements a subset. They drift independently. There is no shared bridge module / message protocol definition.
2. **Edit-bridge correctness is coupled to three independently-configured origins.** Rendering and editing have different origin requirements, so the system can land in a "renders but can't edit" state with no error surfaced anywhere.
3. **Fidelity is brand-bespoke.** Real components exist only for Delphine; the renderer is not brand-generalized. Bringing a brand to fidelity currently means hand-extracting its components + adding a route — not data-driven.
4. **Silent failure.** A dropped cross-origin `postMessage` produces no console error and no UI signal. There is no diagnostic/handshake (e.g. a `PREVIEW_READY` ack) to detect a dead bridge.
5. **Doc drift.** RISK-006 still describes the canvas as using `/pages/{id}/preview` (true for 3 brands, stale for Delphine post-P1B). Worth reconciling.

---

## 7. Minimal Delphine fix plan (proposal only — needs approval)

Goal: restore click-to-edit on the **high-fidelity** path without touching P1C, security, or DB.

1. **Resolve the origin coupling (highest impact, likely root of "nothing happens").**
   - Confirm the exact origin where Marcel opens the OS, and set the public site's `VITE_OS_URL` so its origin matches that parent origin exactly.
   - Harden `OsPreview.tsx` so it does not depend on a build-time guess: capture the real parent origin from the inbound `EDIT_MODE`/handshake message (or accept it via the signed preview payload) and post back to **that** origin. Add a `PREVIEW_READY` handshake so a dead bridge is detectable.
2. **Port the full bridge contract into `OsPreview.tsx`** to match `BRIDGE_SCRIPT`: listen for `EDIT_MODE` and `HIGHLIGHT_SECTION`; emit `FIELD_CHANGE`; add the link/button navigation guard in edit mode.
3. **Add `data-field` / `data-editable` to the real section components** (Hero/About/Programs/etc.) so field-level selection and inline editing work, instead of always defaulting to `"title"`.
4. **Verify** end-to-end on the actual production origin: render → click any section → inspector opens with correct section type → inline edit → autosave → preview refresh.

No migration. No schema change. IDs already map. P1B token/session security untouched.

---

## 8. Brand rollout plan (proposed order)

1. **P1D (this fix):** stabilize Delphine high-fidelity click-to-edit. Extract the bridge into a **single shared module / documented message protocol** as part of the fix so it is reused, not re-implemented.
2. **Bridge contract hardening:** add `PREVIEW_READY` handshake + dynamic parent-origin so no future brand can silently lose the bridge.
3. **H8 renderer generalization (separate approved sprint, RISK-006):** extract real components + brand themes/assets (logo, palette, images) for SMCC → E-Woman → DRIMP, each with its own `os-preview/{brand}` route, reusing the shared bridge. Lift `createDelphinePreviewSession`'s Delphine-only guard per brand as each is ready.
4. **Content backfill:** DRIMP image URLs (RISK-005), brand logos/assets.
5. Resume feature build only after the rendering/bridge plane is uniform.

---

## 9. What must NOT be touched

- **P1C publish lifecycle** — `pages.published_version_id`, `page_versions` immutability, `publish_history`, `publishVersion`/`rollbackToVersion`/`verifyPublishedVersion`. Working; do not refactor.
- **Preview security** — `os/src/lib/preview-tokens.ts` (HMAC), `preview_sessions` table, API CORS/`allowedPreviewOrigin`, no-store/noindex headers in `next.config.js` + `middleware.ts`.
- **Applied migrations** — `0002`, `0004_preview_sessions`, `0005_p1c_publish_lifecycle` (live in Supabase `mohogdfdzmewwvgcizga`).
- **Section schema / IDs** — IDs already map correctly; no migration needed for this fix.
- **The generic `BRIDGE_SCRIPT`** — it is the working reference contract for the other 3 brands; use it as the spec, don't break it.
- **`os/src/lib/brands.ts`** registry.
- **Windows `(shell)`/`(preview)` write rule (RISK-001):** any future edit to files in those route groups must go through the `python3` bash-write pattern, not Edit/Write.

---

## 10. Exact Sonnet prompt — Delphine edit-bridge fix ONLY

```txt
READ CLAUDE.md FIRST. Run the repository preflight before any change.

PROJECT: Delphine Ecosystem OS (delphine.nforgwei)
MODE: IMPLEMENTATION — SCOPED, MINIMAL, DELPHINE ONLY
APPROVAL: Material changes require Marcel's approval before commit. No deploy.

OBJECTIVE
Restore click-to-edit on the Delphine HIGH-FIDELITY secure preview
(src/pages/OsPreview.tsx rendered at /os-preview/delphine), which currently
renders correctly but does not respond to section clicks.

ROOT CAUSE (already audited — do not re-litigate):
1. OsPreview posts SECTION_CLICK to `new URL(VITE_OS_URL).origin`. If that origin
   does not exactly equal the origin where the OS is actually open, the browser
   drops the message silently → clicking does nothing.
2. OsPreview only implements the OUTBOUND click. It does NOT handle EDIT_MODE or
   HIGHLIGHT_SECTION, never sends FIELD_CHANGE, the real components have no
   data-field/data-editable, and there is no link-nav guard.
Section IDs already map correctly — DO NOT touch the DB, schema, or migrations.

DO NOT TOUCH:
- P1C publish lifecycle (published_version_id, page_versions, publish_history, publish/rollback/verify)
- Preview token security (preview-tokens.ts, preview_sessions, API CORS, security headers)
- os/src/lib/brands.ts
- Anything for SMCC / E-Woman / DRIMP (separate sprint)
- Applied migrations 0002 / 0004 / 0005

TASKS
1. Make the parent origin reliable, not build-time-guessed:
   - Have BrandWorkspace send the preview an EDIT_MODE (or a new PREVIEW_INIT)
     message that includes the OS's window.location.origin on iframe load.
   - In OsPreview, capture e.origin from the first trusted parent message and post
     all subsequent SECTION_CLICK / FIELD_CHANGE to THAT origin (not VITE_OS_URL).
   - Add a PREVIEW_READY handshake so a non-responding bridge is detectable.
2. Port the full bridge contract into OsPreview.tsx to match the generic
   BRIDGE_SCRIPT in os/src/app/(preview)/pages/[id]/preview/page.tsx:
   - Listen for EDIT_MODE → toggle contentEditable on [data-editable].
   - Listen for HIGHLIGHT_SECTION → scroll + highlight the matching wrapper.
   - Emit FIELD_CHANGE (debounced) on input of editable fields.
   - In edit mode, preventDefault on link/button clicks so navigation does not
     hijack selection.
3. Add data-section-id + data-field + data-editable to the real Delphine section
   components (Hero/About/Programs/Books/Events/Gallery/Contact/Transformation/
   Testimonials/Ecosystem) so field-level click + inline edit work. Keep visual
   output identical.

CONSTRAINTS
- Files in (shell)/(preview) route groups: write via the python3 bash pattern (RISK-001), never Edit/Write.
- Verify with `npx tsc --noEmit` (npm run build times out in sandbox — that is expected).

VERIFY (report results, do not self-approve):
Render Delphine → click a section → inspector opens with correct section type →
toggle edit mode → inline-edit a heading → autosave fires → preview refreshes →
highlight tracks selection. Confirm on the ACTUAL production OS origin.

Then STOP and hand back for human approval. Do NOT start H8.
```

---

### Verification of this audit
Findings were derived by reading the actual source of both preview paths, the
preview session action, the validation API, the env contract, and the change/
decision/risk logs — not from assumptions. The ID-preservation claim was checked
against the snapshot serialization and API response shape. The origin claim is
grounded in the env.example contract plus the verified deployment origins recorded
in the decision log (public site `www.delphine-nforgwei.com`, OS `os-alpha-vert.vercel.app`).
