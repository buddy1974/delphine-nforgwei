import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BrandProvider } from "@/components/BrandProvider";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function ShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already gates this; double-check server-side (defense in depth).
  if (!user) redirect("/login");

  return (
    <BrandProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar userEmail={user.email ?? ""} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </BrandProvider>
  );
}
