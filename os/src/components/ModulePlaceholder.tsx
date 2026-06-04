"use client";

import { getOsModule } from "@/lib/modules";
import { useBrand } from "./BrandProvider";

export default function ModulePlaceholder({ moduleKey }: { moduleKey: string }) {
  const { brand } = useBrand();
  const mod = getOsModule(moduleKey);

  if (!mod) return null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-charcoal">{mod.title}</h1>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30 rounded-full px-2.5 py-1">
          {mod.phase}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        {mod.description} Scoped to <strong>{brand.shortName}</strong> via the brand
        switcher.
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-plum mb-4">
          Planned capabilities
        </p>
        <ul className="space-y-3">
          {mod.planned.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-gray-400 mt-6">
        Placeholder module — no data is read or written yet. Build order and data
        model: <code>drimp-ecosystem/docs/ecosystem-os-architecture.md</code>.
      </p>
    </div>
  );
}
