"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EventRow, EventPatch } from "@/lib/db/events";
import type { PageStatus } from "@/lib/db/pages";
import { notify } from "@/lib/notify";

const EVENT_COLS =
  "id, brand_key, slug, title, description, event_date, start_time, location, price_xaf, payunit_url, whatsapp_cta, facebook_embed_url, featured_image_url, registration_status, status, updated_at";

export async function listEvents(brandKey: string): Promise<EventRow[]> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("os_events")
    .select(EVENT_COLS)
    .eq("brand_key", brandKey)
    .order("event_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("os_events").select(EVENT_COLS).eq("id", id).single();
  return (data as EventRow) ?? null;
}

export async function createEvent(
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
    .from("os_events")
    .insert({ brand_key: brandKey, title: title.trim(), slug: cleanSlug, status: "draft" })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "An event with that slug already exists." };
    return { error: error.message };
  }
  revalidatePath("/events");
  return { id: data!.id as string };
}

/** Autosave editable fields. Empty strings → null; price coerced to integer. */
export async function updateEvent(
  id: string,
  patch: EventPatch
): Promise<{ ok: true } | { error: string }> {
  const clean: Record<string, unknown> = { ...patch };
  for (const k of Object.keys(clean)) {
    if (clean[k] === "") clean[k] = null;
  }
  if (typeof patch.price_xaf !== "undefined") {
    const n = Number(patch.price_xaf);
    clean.price_xaf = Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
  }
  const db = createSupabaseAdminClient();
  const { error } = await db.from("os_events").update(clean).eq("id", id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function setEventStatus(id: string, status: PageStatus): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("os_events").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  if (status === "published") {
    const { data: e } = await db.from("os_events").select("brand_key, slug, title, event_date").eq("id", id).single();
    if (e) await notify("event_published", e.brand_key as string, [`📅 ${e.title}`, e.event_date ? `🗓 ${e.event_date}` : "", `/events/${e.slug}`].filter(Boolean), `/events/${id}`);
  }
  revalidatePath("/events");
}

export async function deleteEvent(id: string): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("os_events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
}
