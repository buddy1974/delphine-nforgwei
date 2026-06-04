"use client";

import { useEffect, useState } from "react";
import { useBrand } from "@/components/BrandProvider";
import {
  listConversations,
  getThread,
  setConversationStatus,
  addReplyNote,
} from "./actions";
import type { ConversationRow, MessageRow, ConvoStatus } from "@/lib/db/messages";
import { CONVO_STATUSES } from "@/lib/db/messages";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  resolved: "bg-gray-100 text-gray-500",
};
const CHANNEL_GLYPH: Record<string, string> = {
  whatsapp: "WA",
  email: "@",
  telegram: "TG",
  webform: "Web",
};

export default function MessageCenter({ initialId }: { initialId?: string }) {
  const { brand } = useBrand();
  const [convos, setConvos] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ConvoStatus>("all");
  const [active, setActive] = useState<string | null>(null);
  const [thread, setThread] = useState<{ conversation: ConversationRow; messages: MessageRow[] } | null>(null);
  const [note, setNote] = useState("");

  async function refresh() {
    setLoading(true);
    const rows = await listConversations(brand.key);
    setConvos(rows);
    setLoading(false);
  }

  useEffect(() => {
    setActive(null);
    setThread(null);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.key]);

  useEffect(() => {
    if (initialId) open(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  async function open(id: string) {
    setActive(id);
    setThread(await getThread(id));
  }

  async function changeStatus(id: string, status: ConvoStatus) {
    await setConversationStatus(id, status);
    await refresh();
    if (active === id) setThread(await getThread(id));
  }

  async function saveNote() {
    if (!active || !note.trim()) return;
    await addReplyNote(active, note);
    setNote("");
    setThread(await getThread(active));
    await refresh();
  }

  const shown = convos.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-charcoal mb-1">Messages</h1>
      <p className="text-sm text-gray-500 mb-5">
        Inbox for <span className="font-semibold" style={{ color: brand.accent }}>{brand.name}</span>{" "}
        — website forms now, WhatsApp &amp; email next.
      </p>

      <div className="flex gap-2 mb-4">
        {(["all", ...CONVO_STATUSES] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
              filter === f ? "bg-plum text-white border-plum" : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* List */}
        <div className="space-y-2">
          {loading && <p className="text-gray-400 text-sm">Loading…</p>}
          {!loading && shown.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-2xl">
              No conversations.
            </p>
          )}
          {shown.map((c) => (
            <button key={c.id} onClick={() => open(c.id)}
              className={`w-full text-left bg-white border rounded-xl px-4 py-3 transition-all ${
                active === c.id ? "border-plum shadow-sm" : "border-gray-200 hover:border-plum/40"
              }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-charcoal text-sm truncate">
                  {c.contact_name || c.contact_email || c.contact_phone || "Anonymous"}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                  {CHANNEL_GLYPH[c.channel] ?? c.channel}
                </span>
                {c.flags?.map((f) => (
                  <span key={f} className="text-[10px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">{f}</span>
                ))}
                <span className="text-[11px] text-gray-400 ml-auto">
                  {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ""}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Thread */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 min-h-[300px]">
          {!thread ? (
            <p className="text-sm text-gray-400 flex items-center justify-center h-full">
              Select a conversation.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal text-sm truncate">
                    {thread.conversation.contact_name || "Anonymous"}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {[thread.conversation.contact_email, thread.conversation.contact_phone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <select
                  value={thread.conversation.status}
                  onChange={(e) => changeStatus(thread.conversation.id, e.target.value as ConvoStatus)}
                  className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5"
                >
                  {CONVO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {thread.messages.map((m) => (
                  <div key={m.id}
                    className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                      m.direction === "in" ? "bg-gray-100 text-charcoal" : "bg-plum/10 text-plum ml-auto"
                    }`}>
                    {m.body}
                    <span className="block text-[10px] text-gray-400 mt-1">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
                {thread.messages.length === 0 && <p className="text-xs text-gray-400">No messages.</p>}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Internal note / reply log…" rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-plum/20" />
                <button onClick={saveNote} disabled={!note.trim()}
                  className="mt-2 text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 disabled:opacity-50">
                  Log note
                </button>
                <p className="text-[10px] text-gray-400 mt-2">
                  Reply-later record. Connected-channel sending (WhatsApp/email) arrives with the inbound integrations.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
