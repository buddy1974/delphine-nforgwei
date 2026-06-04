"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OS_MODULES } from "@/lib/modules";

export default function Sidebar() {
  const pathname = usePathname();

  const items = [
    { key: "dashboard", title: "Dashboard", href: "/", glyph: "Db" },
    ...OS_MODULES.map(({ key, title, href, glyph }) => ({ key, title, href, glyph })),
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-ink min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <p className="text-gold text-[10px] font-semibold tracking-[0.3em] uppercase">
          Delphine Ecosystem
        </p>
        <p className="text-white font-bold text-lg leading-tight mt-1">OS</p>
      </div>

      <nav className="flex-1 py-4" aria-label="OS modules">
        <ul className="space-y-0.5 px-3">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-plum text-white font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[10px] font-bold flex-shrink-0 ${
                      active ? "bg-white/15 text-gold" : "bg-white/5 text-white/50"
                    }`}
                  >
                    {item.glyph}
                  </span>
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/30 text-[10px] leading-relaxed">
          Phase C shell · placeholders only.
          <br />
          No live site is modified from here yet.
        </p>
      </div>
    </aside>
  );
}
