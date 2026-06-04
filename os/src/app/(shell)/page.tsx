import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OS_BRANDS } from "@/lib/brands";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const db = createSupabaseAdminClient();

  const [pages, posts, events, conversations, payments] = await Promise.all([
    db.from("pages").select("brand_key, status"),
    db.from("posts").select("brand_key, status"),
    db.from("os_events").select("brand_key, status"),
    db.from("conversations").select("status, brand_key"),
    db.from("payment_claims").select("status"),
  ]);

  return {
    pages:         (pages.data ?? []) as { brand_key: string; status: string }[],
    posts:         (posts.data ?? []) as { brand_key: string; status: string }[],
    events:        (events.data ?? []) as { brand_key: string; status: string }[],
    conversations: (conversations.data ?? []) as { status: string; brand_key: string }[],
    payments:      (payments.data ?? []) as { status: string }[],
  };
}

export default async function DashboardPage() {
  const { pages, posts, events, conversations, payments } = await getDashboardData();

  const openMessages  = conversations.filter((c) => c.status === "open").length;
  const pendingPay    = payments.filter((p) =>
    p.status === "claimed" || p.status === "pending_confirmation"
  ).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Delphine Ecosystem — Central Operations
        </p>
      </div>

      {/* Global alerts */}
      {(openMessages > 0 || pendingPay > 0) && (
        <div className="flex gap-3 mb-8 flex-wrap">
          {openMessages > 0 && (
            <Link
              href="/messages"
              className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
            >
              <span className="text-base">📨</span>
              <div>
                <p className="text-xs font-bold text-amber-800">
                  {openMessages} open message{openMessages !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-amber-600">Tap to review</p>
              </div>
            </Link>
          )}
          {pendingPay > 0 && (
            <Link
              href="/payments"
              className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors"
            >
              <span className="text-base">💳</span>
              <div>
                <p className="text-xs font-bold text-green-800">
                  {pendingPay} payment{pendingPay !== 1 ? "s" : ""} to verify
                </p>
                <p className="text-[11px] text-green-600">Tap to review</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Website cards */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
        Websites
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {OS_BRANDS.map((brand) => {
          const brandPages  = pages.filter((p) => p.brand_key === brand.key);
          const brandPosts  = posts.filter((p) => p.brand_key === brand.key);
          const brandEvents = events.filter((e) => e.brand_key === brand.key);

          const pubPages  = brandPages.filter((p)  => p.status === "published").length;
          const pubPosts  = brandPosts.filter((p)  => p.status === "published").length;
          const pubEvents = brandEvents.filter((e) => e.status === "published").length;

          return (
            <div
              key={brand.key}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              {/* Brand header */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: brand.accent }}
                />
                <p className="text-sm font-bold text-charcoal truncate">
                  {brand.shortName}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                {[
                  { label: "Pages",  count: pubPages,  total: brandPages.length },
                  { label: "Posts",  count: pubPosts,  total: brandPosts.length },
                  { label: "Events", count: pubEvents, total: brandEvents.length },
                ].map(({ label, count, total }) => (
                  <div key={label} className="text-center">
                    <p className="text-lg font-bold text-charcoal leading-none">{total}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{label}</p>
                    {total > 0 && count < total && (
                      <p className="text-[9px] text-amber-500">{total - count} draft</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href={`/${brand.key}/pages`}
                  className="text-center text-[11px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                >
                  Pages
                </Link>
                <Link
                  href={`/${brand.key}/blog`}
                  className="text-center text-[11px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href={`/${brand.key}/events`}
                  className="text-center text-[11px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                >
                  Events
                </Link>
                <Link
                  href={`/${brand.key}/media`}
                  className="text-center text-[11px] font-semibold py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors"
                >
                  Media
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global tools */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
        Tools
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            href:  "/messages",
            icon:  "📨",
            label: "Messages",
            desc:  openMessages > 0
              ? `${openMessages} open conversation${openMessages !== 1 ? "s" : ""}`
              : "No open conversations",
            urgent: openMessages > 0,
          },
          {
            href:  "/payments",
            icon:  "💳",
            label: "Payments",
            desc:  pendingPay > 0
              ? `${pendingPay} pending verification`
              : "No pending payments",
            urgent: pendingPay > 0,
          },
          {
            href:  "/ai-assistant",
            icon:  "✨",
            label: "AI Assistant",
            desc:  "Draft posts, captions and announcements",
            urgent: false,
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-start gap-3 bg-white rounded-2xl p-5 border transition-all hover:shadow-sm ${
              item.urgent
                ? "border-amber-200 hover:border-amber-300"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl leading-none flex-shrink-0">{item.icon}</span>
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
