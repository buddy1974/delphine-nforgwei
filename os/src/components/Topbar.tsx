"use client";

import BrandSwitcher from "./BrandSwitcher";
import { useBrand } from "./BrandProvider";

export default function Topbar({ userEmail }: { userEmail: string }) {
  const { brand } = useBrand();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 gap-4">
      <div className="min-w-0">
        <p className="text-xs text-gray-400">Active brand</p>
        <p className="text-sm font-semibold text-charcoal truncate">{brand.name}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <BrandSwitcher />
        <span className="hidden sm:block text-xs text-gray-400 max-w-[180px] truncate">
          {userEmail}
        </span>
        <form action="/os/auth/signout" method="POST">
          <button
            type="submit"
            className="text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
