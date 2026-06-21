"use client";

import { useState } from "react";
import Link from "next/link";
import AutoField from "./AutoField";
import type { PostRow, PostPatch } from "@/lib/db/posts";
import { PAGE_STATUSES, type PageStatus } from "@/lib/db/pages";
import { runSave } from "@/lib/save-result";
import { updatePost, setPostStatus } from "@/app/(shell)/blog/actions";

export default function PostEditor({ post }: { post: PostRow }) {
  const [status, setStatus] = useState<PageStatus>(post.status);
  const [imageUrl, setImageUrl] = useState(post.featured_image_url ?? "");

  // P1D.6: runSave normalizes all server/network errors — strict ok===true detection
  async function save(patch: PostPatch) {
    return await runSave(() => updatePost(post.id, patch));
  }

  async function handleStatus(next: PageStatus) {
    setStatus(next);
    await setPostStatus(post.id, next);
  }

  return (
    <div className="max-w-3xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/blog" className="text-xs text-gray-500 hover:text-charcoal">
          ← All posts
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Status</span>
          <select
            value={status}
            onChange={(e) => handleStatus(e.target.value as PageStatus)}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
          >
            {PAGE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {status === "published" && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-full px-2.5 py-1">
              Live
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 px-2 mb-4">
        /blog/{post.slug} · {post.brand_key} · changes save automatically
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <AutoField label="Title" value={post.title} big placeholder="Post title"
          onSave={(v) => save({ title: v })} />

        <AutoField label="Excerpt (short summary shown in lists)" value={post.excerpt ?? ""}
          multiline placeholder="One or two sentences…"
          onSave={(v) => save({ excerpt: v })} />

        <AutoField label="Article text" value={post.body ?? ""} multiline
          placeholder="Write the article here. Blank line = new paragraph."
          onSave={(v) => save({ body: v })} />

        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <AutoField label="Featured image URL" value={imageUrl}
              placeholder="https://… or /images/photo.jpg"
              onSave={async (v) => { setImageUrl(v); return await save({ featured_image_url: v }); }} />
          </div>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-300 flex-shrink-0">
              no image
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <AutoField label="Author" value={post.author ?? ""} placeholder="Rev. Delphine Nforgwei"
            onSave={(v) => save({ author: v })} />
          <AutoField label="Category" value={post.category ?? ""} placeholder="News"
            onSave={(v) => save({ category: v })} />
          <AutoField label="Tags (comma-separated)" value={(post.tags ?? []).join(", ")}
            placeholder="marriage, faith"
            onSave={(v) =>
              save({ tags: v.split(",").map((t) => t.trim()).filter(Boolean) })
            } />
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        Set status to <strong>published</strong> and the post appears on the {post.brand_key} website
        at <code>/blog/{post.slug}</code> within ~30 seconds.
      </p>
    </div>
  );
}
