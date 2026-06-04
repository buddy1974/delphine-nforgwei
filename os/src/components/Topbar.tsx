"use client";

import { usePathname } from "next/navigation";
import { OS_BRANDS } from "@/lib/brands";

/** Derive a human-readable section title from the current URL path. */
function usePageTitle(): string {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return "Dashboard";

  // Brand-specific route: /[brand]/[module]
  const brand = OS_BRANDS.find((b) => b.key === segments[0]);
  if (brand) {
    const module = segments[1];
    if (!module) return brand.name;
    const labels: Record<string, string> = {
      pages: "Pages",
      blog: "Blog",
      events: "Events",
      media: "Media",
    };
    return `${brand.shortName} · ${labels[module] ?? module}`;
  }

  // Global routes
  const globalLabels: Record<string, string> = {
    messages:     "Messages",
    payments:     "Payments",
    "ai-assistant": "AI Assistant",
    "ai-studio":  "AI Assistant",
    settings:     "Settings",
  };
  return globalLabels[segments[0]] ?? segments[0];
}

export default function Topbar({ userEmail }: { userEmail: string }) {
  const pageTitle = usePageTitle();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 gap-4 flex-shrink-0">
      <p className="text-sm font-semibold text-charcoal truncate">{pageTitle}</p>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="hidden sm:block text-xs text-gray-400 max-w-[200px] truncate">
          {userEmail}
        </span>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
