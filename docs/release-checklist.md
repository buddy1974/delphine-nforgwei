# Release Checklist — delphine.nforgwei

## Before any release
- [ ] `npx tsc --noEmit` clean at root AND in `os/`.
- [ ] Vercel preview build green for both projects (OS + site).
- [ ] No secrets committed; `.env.local` gitignored; required env set in Vercel.
- [ ] Migrations are additive and applied to `mohogdfdzmewwvgcizga`.
- [ ] Product Owner approval recorded (no AI self-approval).

## Delphine edit-the-website regression smoke test (run on a Vercel preview)
- [ ] Open OS → Delphine → canvas renders the REAL purple homepage (Navbar, Hero, photo).
- [ ] Click Hero → edit mode turns on; inspector opens showing "Hero Section".
- [ ] Click About → inspector switches to About; section highlights on canvas.
- [ ] Edit a field inline on the canvas → autosave fires → change persists on reload.
- [ ] Edit a field via the inspector → Save → canvas refreshes.
- [ ] Save Draft → a new version appears in History.
- [ ] Publish → status flips to published; verification shows "Live OK".
- [ ] Public site shows the published content.
- [ ] Rollback to a prior version (History) → public site reflects it; sections unchanged.
- [ ] Unpublish → page returns to draft.
- [ ] Invalid/expired token on `/os-preview/delphine` → "Preview unavailable".
- [ ] Buttons/links in the canvas do NOT navigate the iframe in edit mode.

## Preview-plane generalization checks (P1E)
- [ ] `/api/preview/delphine` still returns 200 for a valid Delphine token.
- [ ] `/api/preview/<other-brand>` returns 403 (previewMode not "secure").
- [ ] Non-secure brand workspaces still use the generic OS-internal preview.
