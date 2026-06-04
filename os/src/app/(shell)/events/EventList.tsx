"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBrand } from "@/components/BrandProvider";
import { listEvents, createEvent } from "./actions";
import type { EventRow } from "@/lib/db/events";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  review: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-500",
};

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function EventList() {
  const { brand } = useBrand();
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listEvents(brand.key)
      .then((rows) => active && setEvents(rows))
      .catch((e) => active && setError(e.message ?? "Failed to load events."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [brand.key]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createEvent(brand.key, title, slugify(title));
      if ("error" in res) { setError(res.error); return; }
      router.push(`/events/${res.id}`);
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-charcoal">Events</h1>
        <button type="button" onClick={() => setShowNew((v) => !v)}
          className="text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90">
          + New event
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Events for <span className="font-semibold" style={{ color: brand.accent }}>{brand.name}</span>.
        Published events appear on the website at /events.
      </p>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Event title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. E-Woman Conference 2026"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20" autoFocus />
          </label>
          {title && <p className="text-[11px] text-gray-400 font-mono">/events/{slugify(title)}</p>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={pending || !title.trim()}
              className="text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 disabled:opacity-60">
              {pending ? "Creating…" : "Create & edit"}
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="text-xs text-gray-500 px-3 py-2">Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading events…</p>}
      {!loading && events.length === 0 && !error && (
        <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-2xl">
          No events for {brand.shortName} yet. Create the first one.
        </p>
      )}

      <div className="space-y-2">
        {events.map((ev) => (
          <Link key={ev.id} href={`/events/${ev.id}`}
            className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-plum/40 hover:shadow-sm transition-all">
            <div className="min-w-0">
              <p className="font-semibold text-charcoal text-sm truncate">{ev.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : "no date"}
                {ev.location ? ` · ${ev.location}` : ""}
                {ev.price_xaf ? ` · ${ev.price_xaf.toLocaleString()} XAF` : ev.price_xaf === 0 ? " · Free" : ""}
              </p>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLE[ev.status] ?? STATUS_STYLE.draft}`}>
              {ev.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
