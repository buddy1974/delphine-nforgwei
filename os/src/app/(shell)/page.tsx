"use client";

import Link from "next/link";
import { OS_MODULES } from "@/lib/modules";
import { useBrand } from "@/components/BrandProvider";

export default function DashboardPage() {
  const { brand, brands } = useBrand();

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Central operations for{" "}
          <span className="font-semibold" style={{ color: brand.accent }}>
            {brand.name}
          </span>{" "}
          — switch brands from the top bar.
        </p>
      </div>

      {/* Phase banner */}
      <div className="bg-blush border border-plum/15 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
        <span aria-hidden="true" className="text-plum font-bold text-sm mt-0.5">i</span>
        <p className="text-sm text-plum/90">
          <strong>Phase C shell.</strong> All modules below are placeholders — no live
          website is read or modified from here yet. Connections begin with the Blog
          module (Phase D) and the E-Woman content feed (Phase G).
        </p>
      </div>

      {/* Brand overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {brands.map((b) => (
          <div
            key={b.key}
            className={`bg-white border rounded-xl p-4 ${
              b.key === brand.key ? "border-gold shadow-sm" : "border-gray-200"
            }`}
          >
            <span
              aria-hidden="true"
              className="inline-block w-2.5 h-2.5 rounded-full mb-2"
              style={{ backgroundColor: b.accent }}
            />
            <p className="text-sm font-semibold text-charcoal">{b.shortName}</p>
            <p className="text-[11px] text-gray-400 truncate">{b.domain}</p>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
        Modules
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OS_MODULES.map((mod) => (
          <Link
            key={mod.key}
            href={mod.href}
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-plum/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-plum/10 text-plum text-xs font-bold"
              >
                {mod.glyph}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 group-hover:text-gold transition-colors">
                {mod.phase}
              </span>
            </div>
            <p className="font-semibold text-charcoal text-sm mb-1">{mod.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
