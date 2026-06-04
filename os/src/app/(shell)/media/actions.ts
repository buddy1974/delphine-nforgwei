"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface MediaRow {
  id: string;
  brand_key: string;
  url: string;
  alt: string | null;
  created_at: string;
}

export async function listMedia(brandKey: string): Promise<MediaRow[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("media")
    .select("id, brand_key, url, alt, created_at")
    .eq("brand_key", brandKey)
    .order("created_at", { ascending: false });
  return (data ?? []) as MediaRow[];
}

/** All media across every brand — used by the Shared Assets tab in MediaPicker. */
export async function listAllMedia(): Promise<MediaRow[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("media")
    .select("id, brand_key, url, alt, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as MediaRow[];
}

/**
 * Upload a file to Supabase Storage and record it in the media table.
 * Accepts FormData so it works as a server action called from a client component.
 */
export async function uploadMediaFile(
  formData: FormData
): Promise<{ ok: true; row: MediaRow } | { error: string }> {
  const file = formData.get("file");
  const brandKey = formData.get("brandKey") as string | null;
  const altRaw = (formData.get("alt") as string | null) ?? "";

  if (!file || !(file instanceof File)) return { error: "No file selected." };
  if (!brandKey) return { error: "Brand key missing." };
  if (file.size === 0) return { error: "File is empty." };
  if (!file.type.startsWith("image/")) return { error: "Only image files are supported." };
  if (file.size > 10 * 1024 * 1024) return { error: "File too large — maximum 10 MB." };

  const db = createSupabaseAdminClient();

  // Build a safe storage path: brand/timestamp-filename
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .replace(/_+/g, "_");
  const path = `${brandKey}/${Date.now()}-${safeName}`;

  // Convert File → Uint8Array (safe in Next.js server action runtime)
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: storageErr } = await db.storage
    .from("media")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (storageErr) return { error: storageErr.message };

  // Public URL for the uploaded file
  const {
    data: { publicUrl },
  } = db.storage.from("media").getPublicUrl(path);

  // Alt text: supplied value, or filename without extension
  const alt =
    altRaw.trim() ||
    file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") ||
    null;

  const { data: row, error: dbErr } = await db
    .from("media")
    .insert({ brand_key: brandKey, url: publicUrl, storage: "supabase", alt })
    .select("id, brand_key, url, alt, created_at")
    .single();

  if (dbErr) {
    // Roll back the storage upload if the DB insert fails
    await db.storage.from("media").remove([path]);
    return { error: dbErr.message };
  }

  revalidatePath("/media");
  return { ok: true, row: row as MediaRow };
}

/** Register an external image by URL (kept for backward compatibility). */
export async function addMedia(
  brandKey: string,
  url: string,
  alt: string
): Promise<{ ok: true } | { error: string }> {
  if (!/^https?:\/\/|^\//.test(url.trim())) {
    return { error: "Enter a valid image URL (https://… or /path)." };
  }
  const db = createSupabaseAdminClient();
  const { error } = await db.from("media").insert({
    brand_key: brandKey,
    url: url.trim(),
    alt: alt.trim() || null,
    storage: url.trim().startsWith("/") ? "public_folder" : "external",
  });
  if (error) return { error: error.message };
  revalidatePath("/media");
  return { ok: true };
}

/**
 * Delete a media record and, if stored in Supabase Storage, the file itself.
 */
export async function deleteMedia(id: string): Promise<void> {
  const db = createSupabaseAdminClient();

  // Fetch storage type + URL before deleting the row
  const { data: item } = await db
    .from("media")
    .select("url, storage")
    .eq("id", id)
    .single();

  // Remove the file from Supabase Storage when applicable
  if (item?.storage === "supabase" && item.url) {
    const MARKER = "/storage/v1/object/public/media/";
    const idx = (item.url as string).indexOf(MARKER);
    if (idx !== -1) {
      const storagePath = (item.url as string).slice(idx + MARKER.length);
      await db.storage.from("media").remove([storagePath]);
    }
  }

  await db.from("media").delete().eq("id", id);
  revalidatePath("/media");
}
