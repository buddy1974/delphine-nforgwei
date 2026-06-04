"use client";

import { useEffect, useRef, useState } from "react";
import { useBrand } from "./BrandProvider";

export default function BrandSwitcher() {
  const { brand, brands, setBrandKey } = useBrand();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2.5 border border-gray-200 bg-white rounded-lg pl-3 pr-2.5 py-2 text-sm hover:border-gray-300 transition-colors"
      >
        <span
          aria-hidden="true"
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: brand.accent }}
        />
        <span className="font-semibold text-charcoal">{brand.shortName}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {brands.map((b) => (
            <li key={b.key} role="option" aria-selected={b.key === brand.key}>
              <button
                type="button"
                onClick={() => {
                  setBrandKey(b.key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                  b.key === brand.key ? "bg-blush/60" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.accent }}
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-charcoal truncate">
                    {b.shortName}
                  </span>
                  <span className="block text-[11px] text-gray-400 truncate">
                    {b.domain}
                  </span>
                </span>
                {b.key === brand.key && (
                  <span className="text-plum text-xs font-bold">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
