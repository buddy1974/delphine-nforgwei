"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PostRow, PostPatch } from "@/lib/db/posts";
import type { PageStatus } from "@/lib/db/pages";
import { notify } from "@/lib/notify";

const POST_COLS =
  "id, brand_key, slug, title, excerpt, body, featured_image_url, author, category, tags, status, published_at, updated_at";

export async function listPosts(brandKey: string): Promise<PostRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("posts")
    .select(POST_COLS)
    .eq("brand_key", brandKey)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PostRow[];
}

export async function getPost(id: string): Promise<PostRow | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("posts").select(POST_COLS).eq("id", id).single();
  return (data as PostRow) ?? null;
}

export async function createPost(
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
    .from("posts")
    .insert({ brand_key: brandKey, title: title.trim(), slug: cleanSlug, status: "draft" })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A post with that slug already exists." };
    return { error: error.message };
  }
  revalidatePath("/blog");
  return { id: data!.id as string };
}

/** Autosave: patch editable fields. */
export async function updatePost(
  id: string,
  patch: PostPatch
): Promise<{ ok: true } | { error: string }> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("posts").update(patch).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

/** Status workflow. Sets published_at on first publish. */
export async function setPostStatus(id: string, status: PageStatus): Promise<void> {
  const db = createSupabaseAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === "published") {
    const { data } = await db.from("posts").select("published_at").eq("id", id).single();
    if (!data?.published_at) patch.published_at = new Date().toISOString();
  }
  const { error } = await db.from("posts").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  if (status === "published") {
    const { data: p } = await db.from("posts").select("brand_key, slug, title").eq("id", id).single();
    if (p) await notify("post_published", p.brand_key as string, [`📰 ${p.title}`, `/blog/${p.slug}`], `/blog/${id}`);
  }
  revalidatePath("/blog");
}

export async function deletePost(id: string): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/blog");
}
