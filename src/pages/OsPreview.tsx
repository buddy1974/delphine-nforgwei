import { useEffect, useMemo, useState } from "react";

const OS_URL = import.meta.env.VITE_OS_URL || "http://localhost:3100/os";

type Section = {
  id: string;
  page_id: string;
  type: string;
  parent_id: string | null;
  col: number | null;
  layout: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  order: number;
};

type PreviewData = {
  page: {
    id: string;
    versionId: string;
    title: string;
    status: string;
    createdAt: string;
  };
  sections: Section[];
};

type LoadState = "loading" | "ready" | "error";

export default function OsPreview() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token"), []);
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    document.title = "Secure Preview | Delphine Mah Nforgwei";
    ensureMeta("robots", "noindex,nofollow");
    ensureMeta("referrer", "no-referrer");
  }, []);

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    let active = true;
    setState("loading");

    fetch(`${OS_URL}/api/preview/delphine?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
      credentials: "omit",
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<PreviewData>;
      })
      .then((preview) => {
        if (!active) return;
        setData(preview);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const element = event.target as HTMLElement | null;
      const section = element?.closest<HTMLElement>("[data-section-id]");
      if (!section) return;
      const field = element?.closest<HTMLElement>("[data-field]");
      window.parent.postMessage(
        {
          type: "SECTION_CLICK",
          sectionId: section.dataset.sectionId,
          field: field?.dataset.field || "title",
        },
        new URL(OS_URL).origin
      );
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (state === "loading") {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Loading secure preview...</p>
      </section>
    );
  }

  if (state === "error" || !data) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-primary">Preview unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This preview link is invalid, expired, or no longer available.
          </p>
        </div>
      </section>
    );
  }

  const rows = [...data.sections].sort((a, b) => a.order - b.order);
  const childMap = new Map<string, Section[]>();
  for (const row of rows) {
    if (!row.parent_id) continue;
    const bucket = childMap.get(row.parent_id) ?? [];
    bucket.push(row);
    childMap.set(row.parent_id, bucket);
  }
  const topLevel = rows.filter((row) => !row.parent_id);

  return (
    <article data-page-version-id={data.page.versionId} className="bg-background">
      <div className="bg-accent/20 border-b border-border px-6 py-2 text-center text-xs font-semibold text-muted-foreground">
        Secure preview · immutable version {data.page.versionId}
      </div>

      {topLevel.length === 0 ? (
        <section className="min-h-[45vh] flex items-center justify-center px-6 text-center">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-primary">No sections in this preview</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Save content in the OS before creating a preview session.
            </p>
          </div>
        </section>
      ) : (
        topLevel.map((section) =>
          section.type === "row" ? (
            <RowBlock key={section.id} row={section} children={childMap.get(section.id) ?? []} />
          ) : (
            <PreviewBlock key={section.id} section={section} />
          )
        )
      )}
    </article>
  );
}

function ensureMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function RowBlock({ row, children }: { row: Section; children: Section[] }) {
  const widths = layoutToWidths(row.layout);
  return (
    <section data-section-id={row.id} className="container mx-auto px-6 lg:px-12 py-8">
      <div className="grid gap-8 lg:flex lg:items-stretch">
        {widths.map((width, index) => (
          <div key={index} className="min-w-0 flex-1" style={{ flexBasis: width }}>
            {children
              .filter((child) => child.col === index)
              .sort((a, b) => a.order - b.order)
              .map((child) => (
                <PreviewBlock key={child.id} section={child} compact />
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function layoutToWidths(layout: string | null) {
  switch (layout) {
    case "1":
      return ["100%"];
    case "3":
      return ["33.333%", "33.333%", "33.334%"];
    case "70-30":
      return ["70%", "30%"];
    case "30-70":
      return ["30%", "70%"];
    case "2":
    default:
      return ["50%", "50%"];
  }
}

function PreviewBlock({ section, compact = false }: { section: Section; compact?: boolean }) {
  if (section.type === "hero") return <HeroBlock section={section} />;
  if (section.type === "cta") return <CtaBlock section={section} />;
  if (section.type === "image") return <ImageBlock section={section} />;
  if (section.type === "program_card") return <ProgramBlock section={section} compact={compact} />;
  if (section.type === "event_block") return <EventBlock section={section} compact={compact} />;
  if (section.type === "cards") return <CardsBlock section={section} />;
  return <TextBlock section={section} compact={compact} />;
}

function HeroBlock({ section }: { section: Section }) {
  return (
    <section
      data-section-id={section.id}
      className="relative px-6 py-24 md:py-32 text-center text-white overflow-hidden"
      style={{ background: "linear-gradient(160deg,#2a003a,#0d0010)" }}
    >
      {section.image_url && (
        <img src={section.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      )}
      <div className="relative z-10 max-w-3xl mx-auto">
        {section.title && <h1 data-field="title" className="font-serif text-4xl md:text-6xl font-semibold leading-tight">{section.title}</h1>}
        {section.subtitle && <p data-field="subtitle" className="text-lg text-white/75 max-w-2xl mx-auto mt-6">{section.subtitle}</p>}
        {section.body && <p data-field="body" className="text-white/65 max-w-2xl mx-auto mt-4 whitespace-pre-line">{section.body}</p>}
        <PreviewButton section={section} light />
      </div>
    </section>
  );
}

function TextBlock({ section, compact }: { section: Section; compact?: boolean }) {
  return (
    <section data-section-id={section.id} className={`container mx-auto px-6 lg:px-12 ${compact ? "py-8" : "py-16"}`}>
      <div className="max-w-3xl mx-auto">
        {section.title && <h2 data-field="title" className="font-serif text-3xl md:text-4xl font-semibold text-primary">{section.title}</h2>}
        {section.subtitle && <p data-field="subtitle" className="mt-3 text-lg text-muted-foreground">{section.subtitle}</p>}
        {section.body && <p data-field="body" className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
        <PreviewButton section={section} />
      </div>
    </section>
  );
}

function CardsBlock({ section }: { section: Section }) {
  return (
    <section data-section-id={section.id} className="bg-secondary/40 px-6 lg:px-12 py-16">
      <div className="container mx-auto text-center max-w-4xl">
        {section.title && <h2 data-field="title" className="font-serif text-3xl md:text-4xl font-semibold text-primary">{section.title}</h2>}
        {section.subtitle && <p data-field="subtitle" className="mt-3 text-lg text-muted-foreground">{section.subtitle}</p>}
        {section.body && <p data-field="body" className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
      </div>
    </section>
  );
}

function CtaBlock({ section }: { section: Section }) {
  return (
    <section data-section-id={section.id} className="px-6 lg:px-12 py-16 text-center bg-[#F6E8F0]">
      {section.title && <h2 data-field="title" className="font-serif text-3xl md:text-4xl font-semibold text-primary">{section.title}</h2>}
      {section.subtitle && <p data-field="subtitle" className="mt-3 text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>}
      {section.body && <p data-field="body" className="mt-5 text-foreground/75 max-w-2xl mx-auto whitespace-pre-line">{section.body}</p>}
      <PreviewButton section={section} />
    </section>
  );
}

function ImageBlock({ section }: { section: Section }) {
  return (
    <section data-section-id={section.id} className="px-6 lg:px-12 py-12">
      {section.image_url ? (
        <img src={section.image_url} alt={section.title ?? ""} className="max-w-5xl w-full max-h-[560px] object-cover mx-auto rounded-2xl" />
      ) : (
        <div className="max-w-5xl h-64 mx-auto rounded-2xl bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground">
          No image selected
        </div>
      )}
      {section.title && <p data-field="title" className="text-center text-sm italic text-muted-foreground mt-4">{section.title}</p>}
    </section>
  );
}

function ProgramBlock({ section, compact }: { section: Section; compact?: boolean }) {
  return (
    <section data-section-id={section.id} className={`px-6 lg:px-12 ${compact ? "py-6" : "py-12"}`}>
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {section.image_url && <img src={section.image_url} alt="" className="w-full h-64 object-cover" />}
        <div className="p-8">
          {section.title && <h2 data-field="title" className="font-serif text-3xl font-semibold text-primary">{section.title}</h2>}
          {section.subtitle && <p data-field="subtitle" className="mt-3 font-semibold text-muted-foreground">{section.subtitle}</p>}
          {section.body && <p data-field="body" className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
          <PreviewButton section={section} />
        </div>
      </div>
    </section>
  );
}

function EventBlock({ section, compact }: { section: Section; compact?: boolean }) {
  return (
    <section data-section-id={section.id} className={`px-6 lg:px-12 ${compact ? "py-6" : "py-12"}`}>
      <div className="max-w-4xl mx-auto bg-card border-l-4 border-primary rounded-r-2xl p-8 shadow-sm">
        {section.title && <h2 data-field="title" className="font-serif text-3xl font-semibold text-primary">{section.title}</h2>}
        {section.subtitle && <p data-field="subtitle" className="mt-3 font-semibold text-muted-foreground">{section.subtitle}</p>}
        {section.body && <p data-field="body" className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
        <PreviewButton section={section} />
      </div>
    </section>
  );
}

function PreviewButton({ section, light = false }: { section: Section; light?: boolean }) {
  if (!section.button_label) return null;
  return (
    <a
      data-field="button_label"
      href={section.button_url ?? "#"}
      className={`inline-block mt-7 font-semibold px-7 py-3 rounded-lg transition ${
        light ? "bg-[#C9A227] text-[#121212]" : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      {section.button_label}
    </a>
  );
}
