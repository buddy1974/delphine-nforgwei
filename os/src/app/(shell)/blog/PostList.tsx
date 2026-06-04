"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBrand } from "@/components/BrandProvider";
import { listPosts, createPost } from "./actions";
import type { PostRow } from "@/lib/db/posts";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  review: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-500",
};

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function PostList() {
  const { brand } = useBrand();
  const router = useRouter();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listPosts(brand.key)
      .then((rows) => active && setPosts(rows))
      .catch((e) => active && setError(e.message ?? "Failed to load posts."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [brand.key]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createPost(brand.key, title, slugify(title));
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/blog/${res.id}`);
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-charcoal">Blog</h1>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90"
        >
          + New post
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Posts for{" "}
        <span className="font-semibold" style={{ color: brand.accent }}>
          {brand.name}
        </span>
        . Published posts appear on the website at /blog.
      </p>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Post title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Three keys to a strong marriage"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20"
              autoFocus
            />
          </label>
          {title && (
            <p className="text-[11px] text-gray-400 font-mono">/blog/{slugify(title)}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending || !title.trim()}
              className="text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create & write"}
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="text-xs text-gray-500 px-3 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading posts…</p>}

      {!loading && posts.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-2xl">
          No posts for {brand.shortName} yet. Write the first one.
        </p>
      )}

      <div className="space-y-2">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.id}`}
            className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-plum/40 hover:shadow-sm transition-all"
          >
            <div className="min-w-0">
              <p className="font-semibold text-charcoal text-sm truncate">{p.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {p.category ?? "—"} · {p.author ?? "—"} ·{" "}
                {p.published_at ? new Date(p.published_at).toLocaleDateString() : "not published"}
              </p>
            </div>
            <span
              className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                STATUS_STYLE[p.status] ?? STATUS_STYLE.draft
              }`}
            >
              {p.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
