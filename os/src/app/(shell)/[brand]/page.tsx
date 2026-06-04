import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OS_BRANDS } from "@/lib/brands";

export const dynamic = "force-dynamic";

export default async function BrandWorkspacePage({
  params,
}: {
  params: { brand: string };
}) {
  const brand = OS_BRANDS.find((b) => b.key === params.brand);
  if (!brand) notFound();

  const db = createSupabaseAdminClient();
  const brandKey = brand.key;

  const [pages, posts, events, media] = await Promise.all([
    db.from("pages")
      .select("id, title, status, updated_at")
      .eq("brand_key", brandKey)
      .order("updated_at", { ascending: false }),
    db.from("posts")
      .select("id, title, status, updated_at")
      .eq("brand_key", brandKey)
      .order("updated_at", { ascending: false }),
    db.from("os_events")
      .select("id, title, status, event_date")
      .eq("brand_key", brandKey)
      .order("event_date", { ascending: true }),
    db.from("media")
      .select("id, url, alt, created_at")
      .eq("brand_key", brandKey)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  type Pg   = { id: string; title: string; status: string; updated_at: string };
  type Post = { id: string; title: string; status: string; updated_at: string };
  type Ev   = { id: string; title: string; status: string; event_date: string | null };
  type Med  = { id: string; url: string; alt: string | null; created_at: string };

  const allPages  = (pages.data  ?? []) as Pg[];
  const allPosts  = (posts.data  ?? []) as Post[];
  const allEvents = (events.data ?? []) as Ev[];
  const allMedia  = (media.data  ?? []) as Med[];

  const draftPages  = allPages.filter((p)  => p.status !== "published");
  const pubPages    = allPages.filter((p)  => p.status === "published");
  const draftPosts  = allPosts.filter((p)  => p.status !== "published");
  const pubPosts    = allPosts.filter((p)  => p.status === "published");
  const upcoming    = allEvents.filter((e) => e.status !== "published" || (e.event_date ?? "") >= new Date().toISOString().slice(0,10));

  const STATUS_BADGE: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    review:    "bg-amber-100 text-amber-700",
    draft:     "bg-gray-100  text-gray-500",
  };

  return (
    <div className="max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <span
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: brand.accent }}
        />
        <div>
          <h1 className="text-2xl font-bold text-charcoal">{brand.name}</h1>
          <a
            href={`https://${brand.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-plum transition-colors"
          >
            {brand.domain} ↗
          </a>
        </div>
      </div>

      {/* Quick stats + actions */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Pages",  count: allPages.length,  draft: draftPages.length,  href: `/${brandKey}/pages`  },
          { label: "Blog",   count: allPosts.length,  draft: draftPosts.length,  href: `/${brandKey}/blog`   },
          { label: "Events", count: allEvents.length, draft: 0,                  href: `/${brandKey}/events` },
          { label: "Media",  count: allMedia.length,  draft: 0,                  href: `/${brandKey}/media`  },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-plum/40 hover:shadow-sm transition-all group"
          >
            <p className="text-2xl font-bold text-charcoal group-hover:text-plum transition-colors">
              {item.count}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            {item.draft > 0 && (
              <p className="text-[10px] text-amber-500 mt-1">
                {item.draft} draft{item.draft !== 1 ? "s" : ""}
              </p>
            )}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Draft content */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-charcoal">Draft Content</p>
            <Link
              href={`/${brandKey}/pages`}
              className="text-[11px] text-plum font-semibold hover:underline"
            >
              All pages →
            </Link>
          </div>
          {draftPages.length === 0 && draftPosts.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No drafts — everything is published.
            </p>
          ) : (
            <div className="space-y-2">
              {[...draftPages.slice(0, 3).map((p) => ({ ...p, type: "Page" })),
                ...draftPosts.slice(0, 3).map((p) => ({ ...p, type: "Post" }))
               ].slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${STATUS_BADGE[item.status] ?? STATUS_BADGE.draft}`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-semibold text-charcoal truncate flex-1">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Published content */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-charcoal">Published</p>
            <Link
              href={`/${brandKey}/blog`}
              className="text-[11px] text-plum font-semibold hover:underline"
            >
              All posts →
            </Link>
          </div>
          {pubPages.length === 0 && pubPosts.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              Nothing published yet.
            </p>
          ) : (
            <div className="space-y-2">
              {[...pubPages.slice(0, 3).map((p) => ({ ...p, type: "Page" })),
                ...pubPosts.slice(0, 3).map((p) => ({ ...p, type: "Post" }))
               ].slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                    Live
                  </span>
                  <span className="text-xs font-semibold text-charcoal truncate flex-1">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming events */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-charcoal">Upcoming Events</p>
            <Link
              href={`/${brandKey}/events`}
              className="text-[11px] text-plum font-semibold hover:underline"
            >
              All events →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No upcoming events.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 py-1.5">
                  <span className="text-[11px] font-mono text-gray-400 flex-shrink-0 w-20">
                    {ev.event_date ?? "TBD"}
                  </span>
                  <span className="text-xs font-semibold text-charcoal truncate flex-1">
                    {ev.title}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_BADGE[ev.status] ?? STATUS_BADGE.draft}`}>
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent uploads */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-charcoal">Recent Uploads</p>
            <Link
              href={`/${brandKey}/media`}
              className="text-[11px] text-plum font-semibold hover:underline"
            >
              All media →
            </Link>
          </div>
          {allMedia.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No uploads yet.{" "}
              <Link href={`/${brandKey}/media`} className="text-plum hover:underline">
                Upload images →
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {allMedia.slice(0, 6).map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.url}
                  alt={m.alt ?? ""}
                  className="w-full h-16 object-cover rounded-lg border border-gray-100"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <p className="w-full text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          Quick actions
        </p>
        {[
          { label: "Add page",  href: `/${brandKey}/pages`  },
          { label: "Write post", href: `/${brandKey}/blog`  },
          { label: "Add event", href: `/${brandKey}/events` },
          { label: "Upload media", href: `/${brandKey}/media` },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-1.5 text-xs font-bold border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:border-plum/40 hover:text-plum hover:bg-plum/5 transition-all"
          >
            + {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
