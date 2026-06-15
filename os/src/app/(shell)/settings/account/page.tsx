import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountSettingsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl space-y-8">

      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-xs text-gray-400 hover:text-plum transition-colors">
          ← Settings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-charcoal font-semibold">Account</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1">Account Settings</h1>
        <p className="text-sm text-gray-500">Your profile and authentication details.</p>
      </div>

      {/* Profile */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Profile</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                disabled
                value={user?.email ?? ""}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              />
              <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 rounded-full px-2.5 py-1 flex-shrink-0">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Email changes are managed through Supabase Authentication. Contact your administrator to update.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              User ID
            </label>
            <p className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              {user?.id ?? "—"}
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Account Created
            </label>
            <p className="text-sm text-gray-500">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Password */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Password</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-charcoal font-semibold mb-1">Change Password</p>
          <p className="text-sm text-gray-500 mb-4">
            Password changes are handled through Supabase Authentication. Use the Supabase dashboard
            (Authentication → Users) to reset or update your password, or trigger a password reset email.
          </p>
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Password reset UI is a planned enhancement for a future release. Currently managed via Supabase dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Session */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Session</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-charcoal font-semibold mb-1">Active Session</p>
          <p className="text-sm text-gray-500 mb-4">
            You are currently signed in. Sessions are managed by Supabase and expire according to
            the project JWT expiry setting.
          </p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-semibold border border-red-200 text-red-500 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
