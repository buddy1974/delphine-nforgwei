import Link from "next/link";
import { OS_BRANDS } from "@/lib/brands";
import { OS_MODULES } from "@/lib/modules";

export default function SettingsPage() {
  const channels = {
    supabase: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    openai: Boolean(process.env.OPENAI_API_KEY),
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Ecosystem configuration, brand registry, and connected services.</p>
      </div>

      {/* Settings navigation cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            href:   "/settings/account",
            label:  "Account",
            desc:   "Your profile and sign-in credentials",
          },
          {
            href:   "/settings/brands",
            label:  "Brand Settings",
            desc:   "Domain, accent color, and brand identity",
          },
          {
            href:   "/settings/notifications",
            label:  "Notifications",
            desc:   "Telegram and email alert preferences",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-plum/40 hover:shadow-sm transition-all"
          >
            <p className="text-sm font-bold text-charcoal group-hover:text-plum transition-colors mb-1">
              {item.label} →
            </p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Brands quick view */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Brand Registry</p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-50">
          {OS_BRANDS.map((b) => (
            <div key={b.key} className="flex items-center gap-3 px-5 py-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: b.accent }} />
              <span className="font-semibold text-charcoal text-sm">{b.shortName}</span>
              <span className="text-xs text-gray-400 flex-1 truncate">{b.domain}</span>
              <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                active
              </span>
              <Link
                href={`/settings/brands?brand=${b.key}`}
                className="text-[10px] font-semibold text-gray-400 hover:text-plum transition-colors"
              >
                Configure →
              </Link>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Brands are registered in the codebase and mirrored to the database. To add or remove a brand, update <code className="font-mono">os/src/lib/brands.ts</code> and run a migration.
        </p>
      </section>

      {/* Connected channels */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Connected Services</p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-50">
          <ChannelRow name="Supabase Database" ok={channels.supabase} hint="Content, messages, media, payments" />
          <ChannelRow name="Telegram Notifications" ok={channels.telegram} hint="Publish, payment, and support alerts" />
          <ChannelRow name="OpenAI (AI Studio)" ok={channels.openai} hint="AI-assisted content drafting" />
          <ChannelRow name="WhatsApp (Twilio)" ok={false} hint="Inbound messaging — future integration" />
          <ChannelRow name="Email (Resend)" ok={false} hint="Inbound email — future integration" />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Status reflects environment variables. Set secrets in <code className="font-mono">.env.local</code> (local) or in the Vercel project dashboard (production).
        </p>
      </section>

      {/* Modules */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">OS Modules</p>
        <div className="grid grid-cols-2 gap-2">
          {OS_MODULES.map((m) => (
            <div key={m.key} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <span className="text-sm text-charcoal">{m.title}</span>
              <span className={`ml-auto text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${
                m.status === "live"  ? "bg-green-100 text-green-700"
                : m.status === "beta" ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-500"
              }`}>
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChannelRow({ name, ok, hint }: { name: string; ok: boolean; hint: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ok ? "bg-green-500" : "bg-gray-300"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-charcoal">{name}</p>
        <p className="text-[11px] text-gray-400">{hint}</p>
      </div>
      <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 flex-shrink-0 ${
        ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
      }`}>
        {ok ? "connected" : "not set"}
      </span>
    </div>
  );
}
