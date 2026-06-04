"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";

export type AiKind = "blog" | "event" | "caption" | "broadcast";

export interface AiDraftRow {
  id: string;
  brand_key: string;
  kind: AiKind;
  raw_input: string | null;
  output: string | null;
  model: string | null;
  status: "draft" | "review" | "approved" | "published";
  created_at: string;
}

const PROMPTS: Record<AiKind, string> = {
  blog: "Turn the notes into a warm, faith-grounded blog article. Clear paragraphs, a strong opening and a hopeful close. Keep the author's voice. Return only the article body.",
  event: "Write an inviting event description from these notes: what it is, who it's for, and why to attend. 1–2 short paragraphs. Return only the description.",
  caption: "Write one warm, engaging social media caption from these notes. Under 60 words. Tasteful, no more than 2 emojis. Return only the caption.",
  broadcast: "Write a short, friendly WhatsApp broadcast message from these notes. Personal and clear, under 80 words. Return only the message.",
};

/** Generate enhanced content with OpenAI and store it as a reviewable draft. Never publishes. */
export async function generateDraft(
  brandKey: string,
  kind: AiKind,
  rawInput: string
): Promise<{ id: string; output: string } | { error: string }> {
  if (!rawInput.trim()) return { error: "Please paste some notes first." };
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "OPENAI_API_KEY is not set in the OS environment." };

  let output = "";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are a content assistant for Rev. Delphine Nforgwei's ministry brands. ${PROMPTS[kind]}` },
          { role: "user", content: rawInput.slice(0, 6000) },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("[ai-studio] OpenAI error:", res.status, t);
      return { error: "AI service error. Check the OpenAI key and try again." };
    }
    const json = await res.json();
    output = json?.choices?.[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    console.error("[ai-studio]", e);
    return { error: "Could not reach the AI service." };
  }

  if (!output) return { error: "The AI returned no content. Try again." };

  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("ai_drafts")
    .insert({
      brand_key: brandKey,
      kind,
      raw_input: rawInput.slice(0, 6000),
      output,
      model: "gpt-4o-mini",
      status: "review",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await notify("ai_draft_review", brandKey, [`🤖 New ${kind} draft awaiting review`], `/ai-studio`);
  revalidatePath("/ai-studio");
  return { id: data!.id as string, output };
}

export async function listDrafts(brandKey: string): Promise<AiDraftRow[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("ai_drafts")
    .select("id, brand_key, kind, raw_input, output, model, status, created_at")
    .eq("brand_key", brandKey)
    .order("created_at", { ascending: false });
  return (data ?? []) as AiDraftRow[];
}

/** Approve a blog draft and create a DRAFT blog post from it. Human still publishes in Blog. */
export async function sendBlogDraftToBlog(
  draftId: string,
  title: string
): Promise<{ postId: string } | { error: string }> {
  if (!title.trim()) return { error: "Give the post a title." };
  const db = createSupabaseAdminClient();
  const { data: draft } = await db
    .from("ai_drafts")
    .select("brand_key, kind, output")
    .eq("id", draftId)
    .single();
  if (!draft) return { error: "Draft not found." };
  if (draft.kind !== "blog") return { error: "Only blog drafts can be sent to the Blog." };

  const slug = title.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const { data: post, error } = await db
    .from("posts")
    .insert({
      brand_key: draft.brand_key,
      title: title.trim(),
      slug,
      body: draft.output,
      status: "draft", // never auto-publish
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { error: "A post with that slug already exists." };
    return { error: error.message };
  }

  await db.from("ai_drafts").update({ status: "approved" }).eq("id", draftId);
  revalidatePath("/ai-studio");
  revalidatePath("/blog");
  return { postId: post!.id as string };
}
