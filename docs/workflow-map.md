# Workflow Map — Delphine Ecosystem OS

## Edit the Delphine website (website-first)
1. Owner signs in to the OS, clicks **Delphine** → BrandWorkspace loads.
2. The canvas iframe loads the real public site via a secure preview session
   (`createPreviewSession("delphine", …)` → token → `/os-preview/delphine`).
3. Owner clicks any section on the canvas → `SECTION_CLICK` → edit mode on →
   inspector opens with that section's fields.
4. Owner edits inline (canvas) or via inspector → `FIELD_CHANGE` / inspector save
   → debounced autosave to `sections` → canvas refreshes.
5. **Save Draft** snapshots a `page_versions` row (History).
6. **Publish**: snapshot → `publishVersion` sets `published_version_id` →
   2s revalidation wait → `verifyPublishedVersion` checks the live API
   (`confirmed` / `stale` / `failed`).
7. **Unpublish** reverts the page to draft. **Rollback** (History) re-publishes a
   prior version by moving the pointer.

## Publish content to a brand site (all brands)
OS Pages/Blog/Events editor → draft → published → OS public API
(`/api/public/<brand>/…`) → the brand site renders at `/p/<slug>`, `/blog`,
`/events|/os-events`.

## Non-secure brands (SMCC / E-Woman / DRIMP) today
BrandWorkspace canvas uses the OS-internal generic block preview
(`/pages/<id>/preview`). Editing writes to `sections`; publishing uses the same
P1C lifecycle. They do not yet have the real-component secure preview (that is H8).
