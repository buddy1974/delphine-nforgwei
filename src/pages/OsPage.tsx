import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/**
 * OS-managed page renderer.
 * Renders a page that Rev. Delphine builds & publishes in the Ecosystem OS
 * (delphine-nforgwei.com/os). Existing hand-built pages are untouched —
 * this only powers routes under /p/<slug>.
 *
 * OS base URL: set VITE_OS_URL in .env (e.g. https://delphine-nforgwei.com/os).
 * Defaults to the local OS dev server.
 */
const OS_URL = import.meta.env.VITE_OS_URL || "http://localhost:3100/os";
const BRAND = "delphine";

type Section = {
  type: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
};

type PageData = { page: { slug: string; title: string }; sections: Section[] };

export default function OsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PageData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    setState("loading");
    fetch(`${OS_URL}/api/public/${BRAND}/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d: PageData) => {
        if (active) {
          setData(d);
          setState("ready");
        }
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [slug]);

  if (state === "loading")
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading…</div>;
  if (state === "error" || !data)
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        This page isn’t available.
      </div>
    );

  return (
    <article>
      {data.sections.map((s, i) => (
        <Block key={i} s={s} first={i === 0} />
      ))}
    </article>
  );
}

function Block({ s, first }: { s: Section; first: boolean }) {
  const Button = () =>
    s.button_label && s.button_url ? (
      <a
        href={s.button_url}
        className="inline-block mt-6 bg-[#C9A227] hover:opacity-90 text-[#121212] font-semibold px-7 py-3 rounded-lg transition"
      >
        {s.button_label}
      </a>
    ) : null;

  if (s.type === "hero") {
    return (
      <section className="relative px-6 py-24 md:py-32 text-center text-white"
        style={{ background: "linear-gradient(160deg,#2a003a,#0d0010)" }}>
        {s.title && <h1 className="text-3xl md:text-5xl font-bold mb-4">{s.title}</h1>}
        {s.subtitle && <p className="text-lg text-white/70 max-w-2xl mx-auto">{s.subtitle}</p>}
        {s.body && <p className="text-white/60 max-w-2xl mx-auto mt-4">{s.body}</p>}
        <Button />
      </section>
    );
  }

  if (s.type === "image" && s.image_url) {
    return (
      <section className="px-6 py-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.image_url} alt={s.title ?? ""} className="max-w-4xl w-full mx-auto rounded-2xl" />
      </section>
    );
  }

  if (s.type === "cta") {
    return (
      <section className="px-6 py-16 text-center bg-[#F6E8F0]">
        {s.title && <h2 className="text-2xl md:text-3xl font-bold text-[#5B1A5D]">{s.title}</h2>}
        {s.body && <p className="text-gray-600 mt-3 max-w-xl mx-auto">{s.body}</p>}
        <Button />
      </section>
    );
  }

  // text / cards / event_block / program_card → generic content block
  return (
    <section className={`px-6 ${first ? "pt-16" : "pt-10"} pb-10 max-w-3xl mx-auto`}>
      {s.title && <h2 className="text-2xl font-bold text-[#5B1A5D] mb-2">{s.title}</h2>}
      {s.subtitle && <p className="text-lg text-gray-500 mb-3">{s.subtitle}</p>}
      {s.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image_url} alt={s.title ?? ""} className="w-full rounded-xl my-4" />
      )}
      {s.body && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>}
      <Button />
    </section>
  );
}
