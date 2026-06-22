# Decision Log

## P1D.8 — Save Draft False Success: Root Cause (2026-06-21)

### Decision: Use runSave() wrapper for saveVersion; gate setDraftSaved on result.ok

**Root cause:** `saveVersion` returned `void`. `handleSaveDraft` called it with `await` and discarded the result — there was no result to check. The `setDraftSaved(true)` call ran immediately after `await saveVersion(...)` with no condition. Any server-side failure (503, DB error, thrown exception) was invisible at the call site.

**Fix:** Changed `saveVersion` to return `{ ok: true } | { error: string }`. Wrapped in `runSave()` so the result is `SaveResult = { ok: true } | { ok: false; error: string }` — the same contract already established for `updateSection`, `updateEvent`, `updatePost`. `setDraftSaved(true)` now only fires when `result.ok === true`.

**Why runSave() not direct access?** The old-style union `{ ok: true } | { error: string }` has no `ok` property on the `{ error }` branch — TypeScript raises TS2339. `runSave()` normalises both branches to carry `ok`, eliminating the type error and providing exception catching as a bonus.

**Consequence:** Save Draft button is fully truthful. The pattern is now consistent across all write paths: AutoField inspector, BrandWorkspace FIELD_CHANGE canvas, PageEditor FIELD_CHANGE canvas, Save Draft, Publish snapshot.

---

## P1D.9 — Save Truthfulness Closure (2026-06-21)

### Decision: wrap saveVersion in runSave(); gate all draft/publish paths on result.ok; harden updateSection with phantom-write detection

**Context:** After P1D.6 introduced `runSave()` for the inspector and canvas edit paths, two gaps remained:
1. `saveVersion` returned `Promise<void>` and swallowed all DB insert errors. `handleSaveDraft` called `setDraftSaved(true)` unconditionally — no save actually needed to succeed.
2. `PageEditor` FIELD_CHANGE path called `await updateSection(...)` fire-and-forget — no error check, no state feedback.

**Decision:**
- `saveVersion`: change return type to `{ ok: true } | { error: string }`. Capture Supabase insert error. Never swallow.
- All callers of `saveVersion` (handleSaveDraft, handlePublish) wrap in `runSave()` for consistent `SaveResult` typing. This is the P1D.6 pattern applied to the version snapshot path.
- `handlePublish`: if snapshot fails, return early — do not attempt to publish a stale or wrong version.
- `updateSection`: add `.select("id")` post-update to detect phantom writes (rows that don't exist being silently "updated" by Supabase with 0 rows modified but no error).
- `PageEditor` FIELD_CHANGE: replace fire-and-forget with `runSave()` + monotonic seq guard + `InlineSaveState` machine. Add `Saving… / Saved ✓ / Save failed` badge in right panel header.

**Rationale:** After P1D.6, the inspector path (AutoField) was sound. The save-draft, publish-snapshot, and PageEditor canvas paths were the remaining uncovered surface area. Every UI-visible "success" now requires explicit `result.ok === true` from `runSave()`. The `.select("id")` addition to `updateSection` makes the "no row updated" case visible — previously Supabase returned no error even when the target row didn't exist.

**Consequence:** P1D is closed. No save path produces a false positive success signal. The `saveVersion` old-style union `{ ok: true } | { error: string }` required wrapping in `runSave()` rather than direct `.ok` access, because TypeScript cannot narrow `.ok` on the `{ error: string }` branch.

---

## P1F — Secure Preview Transport Hardening: Retry Architecture (2026-06-21)

### Decision: Bounded retry (3 attempts) with last-good-iframe preservation for createPreviewSession

**Context:** After P1D closed save truthfulness, intermittent 503s from `createPreviewSession` remained. The old code called `createPreviewSession` once with no retry. Any transport failure — transient Supabase error, cold-start 503, timeout — replaced the working iframe with a red error panel, even when the previous preview was still valid.

**Decision:** Wrap `createPreviewSession` (and only `createPreviewSession`) in a `runPreviewWithRetry()` loop inside the secure preview `useEffect`. 3 total attempts, 500 ms / 1500 ms backoff, 8 s per-attempt timeout via `Promise.race`. Business errors detected via `isPreviewBusinessError()` (module-level function + Set) abort immediately. `securePreviewUrl` and `securePreviewVersionId` are never cleared at retry start or on exhaustion — the last-good iframe stays mounted and visible throughout the retry cycle. Error panel only appears when all retries fail AND `securePreviewUrl === null` (no preview has ever succeeded in this session). A `PreviewStatus` state machine drives both the toolbar badge and the render branches.

**Rationale:** The old single-attempt design made the preview system fragile to transient infrastructure errors. The last-good preservation is the most important behavioral improvement — the user's working canvas is never replaced with an error panel just because a refresh failed. Retry is bounded (not infinite) to avoid hammering Supabase on legitimate config errors. Business errors skip retry since they indicate a structural problem (bad brand key, page not found) that a retry cannot fix.

**Consequence:** Preview instability from transient 503s now surfaces as "Preview retrying…" badge in the toolbar, with the previous iframe still visible. Only sustained failures (all 3 attempts + legitimate session) result in "Preview unavailable". This phase is Leg A only — Leg B (OsPreview route) unchanged.

**Note:** P1D (save truthfulness) is fully closed. The remaining 503s were a separate issue in the preview transport, not the save layer. The naming is P1F (not P1E) — decision-log already records P1E as "Ecosystem Consolidation & Preview-Plane Generalization".

---

## P1D.6 — SaveResult Normalization: Positive-Only Success Detection (2026-06-20)

### Decision: Introduce runSave() normalizer; success requires explicit ok===true; no raw server action result reaches AutoField

**Context:** P1D.5 used `if ("error" in result) → failed else → saved`. This is negative detection — it assumes success when no "error" key is present. But Next.js Server Action responses under real 503 conditions can resolve (not throw) with unexpected shapes: `undefined`, digest objects (`{ digest: "..." }`), or partial error payloads that don't have an "error" key. All of these silently become "Saved ✓".

**Decision:** Create `os/src/lib/save-result.ts` with `SaveResult = { ok: true } | { ok: false; error: string }` and a `runSave()` wrapper. Positive check only: `result.ok === true` is the single success gate. Anything else — including unexpected shapes, undefined, thrown exceptions, 503 digest objects — normalizes to `{ ok: false, error: "Save failed" }`. All callers (BrandWorkspace, PageEditor, EventEditor, PostEditor) wrap their server action calls in `runSave()` before returning to AutoField. AutoField checks `!result.ok` for failure.

**Rationale:** Defense-in-depth. The normalizer acts as a firewall between unpredictable Server Action response shapes and the UI state machine. Even if Next.js changes its error envelope format, or if a new action has a bug, the worst outcome is "Save failed" — never a false "Saved ✓". The type `{ ok: true } | { ok: false; error: string }` forces TypeScript to reject any code that doesn't account for both branches.

**Consequence:** No code path can produce "Saved ✓" without explicit `result.ok === true` from `runSave()`. The FIELD_CHANGE canvas path in BrandWorkspace now also uses `runSave()` — both inspector and canvas edits are covered. The outer `try/catch` in the FIELD_CHANGE handler was removed (redundant since `runSave` absorbs all exceptions).

---

## P1D.5 — Inspector Save Path: AutoField Owns the State Machine (2026-06-20)

### Decision: Fix AutoField, not BrandWorkspace FIELD_CHANGE path, for inspector autosave failures

**Context:** P1D.3 and P1D.4 patched `BrandWorkspace.tsx` FIELD_CHANGE canvas path. Browser test failed: "Save failed" never appeared. Bundle analysis showed the string was not present in production. Root cause: the inspector Title field routes through `AutoField.tsx`, a separate component with its own state machine. `AutoField` had no "failed" state. Its `onSave` was typed `Promise<void>` — callers could not return a result to it. Additionally, all P1D work was uncommitted due to RISK-010 (index.lock), so production was running pre-P1D code.

**Decision:** Fix `AutoField.tsx` as the authoritative per-field save state machine. Add "failed" state, seq guard, try/catch. Change `onSave` to `Promise<{ ok: true } | { error: string }>`. Propagate the return type up through all callers: `SectionCard`, `BrandWorkspace.handleSave`, `PageEditor.handleSave`, `EventEditor.save`, `PostEditor.save`. All five callers already used `updateSection`/`updateEvent`/`updatePost` which already returned the discriminated union — they were just discarding it.

**Rationale:** `AutoField` is the component the user sees (the badge renders inside the label span). The state must live where the display lives. Changing `AutoField` once fixes all inspector fields across all section types, all editors, all brands.

**Consequence:** Every inspector field (Title, Subtitle, Body, Button label, Button link, image URL, event fields, post fields) now shows accurate "Saving… / Saved ✓ / Save failed" state. "Save failed" does not auto-clear. bumpPreview only fires on confirmed success. Seq guard prevents stale responses from overwriting newer state.

**RISK-001 encountered:** Write tool truncated AutoField.tsx at line 77 (mid-string), Edit tool truncated SectionCard.tsx by 5 lines. Both repaired via python3. This is now a documented pattern — any file >60 lines must use python3 for creation/repair.

---

## P1D.4 — Autosave Race Fix: Monotonic Seq Counter (2026-06-20)

### Decision: Per-request monotonic seq number; all state transitions discard if seq is stale

**Context:** Opus audit identified that `inlineSaveState` is global and unbound to any specific save request. Multiple saves in flight (rapid typing across fields or rapid re-type of same field) allow an older response to overwrite a newer one. The 2.5s clear timer also fires unguarded, potentially clearing "Save failed" for a newer error.

**Decision:** Add `latestSaveSeq = useRef(0)`. Each setTimeout callback increments the counter and captures its own `seq`. Every subsequent state mutation checks `seq === latestSaveSeq.current` before executing. The 2.5s clear timer also checks seq before setting idle. `delete inlineSaveTimers.current[key]` moved to `finally` to guarantee cleanup even on early `return`.

**Rationale:** Monotonic counter is the standard solution for request-race problems in React without introducing cancellation tokens or AbortController complexity. Single ref, no external state, no re-render overhead, no change to server action signatures.

**Consequence:** UI state now always reflects the most recently started save. Earlier responses are silently discarded. "Save failed" cannot be overwritten by a stale "Saved ✓", and the clear timer cannot wipe it.

---

## P1D.3 — Fix Autosave Truth: Check Return Value, Not Just try/catch (2026-06-20)

### Decision: Inspect discriminated union return from updateSection; keep outer try/catch for network throws

**Context:** `updateSection` returns `{ ok: true } | { error: string }` and never throws. The existing `try/catch` in the FIELD_CHANGE debounce only catches genuine fetch/network failures, not Supabase-level write errors. A forced 503 or DB error showed "Saved ✓" — a correctness violation.

**Decision:** Change only `BrandWorkspace.tsx`. Do NOT change `updateSection` signature in `actions.ts` to avoid breaking other callers (inspector `handleSave`, etc.). Add `const result = await updateSection(...)` and branch on `"error" in result` before setting the save state badge.

**Rationale:** Narrowest possible fix. `actions.ts` is in a parenthesized route group (RISK-001 applies). `BrandWorkspace.tsx` is not, and the patch is small enough for a python3 string replacement. Outer try/catch retained to handle genuine network-level exceptions.

**Consequence:** Toolbar badge is now truthful. "Saved ✓" only appears on `{ ok: true }`. "Save failed" appears on `{ error: string }` or thrown network error.

---

## P1B.7A — Visual Verification: Real Website Renders in OS Canvas (2026-06-15)

### Outcome: CONFIRMED PASS

**Verification performed:** Loaded `os-alpha-vert.vercel.app/os/delphine` with a fresh session. Zoomed into the OS canvas iframe. Real Delphine public website rendered correctly — purple HeroSection, real Navbar (Home / About / Programs / Books / Events / Gallery / Contact), Delphine's photo, all live copy.

**Mechanism confirmed working end-to-end:**
1. `BrandWorkspace` calls `createDelphinePreviewSession` server action
2. Server action creates `preview_sessions` + `page_versions` records in Supabase, returns signed token URL
3. Iframe loads `www.delphine-nforgwei.com/os-preview/delphine?token=...`
4. `OsPreview` fetches `os-alpha-vert.vercel.app/os/api/preview/delphine?token=...`
5. OS API validates HMAC token, nonce hash, TTL, revocation → returns `{ page, sections }`
6. `OsPreview` renders real Delphine section components with live purple styling

**P1B closed. H8 / P1C NOT started. Human approval required before next phase.**

---

## P1B — Secure Preview Rendering Plane Scope (2026-06-11)

### Decision: OS Validates, Public Website Renders

**Context:** The locked architecture says OS = control/content plane and websites = rendering plane. An earlier OS-hosted visual route violated that split.

**Decision:** Implement OS preview validation as `/os/api/preview/delphine` JSON and implement visual rendering in the root Vite Delphine website at `/os-preview/delphine`. The OS creates `preview_sessions`, signs tokens, validates tokens server-side, and returns the exact immutable `page_versions` snapshot only to the configured Delphine website origin.

**Consequence:** The public Delphine website is the rendering plane. Draft data still requires a short-lived signed token and OS server validation before rendering.

---

## H7.2 — Website-First Workspace UX (2026-06-05)

### Decision: Flatten Sidebar Navigation

**Context:** Sidebar had accordion-style expand/collapse per brand showing sub-modules (Pages, Blog, Events, Media) inline.

**Decision:** Remove accordion. Brand click loads the website canvas directly. Sub-modules accessible from toolbar and full editor.

**Rationale:** Aligns with PRIMARY UX RULE: Website First. Editor Second. Management Third. Brand click should feel like opening a website, not navigating a tree.

**Consequence:** Sub-module links (Pages, Blog, Events, Media) are no longer visible in sidebar. Access via toolbar quick-add buttons or full editor link.

---

### Decision: Toolbar Extended with Add Post / Add Event / Save Draft / History

**Context:** Toolbar only had page tabs, Edit/Preview toggle, and Publish.

**Decision:** Added + Page, + Post, + Event buttons; Save Draft (version snapshot); History link; renamed toggle to "Edit Mode / Preview Mode".

**Rationale:** Removes need to leave the website canvas to create content. Matches Webflow/Framer mental model.

**Consequence:** Toolbar is more crowded at small widths. May need responsive collapsing in future.

---

### Decision: Inspector Shows Section Type Label (Not Generic "Edit Section")

**Context:** Inspector header showed generic "Edit Section" regardless of section type.

**Decision:** Display the human-readable section type label (Hero Section, About Section, Call To Action, etc.) from SECTION_TYPE_LABEL.

**Rationale:** Reinforces correct terminology. User sees "Hero Section" not "Edit Section".

---

### Decision: Dashboard Redesigned as Executive Command Center

**Context:** Dashboard was a functional but CMS-style management view.

**Decision:** Added Recent Drafts, Upcoming Events, Recent Publications panels. Website cards now link directly to workspace canvas. Quick Actions grid per brand.

**Rationale:** Rev. Delphine needs situational awareness at a glance, not a management table.

---

### Decision: Pre-Existing File Truncation Identified and Fixed

**Context:** Multiple OS files (package.json, next.config.js, pages.ts, Topbar.tsx, BrandProvider.tsx, SortableSectionItem.tsx, MediaPicker.tsx, PageEditor.tsx, SectionCard.tsx, MediaLibrary.tsx, media/actions.ts, PageList.tsx, preview/page.tsx) were truncated from a previous session due to Windows path encoding issues with the Write tool.

**Decision:** Restored all truncated files from git HEAD (which contains H7.2 committed state). Applied new H7.2 changes on top.

**Consequence:** All files are now complete. TSC passes clean.

---

## H7.2 — Verification Session (2026-06-05)

### Decision: H7.2 Confirmed Complete — No Rework Required

**Context:** Full preflight run ordered to verify H7.2 implementation state before marking phase complete.

**Decision:** Performed full code audit of BrandWorkspace.tsx, Sidebar.tsx, Dashboard page.tsx, preview/page.tsx, and all supporting files. All H7.2 requirements are implemented and match the specification exactly.

**Findings:**
- TSC: PASS (zero errors)
- Sidebar: flat, no accordion, brand click goes directly to workspace
- Toolbar: + Page / + Post / + Event / Save Draft / History / Edit Mode / Preview Mode / Publish all present
- Inspector: hidden by default, opens on section click, shows correct SECTION_TYPE_LABEL
- Dashboard: command center layout with Recent Drafts / Upcoming Events / Recent Publications panels
- No Delphine-inside-Delphine: sidebar shows "Delphine Ecosystem" as header only; brand links are flat
- Known limitation: iframe is still used for website canvas (same-origin, SAMEORIGIN policy set in next.config.js)

**Consequence:** H7.2 is ready for human review. No further implementation required before review.

---

### Decision: Canvas Click-to-Edit Flow — Audit and Gap Fix (H8-preflight)

**Context:** Product owner requirement: "Click Delphine → actual website canvas opens → click/edit sections." Full audit conducted to verify end-to-end flow.

**Audit Findings:**
- Architecture is sound: sidebar → `/delphine` → BrandWorkspace renders iframe → iframe renders real section blocks with `data-section-id` attributes → postMessage bridge fires `SECTION_CLICK` on any section click → auto-enables edit mode → inspector opens.
- X-Frame-Options: SAMEORIGIN (correct — same-origin iframe works).
- Root gap 1: Only 3 sections existed in the Delphine homepage (hero, about, cta). Canvas rendered correctly but was thin — 3 sections is not a "full visual homepage."
- Root gap 2: The edit mode toggle button was labeled "Preview Mode" when inactive — misleading. Users didn't know clicking it would enable editing.
- Root gap 3: The click-to-edit hint banner only appeared after edit mode was already on — users had no visual affordance on first load.

**Decision:**
1. Added 6 sections to Delphine homepage in Supabase (program_card x3, event_block, cards, image) — homepage now has 9 sections covering programs, events, books/resources, gallery.
2. Changed toggle button label from "Preview Mode / Edit Mode" to "Edit Sections / Exit Edit Mode."
3. Changed hint bar to always show (not gated on edit mode), amber color when previewing, plum when editing.

**Consequence:** Canvas now renders a full homepage. Click-to-edit affordance is visible on first load without toggling any button.

## H8.0 — First-Edition Build (Massive Build Session) — 2026-06-08

### Decision: Execute First-Edition Build Sequence

**Context:** Ordered by product owner to build the complete first-edition product: full brand workspaces, media manager, content forms, publish flow, dashboard, admin section, help center, settings, status screens, onboarding, and mobile responsiveness.

**Decisions Made:**

1. **Dashboard page.tsx corruption fixed** — File had duplicate JSX fragment appended after line 385 from a prior Windows path encoding truncation. Cleaned to 385 lines. TSC was passing due to duplicate being after the closing brace.

2. **All 4 brands seeded to 9 sections** — SMCC and E-Woman had 3 sections each. Added 6 brand-appropriate sections to each (program_card x3, event_block, text, image). DRIMP had no pages — created homepage with 9 sections via WITH INSERT. All brands now have a full visual homepage canvas.

3. **Unpublish flow added to BrandWorkspace** — Publish button was unidirectional (draft → published only). Added Unpublish button (published → draft). Uses second useTransition. Status badge updates immediately on client.

4. **Help/Support page created** — /help with FAQ covering: getting started (pages, posts, events, publishing), media/images, content status workflow, messages & payments, settings & environment, contact section. Accessible from sidebar.

5. **Help added to Sidebar** — GLOBAL_MODULES extended with /help entry.

6. **Settings page rebuilt as hub** — settings/page.tsx now shows navigation cards to sub-pages, brand registry quick view, connected services, and modules. Old Settings.tsx component remains but is no longer imported.

7. **Settings sub-pages created:**
   - /settings/account — profile (email, user ID, created date), password (explains Supabase path), session/signout
   - /settings/brands — brand selector, identity fields (read-only with rationale), technical reference, quick links
   - /settings/notifications — Telegram status, email (planned), notification events table

8. **Mobile-responsive sidebar** — Desktop: `hidden md:flex` sidebar unchanged. Mobile: fixed hamburger top bar (z-40), slide-in drawer (z-50) with backdrop dismiss, closes on route change. Topbar hidden on mobile (`hidden md:flex`). Shell layout adds `pt-14` on mobile to clear the fixed bar.

9. **Windows path encoding limitation documented** — Files inside `(shell)` and `(preview)` App Router groups cannot be reliably written via the Edit/Write tools on Windows due to parentheses in the path. All such files must be written via `python3` bash script. This is an established known risk from prior sessions.

**Consequence:** First-edition product structure is complete. TSC passes clean.

---

## P1B.7A — Delphine Real Component Rendering (2026-06-15)

### Decision: Extract Section Components from Index.tsx and Wire OsPreview to Real Components

**Context:** OsPreview.tsx was rendering using a generic block renderer (brown/gold box style, not the real Delphine purple homepage). The OS canvas iframe showed a simulated page, not the actual Delphine website appearance.

**Decision:** Extract all homepage sections from Index.tsx into named, props-capable components under `src/components/sections/`. Refactor Index.tsx to compose from these components. Update OsPreview.tsx with a brand-aware rendering function that routes Delphine section types through real components, falling back to the generic renderer for unmapped types and non-Delphine brands.

**Components Extracted:**
- HeroSection.tsx — hero with
---

## P1C — Publish Lifecycle: Immutable Snapshot Architecture (2026-06-18)

### Decision: published_version_id Pointer Pattern

**Context:** The `sections` table is mutable — editors change it in real time. Previously, `status = 'published'` meant the public API served whatever was in `sections` at query time. Any draft edit would silently alter live public content.

**Decision:** On publish, first snapshot `sections` into an immutable `page_versions` row, then set `pages.published_version_id` to that row. The public API serves `page_versions.sections`, never the live `sections` table, when `published_version_id IS NOT NULL`.

**Rollback mechanism:** Moving `pages.published_version_id` to a prior version ID constitutes a rollback. Zero section table mutations. Audit trail in `publish_history`.

**Backward compatibility:** Pages published before P1C have `published_version_id = NULL`. The public API detects this and falls back to the mutable `sections` table (legacy path). This path is logged as a known limitation.

**Consequence:** Draft edits after publish do NOT change live content until the next explicit publish action. Content and draft are now decoupled.

---


---

## P1D — Click-to-Edit Bridge (recorded retroactively 2026-06-19)

### Status: COMPLETE (implemented before P1E; documented here to close the governance gap)

**Context:** P1D was implemented in the working tree but never recorded in the
decision/change logs (a MEMORY RULE gap surfaced by the 2026-06-19 executive audit).
This entry records the actual, verified behavior.

**Decision:** Add a postMessage bridge between the OS BrandWorkspace (parent) and the
secure preview iframe (rendering plane) so the owner can click a section on the real
website canvas and edit it.

**Message contract (authoritative):**
- Parent → iframe: `PREVIEW_INIT` (handshake: origin + edit state), `EDIT_MODE`
  (toggle inline editability), `HIGHLIGHT_SECTION` (select/scroll a section).
- iframe → parent: `SECTION_CLICK` (section + field clicked), `FIELD_CHANGE`
  (debounced inline edit), `PREVIEW_READY` (handshake ack).

**Behavior:**
- Clicking a section emits `SECTION_CLICK` → auto-enables edit mode → opens the
  inspector for that section (labelled by SECTION_TYPE_LABEL).
- Inline edits in contenteditable fields emit `FIELD_CHANGE` (600ms debounce) →
  BrandWorkspace autosaves to `sections` (700ms debounce) → canvas reflects it.
- In edit mode, anchor/button clicks are guarded (preventDefault) so the iframe
  never navigates; Enter is blocked in contenteditable.
- Origin is pinned from `PREVIEW_INIT`; outbound messages target only that origin.

**Consequence:** Delphine satisfies "edit the website itself." Real components render;
edits persist; publish uses the P1C lifecycle. P1D is unchanged by P1E.

---

## P1E — Ecosystem Consolidation & Preview-Plane Generalization (2026-06-19)

### Status: COMPLETE (implementation). Human approval required before H8.

**Context:** The secure preview/edit plane was hardcoded to Delphine in three layers.
This blocked reuse and was the structural bottleneck for H8. P1E generalizes it
WITHOUT changing any brand's behavior or appearance.

**Decisions:**
1. **Brand metadata drives preview mode.** `OsBrand` gains `previewMode: "secure" | "generic"`.
   Only Delphine is "secure"; SMCC/E-Woman/DRIMP are "generic" (unchanged).
2. **Generic session creator.** `createDelphinePreviewSession()` → `createPreviewSession(brandKey, …)`.
   Gated on `previewMode === "secure"`. Delphine path is byte-identical. The old name is
   retained as a thin deprecated wrapper.
3. **Generic preview API.** `/api/preview/delphine` → `/api/preview/[brand]`. The audited
   handler (token/nonce/TTL/revocation/origin/brand-match) was moved VERBATIM into shared
   `lib/preview-api.ts`. The `delphine` static route is retained (sandbox could not delete
   it) as a thin delegate to the same handler — behaviour identical.
4. **Shared bridge contract.** `lib/preview-bridge.ts` (OS + site) centralizes the P1D
   message types. Runtime string literals unchanged.
5. **Shared adapter layer.** `src/components/sections/preview-adapters.tsx` holds the
   section-type → props mapping + switch routing + generic fallback renderer, moved verbatim
   from OsPreview. Visual components remain brand-specific and were NOT merged.
6. **Per-brand site-URL env.** `lib/preview-config.ts` resolves `<BRAND>_PUBLIC_SITE_URL`.
   `SMCC/EWOMAN/DRIMP_PUBLIC_SITE_URL` documented in `.env.example` but inert.
7. **Rendering brand from route.** `/os-preview/:brand` reads its brand param; fetches
   `/api/preview/:brand`. Defaults to delphine → identical for the existing URL.

**Verification:** root + os `tsc --noEmit` both clean. Static regression: Delphine
render/bridge/adapter logic confirmed byte-identical to pre-P1E (data-field, section
types, case routing, component invocations all match). No stale references.

**Security:** No checks weakened, removed, or relaxed. RLS, CORS, token logic untouched.

**Explicit non-goals honored:** No H8, no new brand activated, no SMCC/E-Woman/DRIMP
behavior change, no UI redesign, no CRM/email/WhatsApp/AI/payments/auth changes.

**Consequence:** The preview plane is brand-agnostic and ready for H8 (activate a brand
by building its rendering plane, setting `<BRAND>_PUBLIC_SITE_URL`, and flipping
`previewMode:"secure"`). H8 NOT started; awaits Product Owner approval.

---

## P1D.1 — Edit Bridge Hardening (2026-06-20)

### Decision: Reject motion element editability, enforce origin, clear timers

**Context:** Opus post-delivery audit found six issues in P1D: two truncated section files
(AboutSection, BooksSection), data-editable on motion elements, two timer leaks, and a
first-sender-wins security hole in the PREVIEW_INIT handler.

**Decisions:**

1. **data-editable on motion elements is wrong.** framer-motion manages its component's
   DOM lifecycle and does not guarantee stable custom attributes across re-renders.
   Editable attributes must live on inner, plain HTML leaf elements only.
   Pattern: `<motion.h1><span data-editable="true" ...>{text}</span></motion.h1>`.
   Applied to all three HeroSection editable fields (title, subtitle, body).

2. **First-sender-wins is a postMessage security hole.** If a third-party page loads in
   the iframe before the OS has a chance to send PREVIEW_INIT, it would hijack the bridge
   and receive all subsequent FIELD_CHANGE/SECTION_CLICK messages.
   Fix: pre-compute `configuredOsOrigin = new URL(OS_URL).origin` (static env var) and
   validate `e.origin === configuredOsOrigin` before processing ANY message. PREVIEW_INIT
   has an additional explicit guard. `trustedOriginRef` is now only ever set to values
   that already passed the static origin check — it can never be hijacked.

3. **Timer refs must be cleared on unmount.** React unmounts components without cancelling
   any `setTimeout` handles in refs. A 600ms FIELD_CHANGE timer or 700ms `updateSection`
   timer firing after unmount will attempt to postMessage or call a server action against
   a component that no longer exists. Both OsPreview and BrandWorkspace now clear all
   pending timer keys on useEffect cleanup.

4. **`tsc -b` / `tsc -p tsconfig.app.json --noEmit` are the authoritative gates.**
   `npx tsc --noEmit` without a project reference was masking errors in the root project.
   The real gates must be used for all future P1D.1+ deliveries.

**Consequence:** P1D.1 is production-safe for deployment pending human functional
verification. All three typecheck gates exit 0.

---

## P1D.2 — Autosave Error State + Real-Time Preview Refresh (2026-06-20)

### Decision: Explicit save state machine; bumpPreview(true) on success

**Context:** Browser verification of P1D.1 passed all functional checks. Two runtime gaps
remained: (1) a 503 cold-start response silently cleared the "Saving..." indicator as if
save succeeded; (2) inline edits were not visible in the canvas without a manual reload.

**Decisions:**

1. **`updateSection` must be wrapped in try/catch with explicit state machine.**
   Silent failure on 503 is not acceptable — the user may assume content was saved and
   navigate away. The state machine (`idle → saving → saved | failed`) ensures the UI
   accurately reflects the DB state at all times. "Save failed" persists until the user
   triggers a new attempt — it does NOT auto-clear.

2. **Preview refresh via `bumpPreview(true)` after successful save.**
   The simplest correct approach for the current architecture: force a new preview session
   with the updated `sectionsRef.current`. `onIframeLoad` already handles edit-mode
   re-initialization via the PREVIEW_INIT handshake. The trade-off (focus/cursor lost
   ~2s after user stops typing) is acceptable for this use case.
   Alternative (live DOM patch via postMessage) rejected: adds complexity to OsPreview
   and creates a divergence between what is rendered and what is in the DB snapshot.

3. **`inlineSaveClearTimer` must be cleared on unmount.**
   The "Saved ✓ → idle" transition uses a 2500ms timer. If the component unmounts while
   the timer is pending (e.g., user navigates away immediately after save), the callback
   would call `setState` on an unmounted component. Timer is cleared in useEffect cleanup.

**Consequence:** Edit title → Saving... → Saved ✓ → canvas updates automatically.
HTTP 503 → Save failed (persists). Delphine editing experience is production-ready
pending human functional verification in a deployed browser session.


---

## P1F Extended — App Router Remount Audit + Next-Action Leg Tags

**Date:** 2026-06-21

**Context:** Extended P1F spec required auditing whether Server Action failures cause
App Router remounts, and whether `Next-Action` header could be captured client-side
to distinguish which action a 503 came from.

**Decisions:**

1. **No ref-based persistence needed for BrandWorkspace/PageEditor state.**
   Audit confirmed: `updateSection`, `saveVersion`, and `createPreviewSession` do NOT
   call `revalidatePath`. `publishVersion` revalidates `/api/public` only — not the
   shell route. App Router remounts are not a failure mode for editor state.

2. **`Next-Action` header is not capturable from user-land JS.**
   React's Server Action transport sets the `Next-Action` header on outgoing fetch
   requests internally. There is no documented hook to read these headers without
   monkey-patching `globalThis.fetch`. Rejected: fragile, maintenance burden, not
   worth the benefit given that `leg` tags already identify the failure source.
   Header IS visible in browser DevTools Network tab for manual debugging.

3. **`leg` tag pattern extended to all save paths.**
   Existing `leg: "session"` from P1F preview retry loop is the correct model.
   Applied `leg: "updateSection"` and `leg: "saveVersion"` to the remaining save paths.
   All three paths now emit `[P1F] { leg, status: "attempt" | "ok" | "failed" }` entries
   that can be correlated with the DevTools Network request by timestamp.

**Consequence:** Full diagnostic traceability across all save and preview transport legs.
Any 503 in production can be attributed to the correct action via the `leg` field.


---

## P1F.1 — console.debug → console.info + Inspector Leg Coverage

**Date:** 2026-06-21

**Context:** Opus audit found that all `[P1F]` diagnostics used `console.debug`, which
is hidden by default in Chrome/Edge DevTools. Inspector save path had no leg tag.

**Decisions:**

1. **Use `console.info` for all [P1F] diagnostics.**
   `console.debug` requires "Verbose" level in Chrome DevTools. In production debugging,
   the default console filter ("Default levels") hides debug messages. `console.info` is
   visible at all default filter settings. Centralised via `logP1F()` in `diag.ts` so
   the level can be changed in one place if needed.

2. **Create `os/src/lib/diag.ts` as a thin wrapper.**
   Rationale: (a) single place to change log level; (b) inline safety documentation
   (no tokens/content/PII); (c) consistent call pattern across all legs.
   Alternative (inline `console.info` at each callsite) rejected — no single enforcement
   point for the safety rules.

3. **Tag inspector save path as `leg: "updateSection-inspector"`.**
   Separate from canvas FIELD_CHANGE `leg: "updateSection"` because the two paths have
   different debounce behaviour and error visibility. Inspector saves are synchronous and
   user-initiated (button click via SectionCard); FIELD_CHANGE saves are debounced 700ms.
   Distinguishing them in logs allows attribution of a 503 to the correct path.
   Field values (patch content) are NOT logged — only `Object.keys(patch)` for field names.

4. **verifyPublishedVersion operator-precedence bug is out of scope for P1F.1.**
   Requires separate ticket and approval. No changes to publish or verify flows here.

**Consequence:** All five diagnostic legs are now visible in default DevTools console.
Inspector saves are independently traceable. No logic changed.

---

## H8.1 — E-Woman Secure Preview Activation (2026-06-22)

### Decision: Activate E-Woman in the secure preview plane

**Context:** P1E built a brand-agnostic preview/edit plane. H8.1 activates E-Woman
by: (1) flipping `previewMode` in brands.ts, (2) building the E-Woman OsPreview consumer,
(3) routing `/os-preview/ewoman` outside Layout in App.tsx.

**Decisions:**

1. **brands.ts flip is the complete OS-side activation gate.**
   `createPreviewSession` already checks `brand.previewMode !== "secure"` and rejects
   non-secure brands. `/api/preview/[brand]` already handles any brand. Setting
   `previewMode: "secure"` for ewoman is all the OS needs. No new API routes.

2. **OsPreview does NOT use ContentProvider or Layout.**
   The preview route receives data from the OS API, not content.json. ContentProvider
   would be wasted initialization. The no-Layout pattern is established by Delphine.

3. **HeroSlider is NOT used in the section adapter.**
   HeroSlider has no props and carries analytics tracking + RegistrationCounter side-effects
   that must not fire inside the OS preview plane. A dedicated E-Woman-styled hero block
   with `data-editable` fields is implemented instead.

4. **AuthorsSection and VisionariesSection used as-is (static, wrapped with `data-section-id`).**
   These have no props and render hardcoded data. Wrapping them provides click-to-select
   without requiring prop injection. Their hardcoded data is intentional and acceptable
   for the preview plane — content edits are not expected for these sections.

5. **TestimonialSlider and CountdownTimer used with prop injection.**
   TestimonialSlider: `testimonials` prop — parsed from OS section body JSON or defaults.
   CountdownTimer: `targetDate` prop — from OS section body string.

6. **RISK-001 scope extended: brands.ts was truncated.**
   Prior RISK-001 description said truncation only affects files in parenthesized App Router
   groups. brands.ts (not in a group) was found truncated with `getOsBrand` function body
   missing. RISK-001 applies to any large file write via Edit/Write tools — not just
   (shell)/(preview) route groups.

**Consequence:** E-Woman is now in the secure preview plane. H8.2 (SMCC) and H8.3 (DRIMP)
NOT started. End-to-end function requires owner env var configuration + commit + deploy.
See RISK-013.

---

## P0.2B — Publish Integrity Hole: Remove Mutable-Draft Fallback (2026-06-22)

### Decision: All publish failure paths are hard stops — no fallback to mutable draft

**Context (Defect):** `handlePublish` contained two `updatePageMeta(status="published")`
calls in failure branches — one when `listVersions` returned empty, one when `publishVersion`
returned an error. Both made the mutable `sections` table visible to the public API via the
P1C legacy fallback path, bypassing the immutable `page_versions` snapshot. This violated
the fundamental P1C invariant: "Only a successfully published immutable page_version may
become public." Classified P0 by Opus audit.

**Decision:**

1. **All three failure branches in `handlePublish` are unconditional hard stops.**
   `setPublishError(true)` + `return`. No `setPageStatus`, no `publishedVersionId` change,
   no `bumpPreview`. The page's public state is never mutated on failure.

2. **`versions.length === 0` after a successful `saveVersion` is treated as a hard failure.**
   Previously this was treated as a recoverable edge case by falling through to `updatePageMeta`.
   Rationale: if `saveVersion` returned ok but `listVersions` is empty, something is
   structurally wrong with the DB state. A mutable publish would be worse than no publish.

3. **`publishError` state does NOT auto-clear.**
   The user must see "Publish failed" and explicitly retry. Auto-clearing would hide the
   fact that a publish attempt failed, which is unacceptable for content integrity.

4. **`publishSucceeded` state auto-clears after 3 s.**
   Brief "Published ✓" label before the Unpublish button appears. Does not affect integrity.

5. **`updatePageMeta` import retained** — it is still used for `unpublishPage` and other
   callers. Only the two erroneous calls inside `handlePublish` failure branches were removed.

**Consequence:** The P1C invariant is now enforced at the UI layer. A failed publish
attempt leaves page status, publishedVersionId, and the live public route completely
unchanged. The user sees "Publish failed" and must retry.

