import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

/**
 * Events — rendered from the Ecosystem OS (published events only).
 * OsEventsIndex → /events · OsEventDetail → /events/:slug
 */
const OS_URL = import.meta.env.VITE_OS_URL || "http://localhost:3100/os";
const BRAND = "delphine";

type EventItem = {
  slug: string;
  title: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  location: string | null;
  price_xaf: number | null;
  payunit_url: string | null;
  whatsapp_cta: string | null;
  facebook_embed_url: string | null;
  featured_image_url: string | null;
  registration_status: string;
};

function fmtDate(iso: string | null) {
  if (!iso) return "Date to be announced";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtPrice(p: number | null) {
  if (p === null) return "";
  return p === 0 ? "Free" : `${p.toLocaleString()} XAF`;
}

export function OsEventsIndex() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetch(`${OS_URL}/api/public/${BRAND}/events`)
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setState("ready"); })
      .catch(() => setState("error"));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-[#5B1A5D] mb-10">Events</h1>
      {state === "loading" && <p className="text-gray-400">Loading…</p>}
      {state === "error" && <p className="text-gray-400">Events are unavailable right now.</p>}
      {state === "ready" && events.length === 0 && <p className="text-gray-400">No upcoming events.</p>}
      <div className="space-y-6">
        {events.map((ev) => (
          <Link key={ev.slug} to={`/events/${ev.slug}`}
            className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            {ev.featured_image_url && <img src={ev.featured_image_url} alt="" className="w-full h-48 object-cover" />}
            <div className="p-6">
              <p className="text-xs text-[#C9A227] font-semibold uppercase tracking-wider mb-1">{fmtDate(ev.event_date)}</p>
              <h2 className="text-xl font-bold text-[#121212]">{ev.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {ev.location ?? ""}{ev.price_xaf !== null ? ` · ${fmtPrice(ev.price_xaf)}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OsEventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [ev, setEv] = useState<EventItem | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setState("loading");
    fetch(`${OS_URL}/api/public/${BRAND}/events/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setEv(d.event); setState("ready"); })
      .catch(() => setState("error"));
  }, [slug]);

  if (state === "loading")
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading…</div>;
  if (state === "error" || !ev)
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Event not found.</div>;

  const wa = ev.whatsapp_cta
    ? `https://wa.me/${ev.whatsapp_cta.replace(/\D/g, "")}?text=${encodeURIComponent("Hello, I'm interested in " + ev.title)}`
    : null;

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/events" className="text-sm text-[#5B1A5D] hover:underline">← All events</Link>
      {ev.featured_image_url && <img src={ev.featured_image_url} alt="" className="w-full rounded-2xl my-6" />}
      <h1 className="text-3xl md:text-4xl font-bold text-[#121212] mb-2">{ev.title}</h1>
      <p className="text-[#C9A227] font-semibold mb-1">{fmtDate(ev.event_date)}{ev.start_time ? ` · ${ev.start_time.slice(0,5)}` : ""}</p>
      <p className="text-gray-500 mb-6">{ev.location ?? ""}{ev.price_xaf !== null ? ` · ${fmtPrice(ev.price_xaf)}` : ""}</p>
      {ev.description && <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[17px] mb-8">{ev.description}</p>}

      <div className="flex flex-wrap gap-3">
        {ev.registration_status === "open" && ev.payunit_url && (
          <a href={ev.payunit_url} target="_blank" rel="noopener noreferrer"
            className="bg-[#5B1A5D] hover:opacity-90 text-white font-semibold px-7 py-3 rounded-lg">
            Register{ev.price_xaf ? ` — ${fmtPrice(ev.price_xaf)}` : ""}
          </a>
        )}
        {ev.registration_status === "waitlist" && (
          <span className="bg-amber-100 text-amber-700 font-semibold px-7 py-3 rounded-lg">Waitlist open</span>
        )}
        {ev.registration_status === "closed" && (
          <span className="bg-gray-100 text-gray-500 font-semibold px-7 py-3 rounded-lg">Registration closed</span>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="border border-[#5B1A5D] text-[#5B1A5D] font-semibold px-7 py-3 rounded-lg hover:bg-[#F6E8F0]">
            Ask on WhatsApp
          </a>
        )}
      </div>

      {ev.facebook_embed_url && (
        <div className="mt-10">
          <iframe title="Facebook event" src={ev.facebook_embed_url} className="w-full h-96 rounded-xl border-0" loading="lazy" />
        </div>
      )}
    </article>
  );
}
