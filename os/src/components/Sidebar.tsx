"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OS_BRANDS } from "@/lib/brands";

/* ── Brand sub-modules ───────────────────────────────────────── */
const BRAND_MODULES = [
  { key: "pages",  label: "Pages",  icon: "📄" },
  { key: "blog",   label: "Blog",   icon: "📝" },
  { key: "events", label: "Events", icon: "📅" },
  { key: "media",  label: "Media",  icon: "🖼️" },
] as const;

/* ── Global modules (not brand-specific) ─────────────────────── */
const GLOBAL_MODULES = [
  { key: "messages",     label: "Messages",     href: "/messages",     icon: "📨" },
  { key: "payments",     label: "Payments",     href: "/payments",     icon: "💳" },
  { key: "ai-assistant", label: "AI Assistant", href: "/ai-assistant", icon: "✨" },
  { key: "settings",     label: "Settings",     href: "/settings",     icon: "⚙" },
] as const;

/* ══════════════════════════════════════════════════════════════ */

export default function Sidebar() {
  const pathname = usePathname();

  // Determine which brand is active from the current URL
  const activeBrandKey =
    OS_BRANDS.find((b) =>
      pathname.split("/").some((seg) => seg === b.key)
    )?.key ?? null;

  // Initially expand the active brand; collapse all others
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeBrandKey ? [activeBrandKey] : [])
  );

  function toggleBrand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-ink min-h-screen flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <p className="text-gold text-[10px] font-semibold tracking-[0.3em] uppercase">
          Delphine Ecosystem
        </p>
        <p className="text-white font-bold text-lg leading-tight mt-1">OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Main navigation">

        {/* Dashboard */}
        <div className="px-3 mb-1">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === "/"
                ? "bg-plum text-white font-semibold"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold flex-shrink-0 ${
                pathname === "/" ? "bg-white/15 text-gold" : "bg-white/5 text-white/50"
              }`}
            >
              Db
            </span>
            Dashboard
          </Link>
        </div>

        {/* Websites section label */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
            Websites
          </p>
        </div>

        {/* Brand sections */}
        <div className="px-3 space-y-0.5">
          {OS_BRANDS.map((brand) => {
            const isOpen = expanded.has(brand.key);
            const isBrandActive = activeBrandKey === brand.key;

            return (
              <div key={brand.key}>
                {/* Brand header: name → workspace; caret → expand/collapse */}
                <div
                  className={`flex items-center rounded-lg transition-all ${
                    isBrandActive ? "bg-white/8" : "hover:bg-white/5"
                  }`}
                >
                  <Link
                    href={`/${brand.key}`}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 text-left min-w-0 ${
                      isBrandActive ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: brand.accent }}
                    />
                    <span className="text-[12px] font-bold truncate">
                      {brand.shortName}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleBrand(brand.key)}
                    aria-label={isOpen ? "Collapse" : "Expand"}
                    className="px-2.5 py-2 text-white/25 hover:text-white/60 transition-colors text-[10px] flex-shrink-0"
                  >
                    {isOpen ? "▾" : "▸"}
                  </button>
                </div>

                {/* Sub-module links */}
                {isOpen && (
                  <div className="ml-5 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
                    {BRAND_MODULES.map((mod) => {
                      const href = `/${brand.key}/${mod.key}`;
                      const isActive = pathname.startsWith(href);
                      return (
                        <Link
                          key={mod.key}
                          href={href}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] transition-all ${
                            isActive
                              ? "bg-plum text-white font-semibold"
                              : "text-white/50 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span aria-hidden="true">{mod.icon}</span>
                          {mod.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-5 my-4 border-t border-white/10" />

        {/* Global modules */}
        <div className="px-3 space-y-0.5">
          {GLOBAL_MODULES.map((mod) => {
            const isActive = pathname.startsWith(mod.href);
            return (
              <Link
                key={mod.key}
                href={mod.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-plum text-white font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span aria-hidden="true" className="text-base leading-none">{mod.icon}</span>
                {mod.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
