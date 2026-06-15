import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OS_BRANDS } from "@/lib/brands";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const db = createSupabaseAdminClient();

  const [pages, posts, events, conversations, payments] = await Promise.all([
    db
      .from("pages")
      .select("id, brand_key, title, status, updated_at")
      .order("updated_at", { ascending: false }),
    db
      .from("posts")
      .select("id, brand_key, title, status, updated_at")
      .order("updated_at", { ascending: false }),
    db
      .from("os_events")
      .select("id, brand_key, title, status, start_date")
      .order("start_date", { ascending: true }),
    db.from("conversations").select("status, brand_key"),
    db.from("payment_claims").select("status"),
  ]);

  return {
    pages:         (pages.data ?? [])         as { id: string; brand_key: string; title: string; status: string; updated_at: string }[],
    posts:         (posts.data ?? [])         as { id: string; brand_key: string; title: string; status: string; updated_at: string }[],
    events:        (events.data ?? [])        as { id: string; brand_key: string; title: string; status: string; start_date: string | null }[],
    conversations: (conversations.data ?? []) as { status: string; brand_key: string }[],
    payments:      (payments.data ?? [])      as { status: string }[],
  };
}

export default async function DashboardPage() {
  const { pages, posts, events, conversations, payments } = await getDashboardData();

  const openMessages  = conversations.filter((c) => c.status === "open").length;
  const pendingPay    = payments.filter((p) =>
    p.status === "claimed" || p.status === "pending_confirmation"
  ).length;

  /* Recent drafts (pages + posts not yet published, newest first, max 5) */
  const recentDrafts = [
    ...pages
      .filter((p) => p.status !== "published")
      .map((p) => ({ ...p, kind: "Page" as const, href: `/${p.brand_key}/pages/${p.id}` })),
    ...posts
      .filter((p) => p.status !== "published")
      .map((p) => ({ ...p, kind: "Post" as const, href: `/${p.brand_key}/blog/${p.id}` })),
  ]
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 5);

  /* Upcoming events (status published or draft, future dates, max 4) */
  const now = new Date().toISOString();
  const upcomingEvents = events
    .filter((e) => !e.start_date || e.start_date >= now.slice(0, 10))
    .slice(0, 4);

  /* Recent publications (newest published pages/posts, max 4) */
  const recentPublications = [
    ...pages
      .filter((p) => p.status === "published")
      .map((p) => ({ ...p, kind: "Page" as const, href: `/${p.brand_key}` })),
    ...posts
      .filter((p) => p.status === "published")
      .map((p) => ({ ...p, kind: "Post" as const, href: `/${p.brand_key}/blog` })),
  ]
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))
    .slice(0, 4);

  return (
    <div className="max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Good morning, Rev. Delphine</h1>
        <p className="text-sm text-gray-500 mt-1">Delphine Ecosystem — Command Center</p>
      </div>

      {/* Alert bar */}
      {(openMessages > 0 || pendingPay > 0) && (
        <div className="flex gap-3 mb-8 flex-wrap">
          {openMessages > 0 && (
            <Link
              href="/messages"
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">
                  {openMessages} unread message{openMessages !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-amber-600">Review in Messages</p>
              </div>
            </Link>
          )}
          {pendingPay > 0 && (
            <Link
              href="/payments"
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-800">
                  {pendingPay} payment{pendingPay !== 1 ? "s" : ""} pending verification
                </p>
                <p className="text-[11px] text-green-600">Review in Payments</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Top row: Websites + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Website cards — 2/3 */}
        <div className="lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Your Websites
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {OS_BRANDS.map((brand) => {
              const brandPages  = pages.filter((p) => p.brand_key === brand.key);
              const brandPosts  = posts.filter((p) => p.brand_key === brand.key);
              const brandEvents = events.filter((e) => e.brand_key === brand.key);
              const draftCount  =
                brandPages.filter((p) => p.status !== "published").length +
                brandPosts.filter((p) => p.status !== "published").length;

              return (
                <Link
                  key={brand.key}
                  href={`/${brand.key}`}
                  className="group bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* Brand header */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: brand.accent }}
                    />
                    <p className="text-sm font-bold text-charcoal truncate group-hover:text-plum transition-colors">
                      {brand.shortName}
                    </p>
                    {draftCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        {draftCount} draft{draftCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {[
                      { label: "Pages",  count: brandPages.length },
                      { label: "Posts",  count: brandPosts.length },
                      { label: "Events", count: brandEvents.length },
                    ].map(({ label, count }) => (
                      <div key={label} className="text-center">
                        <p className="text-base font-bold text-charcoal leading-none">{count}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Open website CTA */}
                  <div className="text-[11px] font-semibold text-gray-400 group-hover:text-plum transition-colors text-center border-t border-gray-100 pt-2.5">
                    Open website workspace →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions — 1/3 */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Quick Actions
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
            {OS_BRANDS.map((brand) => (
              <div key={brand.key} className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1">
                  {brand.shortName}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <Link
                    href={`/${brand.key}/pages`}
                    className="text-center text-[10px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                  >
                    + Page
                  </Link>
                  <Link
                    href={`/${brand.key}/blog`}
                    className="text-center text-[10px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                  >
                    + Post
                  </Link>
                  <Link
                    href={`/${brand.key}/events`}
                    className="text-center text-[10px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                  >
                    + Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row: Recent Drafts + Upcoming Events + Recent Publications */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Recent Drafts */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Recent Drafts
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {recentDrafts.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-5 text-center">No drafts</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentDrafts.map((item) => {
                  const brand = OS_BRANDS.find((b) => b.key === item.brand_key);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: brand?.accent ?? "#999" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-charcoal truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {brand?.shortName} · {item.kind}
                        </p>
                      </div>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                        {item.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Upcoming Events
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-5 text-center">No upcoming events</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingEvents.map((ev) => {
                  const brand = OS_BRANDS.find((b) => b.key === ev.brand_key);
                  return (
                    <Link
                      key={ev.id}
                      href={`/${ev.brand_key}/events/${ev.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: brand?.accent ?? "#999" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-charcoal truncate">{ev.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {brand?.shortName}
                          {ev.start_date ? ` · ${new Date(ev.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Publications */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Recent Publications
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {recentPublications.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-5 text-center">Nothing published yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPublications.map((item) => {
                  const brand = OS_BRANDS.find((b) => b.key === item.brand_key);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: brand?.accent ?? "#999" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-charcoal truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {brand?.shortName} · {item.kind}
                        </p>
                      </div>
                      <span className="text-[10px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded flex-shrink-0">
                        Live
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Global tools */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
        Tools
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            href:   "/messages",
            label:  "Messages",
            desc:   openMessages > 0
              ? `${openMessages} open conversation${openMessages !== 1 ? "s" : ""}`
              : "No open conversations",
            urgent: openMessages > 0,
          },
          {
            href:   "/payments",
            label:  "Payments",
            desc:   pendingPay > 0
              ? `${pendingPay} pending verification`
              : "No pending payments",
            urgent: pendingPay > 0,
          },
          {
            href:   "/ai-assistant",
            label:  "AI Assistant",
            desc:   "Draft posts, captions and announcements",
            urgent: false,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-start gap-3 bg-white rounded-2xl p-4 border transition-all hover:shadow-sm ${
              item.urgent
                ? "border-amber-200 hover:border-amber-300"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-charcoal">{item.label}</p>
              <p className={`text-xs mt-0.5 ${item.urgent ? "text-amber-600" : "text-gray-500"}`}>
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}