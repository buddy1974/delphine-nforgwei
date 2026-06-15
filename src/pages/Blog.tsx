import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

/**
 * Blog — rendered from the Ecosystem OS (published posts only).
 * BlogIndex → /blog · BlogPost → /blog/:slug
 */
const OS_URL = import.meta.env.VITE_OS_URL || "http://localhost:3100/os";
const BRAND = "delphine";

type PostSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author: string | null;
  category: string | null;
  published_at: string | null;
};

type PostFull = PostSummary & { body: string | null; tags: string[] };

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function BlogIndex() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetch(`${OS_URL}/api/public/${BRAND}/blog`)
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setState("ready"); })
      .catch(() => setState("error"));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-[#5B1A5D] mb-10">Blog</h1>
      {state === "loading" && <p className="text-gray-400">Loading…</p>}
      {state === "error" && <p className="text-gray-400">The blog is unavailable right now.</p>}
      {state === "ready" && posts.length === 0 && <p className="text-gray-400">No posts yet.</p>}
      <div className="space-y-8">
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="block group">
            {p.featured_image_url && (
              <img src={p.featured_image_url} alt="" className="w-full h-56 object-cover rounded-2xl mb-4" />
            )}
            <p className="text-xs text-[#C9A227] font-semibold uppercase tracking-wider mb-1">
              {p.category ?? "News"} · {fmtDate(p.published_at)}
            </p>
            <h2 className="text-xl font-bold text-[#121212] group-hover:text-[#5B1A5D] transition-colors">
              {p.title}
            </h2>
            {p.excerpt && <p className="text-gray-600 mt-2 leading-relaxed">{p.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostFull | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setState("loading");
    fetch(`${OS_URL}/api/public/${BRAND}/blog/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setPost(d.post); setState("ready"); })
      .catch(() => setState("error"));
  }, [slug]);

  if (state === "loading")
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading…</div>;
  if (state === "error" || !post)
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Post not found.</div>;

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/blog" className="text-sm text-[#5B1A5D] hover:underline">← All posts</Link>
      <p className="text-xs text-[#C9A227] font-semibold uppercase tracking-wider mt-6 mb-2">
        {post.category ?? "News"} · {fmtDate(post.published_at)}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-[#121212] mb-3">{post.title}</h1>
      {post.author && <p className="text-sm text-gray-500 mb-6">By {post.author}</p>}
      {post.featured_image_url && (
        <img src={post.featured_image_url} alt="" className="w-full rounded-2xl mb-8" />
      )}
      {post.body && (
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[17px]">{post.body}</div>
      )}
    </article>
  );
}
