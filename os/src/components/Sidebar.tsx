"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OS_BRANDS } from "@/lib/brands";

const GLOBAL_MODULES = [
  { key: "messages",     label: "Messages",     href: "/messages"     },
  { key: "payments",     label: "Payments",     href: "/payments"     },
  { key: "ai-assistant", label: "AI Assistant", href: "/ai-assistant" },
  { key: "settings",     label: "Settings",     href: "/settings"     },
  { key: "help",         label: "Help",         href: "/help"         },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeBrandKey =
    OS_BRANDS.find((b) =>
      pathname.split("/").some((seg) => seg === b.key)
    )?.key ?? null;

  const navContent = (
    <nav className="flex-1 overflow-y-auto py-3" aria-label="Main navigation">

      <div className="px-3 mb-1">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
            (pathname === "/"
              ? "bg-plum text-white font-semibold"
              : "text-white/60 hover:text-white hover:bg-white/5")
          }
        >
          Dashboard
        </Link>
      </div>

      <div className="px-6 pt-5 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
          Websites
        </p>
      </div>

      <div className="px-3 space-y-0.5">
        {OS_BRANDS.map((brand) => {
          const isActive = activeBrandKey === brand.key;
          return (
            <Link
              key={brand.key}
              href={"/" + brand.key}
              aria-current={isActive ? "page" : undefined}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " +
                (isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/55 hover:text-white hover:bg-white/5")
              }
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: brand.accent }}
              />
              <span className="text-[13px] font-bold truncate">
                {brand.shortName}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mx-5 my-4 border-t border-white/10" />

      <div className="px-3 space-y-0.5">
        {GLOBAL_MODULES.map((mod) => {
          const isActive = pathname.startsWith(mod.href);
          return (
            <Link
              key={mod.key}
              href={mod.href}
              aria-current={isActive ? "page" : undefined}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors " +
                (isActive
                  ? "bg-plum text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/5")
              }
            >
              {mod.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-ink min-h-screen flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <p className="text-gold text-[9px] font-semibold tracking-[0.3em] uppercase">
            Delphine Ecosystem
          </p>
          <p className="text-white font-bold text-lg leading-tight mt-0.5">OS</p>
        </div>
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-ink h-14 flex items-center px-4 gap-3 border-b border-white/10">
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex flex-col gap-1.5 w-7 h-7 items-center justify-center"
        >
          <span className={"block w-5 h-0.5 bg-white/70 transition-all " + (mobileOpen ? "rotate-45 translate-y-2" : "")} />
          <span className={"block w-5 h-0.5 bg-white/70 transition-all " + (mobileOpen ? "opacity-0" : "")} />
          <span className={"block w-5 h-0.5 bg-white/70 transition-all " + (mobileOpen ? "-rotate-45 -translate-y-2" : "")} />
        </button>
        <p className="text-gold text-[9px] font-semibold tracking-[0.3em] uppercase">Delphine Ecosystem</p>
        <p className="text-white font-bold text-base ml-1">OS</p>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-ink flex flex-col shadow-2xl">
            <div className="px-5 py-5 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
              <div>
                <p className="text-gold text-[9px] font-semibold tracking-[0.3em] uppercase">
                  Delphine Ecosystem
                </p>
                <p className="text-white font-bold text-lg leading-tight mt-0.5">OS</p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="text-white/40 hover:text-white text-xl leading-none"
              >
                x
              </button>
            </div>
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
