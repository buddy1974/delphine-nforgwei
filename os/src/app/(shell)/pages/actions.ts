"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  type PageRow,
  type SectionRow,
  type SectionPatch,
  type SectionType,
  type PageStatus,
} from "@/lib/db/pages";

const SECTION_COLS =
  "id, page_id, type, title, subtitle, body, image_url, button_label, button_url, order";

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

/** Autosave: patch one section's editable fields. */
export async function updateSection(
  sectionId: string,
  patch: SectionPatch
): Promise<{ ok: true } | { error: string }> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("sections").update(patch).eq("id", sectionId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteSection(sectionId: string): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("sections").delete().eq("id", sectionId);
  if (error) throw new Error(error.message);
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

  // Shift all sections with order > src.order down by 1 to make room
  const { data: later } = await db
    .from("sections")
    .select("id, order")
    .eq("page_id", pageId)
    .gt("order", (src as SectionRow).order);

  if (later && later.length > 0) {
    await Promise.all(
      later.map((s: { id: string; order: number }) =>
        db.from("sections").update({ order: s.order + 1 }).eq("id", s.id)
      )
    );
  }

  // Insert the duplicate immediately after the source
  const { data: created, error: insErr } = await db
    .from("sections")
    .insert({
      page_id: pageId,
      type: (src as SectionRow).type,
      title: (src as SectionRow).title,
      subtitle: (src as SectionRow).subtitle,
      body: (src as SectionRow).body,
      image_url: (src as SectionRow).image_url,
      button_label: (src as SectionRow).button_label,
      button_url: (src as SectionRow).button_url,
      order: (src as SectionRow).order + 1,
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

/** Save a snapshot of the current page state. */
export async function saveVersion(
  pageId: string,
  title: string,
  sections: SectionRow[],
  label?: string
): Promise<void> {
  const db = createSupabaseAdminClient();
  const { data: page } = await db
    .from("pages")
    .select("status")
    .eq("id", pageId)
    .single();

  await db.from("page_versions").insert({
    page_id: pageId,
    title,
    status: page?.status ?? "draft",
    sections: JSON.parse(JSON.stringify(sections)),
    label: label ?? null,
  });
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

  // Re-insert from snapshot
  if (snapshotSections.length > 0) {
    const inserts = snapshotSections.map((s, i) => ({
      page_id: pageId,
      type: s.type,
      title: s.title,
      subtitle: s.subtitle,
      body: s.body,
      image_url: s.image_url,
      button_label: s.button_label,
      button_url: s.button_url,
      order: i,
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
