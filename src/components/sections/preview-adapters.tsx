/**
 * P1E — Shared preview adapter layer (rendering plane).
 *
 * Section-type → component-props mapping, field parsing, and switch routing
 * extracted verbatim from OsPreview so the adapter logic is reusable across
 * brands. Visual components remain brand-specific and are NOT merged here —
 * only the adapter/routing logic and the generic fallback renderer live in
 * this module. Behaviour is identical to P1D.
 */
import {
  HeroSection,
  AboutSection,
  ProgramsSection,
  BooksSection,
  EventsSection,
  GallerySection,
  ContactSection,
  TransformationSection,
  TestimonialsSection,
  EcosystemSection,
} from "@/components/sections";
import type { ProgramItem } from "@/components/sections";

export type Section = {
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

// ── Mapping helpers ────────────────────────────────────────────────────────────

function mapToHeroProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    body: s.body ?? undefined,
    image_url: s.image_url ?? undefined,
    button_label: s.button_label ?? undefined,
    button_url: s.button_url ?? undefined,
  };
}

function mapToAboutProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    body: s.body ?? undefined,
    image_url: s.image_url ?? undefined,
    button_label: s.button_label ?? undefined,
    button_url: s.button_url ?? undefined,
  };
}

function mapToProgramsProps(s: Section) {
  let items: ProgramItem[] | undefined;
  if (s.body) {
    try {
      const parsed = JSON.parse(s.body);
      if (Array.isArray(parsed)) items = parsed as ProgramItem[];
    } catch {
      // Not JSON — use default items
    }
  }
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    button_label: s.button_label ?? undefined,
    button_url: s.button_url ?? undefined,
    items,
  };
}

function mapToBooksProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    button_label: s.button_label ?? undefined,
    button_url: s.button_url ?? undefined,
  };
}

function mapToEventsProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    body: s.body ?? undefined,
    button_label: s.button_label ?? undefined,
    button_url: s.button_url ?? undefined,
  };
}

function mapToGalleryProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
  };
}

function mapToContactProps(s: Section) {
  return {
    title: s.title ?? undefined,
    body: s.body ?? undefined,
    button_label: s.button_label ?? undefined,
    button_url: s.button_url ?? undefined,
  };
}

function mapToTransformationProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    body: s.body ?? undefined,
  };
}

function mapToTestimonialsProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
  };
}

function mapToEcosystemProps(s: Section) {
  return {
    title: s.title ?? undefined,
    subtitle: s.subtitle ?? undefined,
    body: s.body ?? undefined,
  };
}

// ── Delphine brand renderer ───────────────────────────────────────────────────

function renderDelphineSection(section: Section) {
  switch (section.type) {
    case "hero":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="hero">
          <HeroSection sectionId={section.id} {...mapToHeroProps(section)} />
        </div>
      );
    case "text":
    case "about":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="about">
          <AboutSection sectionId={section.id} {...mapToAboutProps(section)} />
        </div>
      );
    case "cards":
    case "programs":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="programs">
          <ProgramsSection sectionId={section.id} {...mapToProgramsProps(section)} />
        </div>
      );
    case "program_card":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="program_card">
          <ProgramsSection
            sectionId={section.id}
            title={section.title ?? undefined}
            subtitle={section.subtitle ?? undefined}
            items={[
              {
                title: section.title ?? "Program",
                description: section.body ?? "",
                slug: section.button_url?.replace(/.*program=/, "") || undefined,
                external: section.button_url?.startsWith("http") ? section.button_url : undefined,
              },
            ]}
          />
        </div>
      );
    case "books":
    case "book":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="books">
          <BooksSection sectionId={section.id} {...mapToBooksProps(section)} />
        </div>
      );
    case "event_block":
    case "events":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="events">
          <EventsSection sectionId={section.id} {...mapToEventsProps(section)} />
        </div>
      );
    case "image":
    case "gallery":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="gallery">
          <GallerySection sectionId={section.id} {...mapToGalleryProps(section)} />
        </div>
      );
    case "cta":
    case "contact":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="contact">
          <ContactSection sectionId={section.id} {...mapToContactProps(section)} />
        </div>
      );
    case "transformation":
    case "framework":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="transformation">
          <TransformationSection sectionId={section.id} {...mapToTransformationProps(section)} />
        </div>
      );
    case "testimonials":
    case "testimonial":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="testimonials">
          <TestimonialsSection sectionId={section.id} {...mapToTestimonialsProps(section)} />
        </div>
      );
    case "ecosystem":
      return (
        <div key={section.id} data-section-id={section.id} data-section-type="ecosystem">
          <EcosystemSection sectionId={section.id} {...mapToEcosystemProps(section)} />
        </div>
      );
    default:
      return null;
  }
}

/**
 * Brand-aware section router. Delphine sections route through the real
 * brand components; all other brands fall back to the generic block renderer.
 */
export function renderSection(section: Section, brand: string | undefined) {
  if (brand === "delphine") {
    const result = renderDelphineSection(section);
    if (result !== null) return result;
  }
  return (
    section.type === "row"
      ? null
      : <PreviewBlock key={section.id} section={section} />
  );
}

// ── Generic fallback renderer (non-Delphine brands + unmapped types) ──────────

export function RowBlock({ row, children, brand }: { row: Section; children: Section[]; brand: string }) {
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
    case "1":   return ["100%"];
    case "3":   return ["33.333%", "33.333%", "33.334%"];
    case "70-30": return ["70%", "30%"];
    case "30-70": return ["30%", "70%"];
    case "2":
    default:    return ["50%", "50%"];
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
        {section.title && <h1 data-field="title" data-editable="true" data-section-id={section.id} className="font-serif text-4xl md:text-6xl font-semibold leading-tight">{section.title}</h1>}
        {section.subtitle && <p data-field="subtitle" data-editable="true" data-section-id={section.id} className="text-lg text-white/75 max-w-2xl mx-auto mt-6">{section.subtitle}</p>}
        {section.body && <p data-field="body" data-editable="true" data-section-id={section.id} className="text-white/65 max-w-2xl mx-auto mt-4 whitespace-pre-line">{section.body}</p>}
        <PreviewButton section={section} light />
      </div>
    </section>
  );
}

function TextBlock({ section, compact }: { section: Section; compact?: boolean }) {
  return (
    <section data-section-id={section.id} className={`container mx-auto px-6 lg:px-12 ${compact ? "py-8" : "py-16"}`}>
      <div className="max-w-3xl mx-auto">
        {section.title && <h2 data-field="title" data-editable="true" data-section-id={section.id} className="font-serif text-3xl md:text-4xl font-semibold text-primary">{section.title}</h2>}
        {section.subtitle && <p data-field="subtitle" data-editable="true" data-section-id={section.id} className="mt-3 text-lg text-muted-foreground">{section.subtitle}</p>}
        {section.body && <p data-field="body" data-editable="true" data-section-id={section.id} className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
        <PreviewButton section={section} />
      </div>
    </section>
  );
}

function CardsBlock({ section }: { section: Section }) {
  return (
    <section data-section-id={section.id} className="bg-secondary/40 px-6 lg:px-12 py-16">
      <div className="container mx-auto text-center max-w-4xl">
        {section.title && <h2 data-field="title" data-editable="true" data-section-id={section.id} className="font-serif text-3xl md:text-4xl font-semibold text-primary">{section.title}</h2>}
        {section.subtitle && <p data-field="subtitle" data-editable="true" data-section-id={section.id} className="mt-3 text-lg text-muted-foreground">{section.subtitle}</p>}
        {section.body && <p data-field="body" data-editable="true" data-section-id={section.id} className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
      </div>
    </section>
  );
}

function CtaBlock({ section }: { section: Section }) {
  return (
    <section data-section-id={section.id} className="px-6 lg:px-12 py-16 text-center bg-[#F6E8F0]">
      {section.title && <h2 data-field="title" data-editable="true" data-section-id={section.id} className="font-serif text-3xl md:text-4xl font-semibold text-primary">{section.title}</h2>}
      {section.subtitle && <p data-field="subtitle" data-editable="true" data-section-id={section.id} className="mt-3 text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>}
      {section.body && <p data-field="body" data-editable="true" data-section-id={section.id} className="mt-5 text-foreground/75 max-w-2xl mx-auto whitespace-pre-line">{section.body}</p>}
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
      {section.title && <p data-field="title" data-editable="true" data-section-id={section.id} className="text-center text-sm italic text-muted-foreground mt-4">{section.title}</p>}
    </section>
  );
}

function ProgramBlock({ section, compact }: { section: Section; compact?: boolean }) {
  return (
    <section data-section-id={section.id} className={`px-6 lg:px-12 ${compact ? "py-6" : "py-12"}`}>
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {section.image_url && <img src={section.image_url} alt="" className="w-full h-64 object-cover" />}
        <div className="p-8">
          {section.title && <h2 data-field="title" data-editable="true" data-section-id={section.id} className="font-serif text-3xl font-semibold text-primary">{section.title}</h2>}
          {section.subtitle && <p data-field="subtitle" data-editable="true" data-section-id={section.id} className="mt-3 font-semibold text-muted-foreground">{section.subtitle}</p>}
          {section.body && <p data-field="body" data-editable="true" data-section-id={section.id} className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
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
        {section.title && <h2 data-field="title" data-editable="true" data-section-id={section.id} className="font-serif text-3xl font-semibold text-primary">{section.title}</h2>}
        {section.subtitle && <p data-field="subtitle" data-editable="true" data-section-id={section.id} className="mt-3 font-semibold text-muted-foreground">{section.subtitle}</p>}
        {section.body && <p data-field="body" data-editable="true" data-section-id={section.id} className="mt-5 text-foreground/75 leading-relaxed whitespace-pre-line">{section.body}</p>}
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
      data-editable="true"
      data-section-id={section.id}
      href={section.button_url ?? "#"}
      className={`inline-block mt-7 font-semibold px-7 py-3 rounded-lg transition ${
        light ? "bg-[#C9A227] text-[#121212]" : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
      onClick={(e) => e.preventDefault()}
    >
      {section.button_label}
    </a>
  );
}
