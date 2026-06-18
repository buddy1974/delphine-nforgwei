-- ============================================================
-- P1C — Publish Lifecycle: Approve → Publish → Rollback
-- Applied to project mohogdfdzmewwvgcizga
-- Additive only. No destructive changes.
-- ============================================================

-- 1. Pin the published snapshot on each page.
--    NULL = page has never been published through the P1C flow
--    (backward compat: legacy published pages keep status='published'
--    and fall back to the mutable sections table in the public API).
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS published_version_id uuid
    REFERENCES public.page_versions(id) ON DELETE SET NULL;

-- Index for the public API join: pages → page_versions
CREATE INDEX IF NOT EXISTS pages_published_version_id
  ON public.pages (published_version_id)
  WHERE published_version_id IS NOT NULL;

-- 2. Approval metadata on page_versions.
--    Set when a version is explicitly approved before publishing.
ALTER TABLE public.page_versions
  ADD COLUMN IF NOT EXISTS approved_by text NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz NULL;

-- 3. Publish history — append-only audit log.
--    Records every publish, rollback, and unpublish event.
--    Never updated after insert.
CREATE TABLE IF NOT EXISTS public.publish_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id       uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  version_id    uuid NOT NULL REFERENCES public.page_versions(id) ON DELETE CASCADE,
  action        text NOT NULL CHECK (action IN ('publish', 'rollback', 'unpublish')),
  triggered_by  text NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS publish_history_page_id_created
  ON public.publish_history (page_id, created_at DESC);

ALTER TABLE public.publish_history ENABLE ROW LEVEL SECURITY;
