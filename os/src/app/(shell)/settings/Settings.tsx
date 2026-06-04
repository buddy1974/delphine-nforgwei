"use client";

import { OS_BRANDS } from "@/lib/brands";
import { OS_MODULES } from "@/lib/modules";

export default function Settings({ channels }: { channels: { telegram: boolean; openai: boolean; supabase: boolean } }) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Brands, modules and connected channels.</p>
      </div>

      {/* Brands */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Brands</p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-50">
          {OS_BRANDS.map((b) => (
            <div key={b.key} className="flex items-center gap-3 px-5 py-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.accent }} />
              <span className="font-semibold text-charcoal text-sm">{b.shortName}</span>
              <span className="text-xs text-gray-400">{b.domain}</span>
              <span className="ml-auto text-[10px] font-bold uppercase bg-green-100 text-green-700 rounded-full px-2 py-0.5">active</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Brand registry mirrors the database. Editing brands from the UI arrives with team roles.</p>
      </section>

      {/* Channels */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Connected channels</p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-50">
          <ChannelRow name="Supabase database" ok={channels.supabase} hint="Content, messages, payments" />
          <ChannelRow name="Telegram notifications" ok={channels.telegram} hint="Publish + payment + support alerts" />
          <ChannelRow name="OpenAI (AI Studio)" ok={channels.openai} hint="Draft generation" />
          <ChannelRow name="WhatsApp (Twilio)" ok={false} hint="Inbound — arrives with Message Center integrations" />
          <ChannelRow name="Email (Resend / Gmail)" ok={false} hint="Inbound — later phase" />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Status reflects environment variables on the OS server. Set secrets in <code>.env.local</code> / Vercel.</p>
      </section>

      {/* Modules */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Modules</p>
        <div className="grid grid-cols-2 gap-2">
          {OS_MODULES.map((m) => (
            <div key={m.key} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <span className="text-sm text-charcoal">{m.title}</span>
              <span className={`ml-auto text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${
                m.status === "live" ? "bg-green-100 text-green-700"
                : m.status === "beta" ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-500"
              }`}>{m.status}</span>
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
      <span className={`w-2.5 h-2.5 rounded-full ${ok ? "bg-green-500" : "bg-gray-300"}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-charcoal">{name}</p>
        <p className="text-[11px] text-gray-400">{hint}</p>
      </div>
      <span className={`ml-auto text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
        {ok ? "connected" : "not set"}
      </span>
    </div>
  );
}
