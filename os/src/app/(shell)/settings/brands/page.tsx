"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OS_BRANDS, type OsBrand } from "@/lib/brands";
import { Suspense } from "react";

function BrandSettingsContent() {
  const params = useSearchParams();
  const key = (params.get("brand") ?? "delphine") as OsBrand["key"];
  const brand = OS_BRANDS.find((b) => b.key === key) ?? OS_BRANDS[0];

  return (
    <div className="max-w-2xl space-y-8">

      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-xs text-gray-400 hover:text-plum transition-colors">
          ← Settings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-charcoal font-semibold">Brand Settings</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1">Brand Settings</h1>
        <p className="text-sm text-gray-500">View and plan configuration for each ecosystem brand.</p>
      </div>

      {/* Brand selector */}
      <div className="flex flex-wrap gap-2">
        {OS_BRANDS.map((b) => (
          <Link
            key={b.key}
            href={`/settings/brands?brand=${b.key}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              b.key === brand.key
                ? "text-white border-transparent shadow-sm"
                : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
            }`}
            style={b.key === brand.key ? { backgroundColor: b.accent } : {}}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: b.key === brand.key ? "#fff" : b.accent }}
            />
            {b.shortName}
          </Link>
        ))}
      </div>

      {/* Brand identity */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Brand Identity
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              disabled
              value={brand.name}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Short Name
            </label>
            <input
              type="text"
              disabled
              value={brand.shortName}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Domain
            </label>
            <input
              type="text"
              disabled
              value={brand.domain}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-500 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: brand.accent }}
              />
              <input
                type="text"
                disabled
                value={brand.accent}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Brand identity fields are defined in <code className="font-mono">os/src/lib/brands.ts</code>.
              Inline editing will be available in a future admin phase. Changes require a code deploy.
            </p>
          </div>
        </div>
      </section>

      {/* Brand key */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Technical Reference
        </p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Brand Key</p>
            <p className="text-sm font-mono text-charcoal">{brand.key}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Used in the database, API routes, and all internal references. Cannot be changed without migration.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">API Base</p>
            <p className="text-sm font-mono text-gray-500">/api/public/{brand.key}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Workspace Route</p>
            <p className="text-sm font-mono text-gray-500">/{brand.key}</p>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Quick Links
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Pages",  href: `/${brand.key}/pages`  },
            { label: "Blog",   href: `/${brand.key}/blog`   },
            { label: "Events", href: `/${brand.key}/events` },
            { label: "Media",  href: `/${brand.key}/media`  },
            { label: "Workspace", href: `/${brand.key}`     },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-center text-xs font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-plum/40 hover:text-plum transition-colors bg-white"
            >
              {item.label} →
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

export default function BrandSettingsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm p-8">Loading…</div>}>
      <BrandSettingsContent />
    </Suspense>
  );
}
