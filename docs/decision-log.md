# Decision Log

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
- HeroSection.tsx — hero with portrait, blobs, motion animations
- AboutSection.tsx — two-column about preview with photo
- ProgramsSection.tsx — services/programs card grid with CTA
- BooksSection.tsx — stats row + book covers + link
- EventsSection.tsx — speaking/media gallery grid
- GallerySection.tsx — authority strip photo grid
- ContactSection.tsx — closing CTA over hero-bg
- TransformationSection.tsx — 3-card framework (Identity/Family/Leadership)
- EcosystemSection.tsx — SMCC + E-Woman platform cards
- TestimonialsSection.tsx — 3-card testimonial grid
- index.ts — barrel export for all sections

**Props pattern:** All props optional with hardcoded defaults matching current content. Public homepage passes no props → identical output. OS preview passes section data → same components render dynamic content.

**Consequence:** Index.tsx reduced from ~670 lines to 65 lines of composition. Public homepage is visually identical. OsPreview Delphine path now renders real purple Delphine components. Generic renderer preserved as fallback. Security unchanged.
