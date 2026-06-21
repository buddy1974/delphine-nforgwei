"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  type PageRow,
  type SectionRow,
  type SectionPatch,
  type SectionType,
  type PageStatus,
  type RowLayout,
} from "@/lib/db/pages";

const SECTION_COLS =
  "id, page_id, type, title, subtitle, body, image_url, button_label, button_url, order, parent_id, col, layout";

/** All pages for a brand, newest first. */
export async function listPages(brandKey: string): Promise<PageRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("pages")
    .select("id, brand_key, slug, title, status, updated_at")
    .eq("brand_key", brandKey)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PageRow[];
}

/** One page plus its ordered sections. */
export async function getPage(
  pageId: string
): Promise<{ page: PageRow; sections: SectionRow[] } | null> {
  const db = createSupabaseAdminClient();
  const { data: page } = await db
    .from("pages")
    .select("id, brand_key, slug, title, status, updated_at")
    .eq("id", pageId)
    .single();
  if (!page) return null;

  const { data: sections, error } = await db
    .from("sections")
    .select(SECTION_COLS)
    .eq("page_id", pageId)
    .order("order", { ascending: true });
  if (error) throw new Error(error.message);

  return { page: page as PageRow, sections: (sections ?? []) as SectionRow[] };
}

/** Create a blank page for a brand. Returns the new id. */
export async function createPage(
  brandKey: string,
  title: string,
  slug: string
): Promise<{ id: string } | { error: string }> {
  const cleanSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!title.trim() || !cleanSlug) return { error: "Title and slug are required." };

  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("pages")
    .insert({ brand_key: brandKey, title: title.trim(), slug: cleanSlug, status: "draft" })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A page with that slug already exists." };
    return { error: error.message };
  }
  revalidatePath("/pages");
  return { id: data!.id as string };
}

/** Update page title and/or status. */
export async function updatePageMeta(
  pageId: string,
  patch: { title?: string; status?: PageStatus }
): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("pages").update(patch).eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath("/pages");
  revalidatePath(`/pages/${pageId}`);
}

/** Append a new section of a given type to a page. Returns the new section. */
export async function addSection(
  pageId: string,
  type: SectionType
): Promise<SectionRow> {
  const db = createSupabaseAdminClient();
  const { data: last } = await db
    .from("sections")
    .select("order")
    .eq("page_id", pageId)
    .order("order", { ascending: false })
    .limit(1)
    .single();
  const nextOrder = (last?.order ?? -1) + 1;

  const { data, error } = await db
    .from("sections")
    .insert({ page_id: pageId, type, order: nextOrder })
    .select(SECTION_COLS)
    .single();
  if (error) throw new Error(error.message);
  return data as SectionRow;
}

/** Autosave: patch one section's editable fields.
 * P1D.9: .select("id") verifies the row was actually updated.
 * A zero-row result means the section does not exist (phantom write prevented).
 */
export async function updateSection(
  sectionId: string,
  patch: SectionPatch
): Promise<{ ok: true } | { error: string }> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("sections")
    .update(patch)
    .eq("id", sectionId)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "No row updated — section may not exist." };
  return { ok: true };
}

export async function deleteSection(sectionId: string): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("sections").delete().eq("id", sectionId);
  if (error) throw new Error(error.message);
}

// ── H6B.2: Row / layout management ──────────────────────────────

/** Return fresh sections list for a page (used after structural moves). */
async function freshSections(pageId: string, db: ReturnType<typeof createSupabaseAdminClient>): Promise<SectionRow[]> {
  const { data } = await db.from("sections").select(SECTION_COLS).eq("page_id", pageId).order("order", { ascending: true });
  return (data ?? []) as SectionRow[];
}

/** Create a new empty row container at the end of the page. */
export async function createRow(pageId: string, layout: RowLayout): Promise<SectionRow> {
  const db = createSupabaseAdminClient();
  const { data: last } = await db
    .from("sections").select("order").eq("page_id", pageId).is("parent_id", null)
    .order("order", { ascending: false }).limit(1);
  const nextOrder = ((last?.[0] as { order: number } | undefined)?.order ?? -1) + 1;
  const { data, error } = await db
    .from("sections")
    .insert({ page_id: pageId, type: "row", layout, order: nextOrder })
    .select(SECTION_COLS).single();
  if (error) throw new Error(error.message);
  revalidatePath("/pages");
  return data as SectionRow;
}

/** Change the layout of an existing row. */
export async function updateRowLayout(rowId: string, layout: RowLayout): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("sections").update({ layout }).eq("id", rowId);
  if (error) throw new Error(error.message);
}

/** Duplicate a row and all its children, inserting immediately below. */
export async function duplicateRow(
  rowId: string,
  pageId: string
): Promise<{ row: SectionRow; children: SectionRow[] }> {
  const db = createSupabaseAdminClient();

  const { data: src } = await db.from("sections").select(SECTION_COLS).eq("id", rowId).single();
  if (!src) throw new Error("Row not found.");

  const { data: kids } = await db.from("sections").select(SECTION_COLS)
    .eq("parent_id", rowId).order("order", { ascending: true });

  // Shift sections below the source row
  const srcOrder = (src as SectionRow).order;
  const { data: below } = await db.from("sections").select("id, order")
    .eq("page_id", pageId).is("parent_id", null).gt("order", srcOrder);
  if (below && below.length > 0) {
    await Promise.all(below.map((s: { id: string; order: number }) =>
      db.from("sections").update({ order: s.order + 1 }).eq("id", s.id)
    ));
  }

  // Insert duplicate row
  const { data: newRow, error: rowErr } = await db.from("sections")
    .insert({ page_id: pageId, type: "row", layout: (src as SectionRow).layout, order: srcOrder + 1 })
    .select(SECTION_COLS).single();
  if (rowErr || !newRow) throw new Error(rowErr?.message ?? "Row insert failed.");

  // Copy children
  const childRows = (kids ?? []) as SectionRow[];
  const newChildren: SectionRow[] = [];
  if (childRows.length > 0) {
    const { data: inserted } = await db.from("sections")
      .insert(childRows.map(c => ({
        page_id: pageId, type: c.type, title: c.title, subtitle: c.subtitle,
        body: c.body, image_url: c.image_url, button_label: c.button_label,
        button_url: c.button_url, order: c.order, col: c.col,
        parent_id: (newRow as SectionRow).id,
      })))
      .select(SECTION_COLS);
    newChildren.push(...((inserted ?? []) as SectionRow[]));
  }

  revalidatePath("/pages");
  return { row: newRow as SectionRow, children: newChildren };
}

/** Move a section into a specific slot in a row. Returns refreshed section list. */
export async function moveToSlot(
  sectionId: string,
  rowId: string,
  col: number
): Promise<SectionRow[]> {
  const db = createSupabaseAdminClient();
  const { data: sec } = await db.from("sections").select("page_id, parent_id, order")
    .eq("id", sectionId).single();
  if (!sec) throw new Error("Section not found.");
  const pageId = (sec as { page_id: string }).page_id;

  // Find next order in target slot
  const { data: slotKids } = await db.from("sections").select("order")
    .eq("parent_id", rowId).eq("col", col).order("order", { ascending: false }).limit(1);
  const slotOrder = ((slotKids?.[0] as { order: number } | undefined)?.order ?? -1) + 1;

  await db.from("sections").update({ parent_id: rowId, col, order: slotOrder }).eq("id", sectionId);

  // Compact root if section was at root
  if (!(sec as SectionRow).parent_id) {
    const { data: rootSecs } = await db.from("sections").select("id, order")
      .eq("page_id", pageId).is("parent_id", null).order("order", { ascending: true });
    if (rootSecs && rootSecs.length > 0) {
      await Promise.all((rootSecs as { id: string; order: number }[]).map((s, i) =>
        db.from("sections").update({ order: i }).eq("id", s.id)
      ));
    }
  }
  revalidatePath("/pages");
  return freshSections(pageId, db);
}

/** Move a section from a slot back to root level (appended at end). Returns refreshed list. */
export async function moveToRoot(sectionId: string, pageId: string): Promise<SectionRow[]> {
  const db = createSupabaseAdminClient();
  const { data: rootSecs } = await db.from("sections").select("order")
    .eq("page_id", pageId).is("parent_id", null).order("order", { ascending: false }).limit(1);
  const nextOrder = ((rootSecs?.[0] as { order: number } | undefined)?.order ?? -1) + 1;
  await db.from("sections").update({ parent_id: null, col: null, order: nextOrder }).eq("id", sectionId);
  revalidatePath("/pages");
  return freshSections(pageId, db);
}

/** Batch-update col + order for slot children (within-row reorder). */
export async function reorderRowChildren(
  updates: { id: string; col: number; order: number }[]
): Promise<void> {
  const db = createSupabaseAdminClient();
  await Promise.all(updates.map(({ id, col, order }) =>
    db.from("sections").update({ col, order }).eq("id", id)
  ));
}

/** All pages across every brand, alphabetical by title per brand. */
export async function listAllPages(): Promise<PageRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("pages")
    .select("id, brand_key, slug, title, status, updated_at")
    .order("brand_key", { ascending: true })
    .order("title",     { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PageRow[];
}

/** Duplicate a page (copies all sections). Returns new page id. */
export async function duplicatePage(
  pageId: string
): Promise<{ id: string } | { error: string }> {
  const db = createSupabaseAdminClient();

  const { data: src } = await db
    .from("pages")
    .select("brand_key, slug, title")
    .eq("id", pageId)
    .single();
  if (!src) return { error: "Page not found." };

  // Try slug variations until one is unique
  let attempt = 0;
  let newPageId: string | null = null;
  while (attempt < 6) {
    const slug =
      attempt === 0
        ? `${src.slug}-copy`
        : `${src.slug}-copy-${attempt + 1}`;
    const { data, error } = await db
      .from("pages")
      .insert({ brand_key: src.brand_key, title: `${src.title} (Copy)`, slug, status: "draft" })
      .select("id")
      .single();
    if (!error && data) { newPageId = data.id as string; break; }
    if (error?.code !== "23505") return { error: error!.message };
    attempt++;
  }
  if (!newPageId) return { error: "Could not generate a unique slug for the duplicate." };

  // Copy sections
  const { data: sections } = await db
    .from("sections")
    .select(SECTION_COLS)
    .eq("page_id", pageId)
    .order("order", { ascending: true });

  if (sections && sections.length > 0) {
    const rows = sections as SectionRow[];
    await db.from("sections").insert(
      rows.map((s) => ({
        page_id: newPageId,
        type: s.type,
        title: s.title,
        subtitle: s.subtitle,
        body: s.body,
        image_url: s.image_url,
        button_label: s.button_label,
        button_url: s.button_url,
        order: s.order,
      }))
    );
  }

  revalidatePath("/pages");
  return { id: newPageId };
}

/** Delete a page and its sections (cascade). */
export async function deletePage(pageId: string): Promise<void> {
  const db = createSupabaseAdminClient();
  await db.from("pages").delete().eq("id", pageId);
  revalidatePath("/pages");
}

/** Clone a section and insert it immediately below the original. */
export async function duplicateSection(
  sourceSectionId: string,
  pageId: string
): Promise<SectionRow> {
  const db = createSupabaseAdminClient();

  // Load source section
  const { data: src, error: srcErr } = await db
    .from("sections")
    .select(SECTION_COLS)
    .eq("id", sourceSectionId)
    .single();
  if (srcErr || !src) throw new Error("Section not found.");

  const source = src as SectionRow;

  // Scope order-shift to siblings only — never cross container boundaries.
  // Slot sections: shift only siblings in the same slot (same parent_id + col).
  // Root sections: shift only other root sections (parent_id IS NULL).
  const { data: later } = source.parent_id
    ? await db.from("sections").select("id, order")
        .eq("parent_id", source.parent_id)
        .eq("col", source.col ?? 0)
        .gt("order", source.order)
    : await db.from("sections").select("id, order")
        .eq("page_id", pageId)
        .is("parent_id", null)
        .gt("order", source.order);

  if (later && later.length > 0) {
    await Promise.all(
      later.map((s: { id: string; order: number }) =>
        db.from("sections").update({ order: s.order + 1 }).eq("id", s.id)
      )
    );
  }

  // Insert duplicate — preserve parent_id and col so copy lands in the same container
  const { data: created, error: insErr } = await db
    .from("sections")
    .insert({
      page_id: pageId,
      type: source.type,
      title: source.title,
      subtitle: source.subtitle,
      body: source.body,
      image_url: source.image_url,
      button_label: source.button_label,
      button_url: source.button_url,
      order: source.order + 1,
      parent_id: source.parent_id ?? null, // stay in same row slot
      col: source.col ?? null,             // stay in same column
    })
    .select(SECTION_COLS)
    .single();

  if (insErr || !created) throw new Error(insErr?.message ?? "Insert failed.");
  revalidatePath(`/pages`);
  return created as SectionRow;
}

/** Update order values for multiple sections at once. Used by drag-drop reorder. */
export async function batchReorderSections(
  updates: { id: string; order: number }[]
): Promise<void> {
  const db = createSupabaseAdminClient();
  await Promise.all(
    updates.map(({ id, order }) =>
      db.from("sections").update({ order }).eq("id", id)
    )
  );
}

/** Swap order of two sections (move up/down). */
export async function reorderSections(
  a: { id: string; order: number },
  b: { id: string; order: number }
): Promise<void> {
  const db = createSupabaseAdminClient();
  await db.from("sections").update({ order: b.order }).eq("id", a.id);
  await db.from("sections").update({ order: a.order }).eq("id", b.id);
}

// ── Version History ──────────────────────────────────────────

export interface VersionRow {
  id: string;
  page_id: string;
  label: string | null;
  title: string;
  status: string;
  sections: unknown;
  created_at: string;
}

/** Save a snapshot of the current page state.
 * P1D.9: Now returns { ok: true } | { error: string } — never swallows DB errors.
 */
export async function saveVersion(
  pageId: string,
  title: string,
  sections: SectionRow[],
  label?: string
): Promise<{ ok: true } | { error: string }> {
  const db = createSupabaseAdminClient();
  const { data: page } = await db
    .from("pages")
    .select("status")
    .eq("id", pageId)
    .single();

  const { error } = await db.from("page_versions").insert({
    page_id: pageId,
    title,
    status: page?.status ?? "draft",
    sections: JSON.parse(JSON.stringify(sections)),
    label: label ?? null,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

/** List all versions for a page, newest first. */
export async function listVersions(pageId: string): Promise<VersionRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("page_versions")
    .select("id, page_id, label, title, status, sections, created_at")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return (data ?? []) as VersionRow[];
}

/** Restore a version: replaces all sections of the page with the snapshot. */
export async function restoreVersion(
  versionId: string,
  pageId: string
): Promise<SectionRow[]> {
  const db = createSupabaseAdminClient();

  // Load snapshot
  const { data: version, error } = await db
    .from("page_versions")
    .select("sections, title, status")
    .eq("id", versionId)
    .single();
  if (error || !version) throw new Error("Version not found.");

  const snapshotSections = version.sections as SectionRow[];

  // Delete existing sections
  await db.from("sections").delete().eq("page_id", pageId);

  // Re-insert from snapshot.
  // Sort rows (parent_id=null) before children so the FK constraint is satisfied on insert.
  // Preserve original UUIDs so parent_id references remain valid after re-insert.
  if (snapshotSections.length > 0) {
    const sorted = [...snapshotSections].sort((a, b) => {
      if (!a.parent_id && b.parent_id) return -1; // rows first
      if (a.parent_id && !b.parent_id) return 1;  // children after
      return 0;
    });
    const inserts = sorted.map((s) => ({
      id: s.id,                       // preserve UUID → parent_id refs stay valid
      page_id: pageId,
      type: s.type,
      title: s.title,
      subtitle: s.subtitle,
      body: s.body,
      image_url: s.image_url,
      button_label: s.button_label,
      button_url: s.button_url,
      order: s.order,                 // preserve original per-context order
      parent_id: s.parent_id ?? null, // preserve row hierarchy
      col: s.col ?? null,             // preserve column assignment
      layout: s.layout ?? null,       // preserve row layout
    }));
    await db.from("sections").insert(inserts);
  }

  // Return fresh sections from DB
  const { data: fresh } = await db
    .from("sections")
    .select(SECTION_COLS)
    .eq("page_id", pageId)
    .order("order", { ascending: true });

  revalidatePath(`/pages/${pageId}`);
  return (fresh ?? []) as SectionRow[];
}

// ── P1C: Publish Lifecycle ──────────────────────────────────────────────────

export interface PublishHistoryRow {
  id: string;
  page_id: string;
  version_id: string;
  action: "publish" | "rollback" | "unpublish";
  triggered_by: string | null;
  created_at: string;
}

/**
 * Publish an exact page_versions snapshot.
 * Sets pages.published_version_id, pages.status='published',
 * inserts a publish_history row, and revalidates the public API cache.
 *
 * PRINCIPLE: Approve exact revision, never mutable draft.
 */
export async function publishVersion(
  pageId: string,
  versionId: string,
  triggeredBy?: string
): Promise<{ ok: true; publishedVersionId: string } | { error: string }> {
  const db = createSupabaseAdminClient();

  // Verify the version belongs to this page
  const { data: version, error: verErr } = await db
    .from("page_versions")
    .select("id, page_id, status")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .single();

  if (verErr || !version) return { error: "Version not found for this page." };

  // Set published pointer and status atomically
  const { error: updateErr } = await db
    .from("pages")
    .update({
      published_version_id: versionId,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (updateErr) return { error: updateErr.message };

  // Audit log
  await db.from("publish_history").insert({
    page_id: pageId,
    version_id: versionId,
    action: "publish",
    triggered_by: triggeredBy ?? null,
  });

  // Revalidate OS Next.js cache for all public API paths
  revalidatePath("/api/public", "layout");

  return { ok: true, publishedVersionId: versionId };
}

/**
 * Roll back to a previous published snapshot.
 * Only moves pages.published_version_id — NEVER touches the sections table.
 * Draft state is completely untouched.
 */
export async function rollbackToVersion(
  pageId: string,
  versionId: string,
  triggeredBy?: string
): Promise<{ ok: true; publishedVersionId: string } | { error: string }> {
  const db = createSupabaseAdminClient();

  // Verify the version belongs to this page
  const { data: version, error: verErr } = await db
    .from("page_versions")
    .select("id, page_id")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .single();

  if (verErr || !version) return { error: "Version not found for this page." };

  // Move the published pointer — sections table is NOT touched
  const { error: updateErr } = await db
    .from("pages")
    .update({
      published_version_id: versionId,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (updateErr) return { error: updateErr.message };

  // Audit log
  await db.from("publish_history").insert({
    page_id: pageId,
    version_id: versionId,
    action: "rollback",
    triggered_by: triggeredBy ?? null,
  });

  // Revalidate OS Next.js cache
  revalidatePath("/api/public", "layout");

  return { ok: true, publishedVersionId: versionId };
}

/**
 * Unpublish a page — clears published_version_id and sets status back to draft.
 * Inserts an unpublish record into publish_history.
 */
export async function unpublishPage(
  pageId: string,
  triggeredBy?: string
): Promise<void> {
  const db = createSupabaseAdminClient();

  // Get current published_version_id for the audit row
  const { data: page } = await db
    .from("pages")
    .select("published_version_id")
    .eq("id", pageId)
    .single();

  await db
    .from("pages")
    .update({
      published_version_id: null,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (page?.published_version_id) {
    await db.from("publish_history").insert({
      page_id: pageId,
      version_id: page.published_version_id,
      action: "unpublish",
      triggered_by: triggeredBy ?? null,
    });
  }

  revalidatePath("/api/public", "layout");
}

/**
 * Verify that the public API is serving the expected published version.
 * Calls the OS public API internally and compares publishedVersionId.
 *
 * Returns:
 *   { verified: true }  — live content matches expectedVersionId
 *   { verified: false, liveVersionId } — mismatch or stale cache
 *   { error }           — API call failed
 */
export async function verifyPublishedVersion(
  brand: string,
  slug: string,
  expectedVersionId: string
): Promise<
  | { verified: true }
  | { verified: false; liveVersionId: string | null }
  | { error: string }
> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3100";
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/os";
    const url = `${baseUrl}${basePath}/api/public/${brand}/${slug}?_v=${Date.now()}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { error: `Public API returned ${res.status}` };

    const data = (await res.json()) as { publishedVersionId?: string | null };
    const liveVersionId = data.publishedVersionId ?? null;

    if (liveVersionId === expectedVersionId) return { verified: true };
    return { verified: false, liveVersionId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Verification fetch failed." };
  }
}

/** List publish history for a page, newest first. */
export async function listPublishHistory(pageId: string): Promise<PublishHistoryRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("publish_history")
    .select("id, page_id, version_id, action, triggered_by, created_at")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data ?? []) as PublishHistoryRow[];
}
