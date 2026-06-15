import Link from "next/link";

export default function NotificationsPage() {
  const telegramSet = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  const telegramBot = process.env.TELEGRAM_BOT_TOKEN ? "••••••••" + (process.env.TELEGRAM_BOT_TOKEN.slice(-4)) : null;
  const telegramChat = process.env.TELEGRAM_CHAT_ID ?? null;

  return (
    <div className="max-w-2xl space-y-8">

      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-xs text-gray-400 hover:text-plum transition-colors">
          ← Settings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-charcoal font-semibold">Notifications</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-charcoal mb-1">Notification Settings</h1>
        <p className="text-sm text-gray-500">
          Control how and when the OS sends alerts. All notifications are outbound-only from the server.
        </p>
      </div>

      {/* Telegram */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Telegram</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${telegramSet ? "bg-green-500" : "bg-gray-300"}`} />
            <p className="text-sm font-bold text-charcoal">
              Telegram Notifications — {telegramSet ? "Connected" : "Not configured"}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            When active, the OS sends Telegram messages to the configured chat for:
          </p>
          <ul className="space-y-1.5 pl-4">
            {[
              "New website contact form submission",
              "New payment claim received",
              "Page published",
              "Event published",
            ].map((item) => (
              <li key={item} className="text-sm text-gray-500 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${telegramSet ? "bg-green-400" : "bg-gray-200"}`} />
                {item}
              </li>
            ))}
          </ul>

          {telegramSet ? (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Bot Token</p>
                <p className="text-sm font-mono text-gray-500">{telegramBot}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Chat ID</p>
                <p className="text-sm font-mono text-gray-500">{telegramChat}</p>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-charcoal mb-2">How to configure:</p>
              <ol className="space-y-2 pl-4 list-decimal text-sm text-gray-500">
                <li>Create a Telegram bot via @BotFather — save the bot token.</li>
                <li>Add the bot to your group or start a private chat — note the chat ID.</li>
                <li>
                  Set <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">TELEGRAM_BOT_TOKEN</code> and{" "}
                  <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">TELEGRAM_CHAT_ID</code> in{" "}
                  <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">.env.local</code> or the Vercel project dashboard.
                </li>
                <li>Restart the server to apply.</li>
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* Email notifications */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Email Notifications</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" />
            <p className="text-sm font-bold text-charcoal">Email Alerts — Not configured</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Email notification delivery (via Resend or similar) is planned for a future integration phase.
            When active, it will send digest emails for new messages, payment confirmations, and publishing events.
          </p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Integration pending. Set <code className="font-mono">RESEND_API_KEY</code> and{" "}
              <code className="font-mono">NOTIFY_EMAIL_TO</code> when ready.
            </p>
          </div>
        </div>
      </section>

      {/* Notification preferences structure */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Notification Events</p>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {[
            { event: "New contact message",      telegram: true,        email: false, note: "" },
            { event: "New payment claim",         telegram: true,        email: false, note: "" },
            { event: "Page published",            telegram: true,        email: false, note: "" },
            { event: "Event published",           telegram: true,        email: false, note: "" },
            { event: "Blog post published",       telegram: false,       email: false, note: "Planned" },
            { event: "Daily activity digest",     telegram: false,       email: false, note: "Planned" },
          ].map((row) => (
            <div key={row.event} className="flex items-center gap-4 px-5 py-3">
              <span className="flex-1 text-sm text-charcoal">{row.event}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                row.telegram ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
              }`}>
                {row.telegram ? "Telegram" : "—"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                row.email ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
              }`}>
                {row.email ? "Email" : "—"}
              </span>
              {row.note && (
                <span className="text-[10px] text-amber-600 font-semibold">{row.note}</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Notification granularity controls (per-brand on/off) are planned for a future settings phase.
        </p>
      </section>

    </div>
  );
}
