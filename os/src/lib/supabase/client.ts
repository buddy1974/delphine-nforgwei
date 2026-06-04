"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client — used ONLY for auth (login/logout). Data access is server-side. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
