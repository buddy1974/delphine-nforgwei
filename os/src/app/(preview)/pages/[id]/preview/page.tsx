import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OS_BRANDS, type OsBrand } from "@/lib/brands";
import type { SectionRow } from "@/lib/db/pages";

export const dynamic = "force-dynamic";

const SECTION_COLS =
  "id, page_id, type, title, subtitle, body, image_url, button_label, button_url, order, parent_id, col, layout";

/* ── Vanilla JS bridge injected into the preview iframe ─────── */
// Handles two-way postMessage communication with PageEditor.
// Runs as plain script — no React, no build step required.
const BRIDGE_SCRIPT = `(function () {
  var editMode = false;

  /* Receive messages from parent editor */
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data !== 'object') return;

    if (e.data.type === 'EDIT_MODE') {
      editMode = !!e.data.enabled;
      document.body.classList.toggle('os-edit-mode', editMode);
      document.querySelectorAll('[data-editable]').forEach(function (el) {
        el.contentEditable = editMode ? 'true' : 'false';
        el.spellcheck = false;
      });
    }

    if (e.data.type === 'HIGHLIGHT_SECTION') {
      var target = document.querySelector('[data-section-wrapper="' + e.data.sectionId + '"]');
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.querySelectorAll('.os-section-selected').forEach(function (w) {
        w.classList.remove('os-section-selected');
      });
      target.classList.add('os-section-selected');
    }
  });

  /* Click: select section + field in editor (always active) */
  document.addEventListener('click', function (e) {
    /* In edit mode: block nav links so user stays in preview */
    if (editMode) {
      var link = e.target.closest('a[href]');
      if (link && !link.dataset.sectionId) {
        e.preventDefault();
        return;
      }
    }

    var el = e.target.closest('[data-section-id]');
    if (!el) return;

    /* Prevent link navigation when editing a button label */
    if (el.tagName === 'A' && el.dataset.field === 'button_label') e.preventDefault();

    window.parent.postMessage({
      type: 'SECTION_CLICK',
      sectionId: el.dataset.sectionId,
      field: el.dataset.field || 'title',
    }, '*');

    /* Highlight the section wrapper */
    document.querySelectorAll('.os-section-selected').forEach(function (w) {
      w.classList.remove('os-section-selected');
    });
    var wrapper = el.dataset.sectionWrapper
      ? el
      : el.closest('[data-section-wrapper]');
    if (wrapper) wrapper.classList.add('os-section-selected');
  });

  /* Input: send live text changes to editor (debounced 600ms) */
  var inputTimers = {};
  document.addEventListener('input', function (e) {
    if (!editMode) return;
    var el = e.target.closest('[data-section-id][data-field]');
    if (!el) return;
    var key = el.dataset.sectionId + '.' + el.dataset.field;
    clearTimeout(inputTimers[key]);
    inputTimers[key] = setTimeout(function () {
      window.parent.postMessage({
        type: 'FIELD_CHANGE',
        sectionId: el.dataset.sectionId,
        field: el.dataset.field,
        value: el.innerText.replace(/\\n/g, ' ').trim(),
      }, '*');
    }, 600);
  });

  /* Prevent Enter from inserting <br> / <div> in contenteditable fields */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.contentEditable === 'true') {
      e.preventDefault();
    }
  });
})();`;

/* ── CSS for edit mode overlays ─────────────────────────────── */
const EDIT_CSS = `
[data-section-id] { cursor: pointer; }
[data-editable] {
  border-radius: 3px;
  outline: 2px solid transparent;
  outline-offset: 3px;
  transition: outline-color 0.12s;
}
.os-edit-mode [data-editable] { cursor: text; }
.os-edit-mode [data-editable]:hover { outline-color: rgba(91,26,93,0.3); }
.os-edit-mode [data-editable]:focus,
.os-edit-mode [data-editable]:focus-within { outline-color: #5B1A5D; }
[data-section-wrapper] { transition: box-shadow 0.18s; }
.os-section-selected { box-shadow: 0 0 0 3px rgba(91,26,93,0.18) !important; border-radius: 4px; }
`;

/* ══════════════════════════════════════════════════════════════ */

export default async function DraftPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const db = createSupabaseAdminClient();

  const { data: page } = await db
    .from("pages")
    .select("id, brand_key, slug, title, status")
    .eq("id", params.id)
    .single();
  if (!page) notFound();

  const { data: sections } = await db
    .from("sections")
    .select(SECTION_COLS)
    .eq("page_id", params.id)
    .order("order", { ascending: true });

  const { data: brandPages } = await db
    .from("pages")
    .select("id, slug, title")
    .eq("brand_key", page.brand_key)
    .order("title", { ascending: true });

  const brand = OS_BRANDS.find((b) => b.key === page.brand_key) ?? OS_BRANDS[0];
  const rows = (sections ?? []) as SectionRow[];
  const navPages = (brandPages ?? []) as { id: string; slug: string; title: string }[];

  // H6B.1: separate top-level sections from row children.
  // Legacy sections have parent_id=null, so they all fall into topLevel — no regression.
  const childMap = new Map<string, SectionRow[]>();
  for (const s of rows) {
    if (s.parent_id) {
      const bucket = childMap.get(s.parent_id) ?? [];
      bucket.push(s);
      childMap.set(s.parent_id, bucket);
    }
  }
  const topLevel = rows.filter((s) => !s.parent_id);

  const statusColor =
    page.status === "published" ? "#4ade80"
    : page.status === "review"  ? "#fbbf24"
    : "#94a3b8";

  const ff = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: ff }}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: EDIT_CSS }} />

      {/* ── Draft badge (fixed, z-999) ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        background: "#0d0010", display: "flex", alignItems: "center",
        gap: 10, padding: "5px 16px", fontSize: 11, fontWeight: 600,
        color: "#fff", fontFamily: ff,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: brand.accent, flexShrink: 0 }} />
        <span style={{ opacity: 0.8 }}>{brand.name}</span>
        <span style={{ color: "#ffffff30" }}>·</span>
        <span style={{ fontFamily: "monospace", color: "#ffffff55", fontSize: 10 }}>/{page.slug}</span>
        <span style={{ color: "#ffffff30" }}>·</span>
        <span style={{
          background: `${statusColor}25`, color: statusColor,
          borderRadius: 4, padding: "1px 6px", fontSize: 9,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
        }}>{page.status}</span>
        <span style={{ marginLeft: "auto", color: "#ffffff25", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Draft preview
        </span>
      </div>

      {/* ── Content (offset for fixed badge) ── */}
      <div style={{ paddingTop: 28 }}>

        {/* ── Website header (sticky below badge) ── */}
        <header style={{
          position: "sticky", top: 28, zIndex: 100,
          background: brand.accent, fontFamily: ff,
        }}>
          <div style={{
            maxWidth: 1200, margin: "0 auto", padding: "0 32px",
            height: 64, display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 24,
          }}>
            <a href={`/pages/${params.id}/preview`} style={{
              fontSize: 20, fontWeight: 800, color: "#fff",
              textDecoration: "none", letterSpacing: "-0.03em", flexShrink: 0,
            }}>{brand.shortName}</a>
            {navPages.length > 0 && (
              <nav style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                {navPages.map((p) => (
                  <a key={p.id} href={`/pages/${p.id}/preview`} style={{
                    fontSize: 13,
                    fontWeight: p.id === params.id ? 700 : 500,
                    color: p.id === params.id ? "#fff" : "rgba(255,255,255,0.65)",
                    textDecoration: "none", padding: "6px 12px", borderRadius: 8,
                    background: p.id === params.id ? "rgba(255,255,255,0.15)" : "transparent",
                  }}>{p.title}</a>
                ))}
              </nav>
            )}
          </div>
        </header>

        {/* ── Page sections ── */}
        <main style={{ minHeight: "60vh" }}>
          {topLevel.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: "50vh", color: "#9ca3af", fontFamily: ff,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#374151", marginBottom: 4 }}>No sections yet</p>
              <p style={{ fontSize: 13 }}>Add sections from the editor to preview them here.</p>
            </div>
          ) : topLevel.map((s) =>
              s.type === "row" ? (
                <RowRenderer
                  key={s.id}
                  row={s}
                  children={childMap.get(s.id) ?? []}
                  brand={brand}
                />
              ) : (
                <SectionBlock key={s.id} section={s} brand={brand} />
              )
            )}
        </main>

        {/* ── Website footer ── */}
        <footer style={{ background: "#0d0010", color: "rgba(255,255,255,0.55)", fontFamily: ff, padding: "48px 32px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 40, flexWrap: "wrap", marginBottom: 40 }}>
              <div>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6 }}>{brand.name}</p>
                <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                  {brand.domain} ↗
                </a>
              </div>
              {navPages.length > 0 && (
                <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Pages</p>
                  {navPages.map((p) => (
                    <a key={p.id} href={`/pages/${p.id}/preview`} style={{
                      fontSize: 13, textDecoration: "none",
                      fontWeight: p.id === params.id ? 700 : 400,
                      color: p.id === params.id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                    }}>{p.title}</a>
                  ))}
                </nav>
              )}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              © {brand.name}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* ── postMessage bridge script ── */}
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: BRIDGE_SCRIPT }} />
    </div>
  );
}

/* ══ H6B.1: Row / column layout renderer ════════════════════════ */

/**
 * Converts a layout spec string to an array of CSS width values,
 * one entry per column.
 */
function layoutToWidths(layout: string | null): string[] {
  switch (layout) {
    case "1":     return ["100%"];
    case "3":     return ["33.333%", "33.333%", "33.334%"];
    case "70-30": return ["70%", "30%"];
    case "30-70": return ["30%", "70%"];
    case "2":
    default:      return ["50%", "50%"];
  }
}

/**
 * Renders a row section as a flex row with columns.
 * Children are sorted by col index, then by order within each col.
 * Falls back gracefully when a column has no children.
 */
function RowRenderer({
  row,
  children,
  brand,
}: {
  row: SectionRow;
  children: SectionRow[];
  brand: OsBrand;
}) {
  const colWidths = layoutToWidths(row.layout);

  return (
    <div
      data-section-wrapper={row.id}
      data-section-id={row.id}
      style={{ display: "flex", width: "100%", alignItems: "flex-start" }}
    >
      {colWidths.map((width, colIdx) => {
        const colChildren = children
          .filter((c) => c.col === colIdx)
          .sort((a, b) => a.order - b.order);

        return (
          <div key={colIdx} style={{ width, flexShrink: 0, minWidth: 0, overflow: "hidden" }}>
            {colChildren.map((s) => (
              <SectionBlock key={s.id} section={s} brand={brand} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ══ Section renderers with data attributes for click-to-edit ═══ */

function SectionBlock({ section, brand }: { section: SectionRow; brand: OsBrand }) {
  const ff = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
  switch (section.type) {
    case "hero":         return <HeroSection s={section} brand={brand} ff={ff} />;
    case "text":         return <TextSection s={section} ff={ff} />;
    case "cards":        return <CardsSection s={section} brand={brand} ff={ff} />;
    case "cta":          return <CtaSection s={section} brand={brand} ff={ff} />;
    case "image":        return <ImageSection s={section} ff={ff} />;
    case "event_block":  return <EventSection s={section} brand={brand} ff={ff} />;
    case "program_card": return <ProgramSection s={section} brand={brand} ff={ff} />;
    default:             return null;
  }
}

type P = { s: SectionRow; brand: OsBrand; ff: string };
type T = { s: SectionRow; ff: string };

/* ── Banner (hero) ── */
function HeroSection({ s, brand, ff }: P) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{
        position: "relative", padding: "100px 32px 90px", textAlign: "center",
        background: `linear-gradient(145deg, ${brand.accent}18 0%, ${brand.accent}08 60%, #fff 100%)`,
        overflow: "hidden", fontFamily: ff,
      }}
    >
      {s.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image_url} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.13,
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
        {s.title && (
          <h1
            data-section-id={s.id} data-field="title" data-editable=""
            style={{
              fontSize: "clamp(2.25rem,5vw,4rem)", fontWeight: 800,
              color: "#0f172a", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 20,
            }}
          >{s.title}</h1>
        )}
        {s.subtitle && (
          <p
            data-section-id={s.id} data-field="subtitle" data-editable=""
            style={{ fontSize: "1.125rem", color: "#64748b", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 36px" }}
          >{s.subtitle}</p>
        )}
        {s.body && (
          <p
            data-section-id={s.id} data-field="body" data-editable=""
            style={{ fontSize: "1rem", color: "#94a3b8", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px", whiteSpace: "pre-wrap" }}
          >{s.body}</p>
        )}
        {s.button_label && (
          <a
            href={s.button_url ?? "#"}
            data-section-id={s.id} data-field="button_label" data-editable=""
            style={{
              display: "inline-block", background: brand.accent, color: "#fff",
              padding: "15px 36px", borderRadius: 12, fontWeight: 700,
              fontSize: "1rem", textDecoration: "none", letterSpacing: "-0.01em",
              boxShadow: `0 10px 30px ${brand.accent}45`,
            }}
          >{s.button_label}</a>
        )}
      </div>
    </div>
  );
}

/* ── Content (text) ── */
function TextSection({ s, ff }: T) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{ padding: "72px 32px", maxWidth: 800, margin: "0 auto", fontFamily: ff }}
    >
      {s.title && (
        <h2
          data-section-id={s.id} data-field="title" data-editable=""
          style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", marginBottom: 14, letterSpacing: "-0.02em" }}
        >{s.title}</h2>
      )}
      {s.subtitle && (
        <p
          data-section-id={s.id} data-field="subtitle" data-editable=""
          style={{ fontSize: "1.0625rem", fontWeight: 600, color: "#475569", marginBottom: 18 }}
        >{s.subtitle}</p>
      )}
      {s.body && (
        <p
          data-section-id={s.id} data-field="body" data-editable=""
          style={{ fontSize: "1.0625rem", color: "#64748b", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
        >{s.body}</p>
      )}
    </div>
  );
}

/* ── Cards ── */
function CardsSection({ s, brand, ff }: P) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{ padding: "72px 32px", background: "#f8fafc", fontFamily: ff }}
    >
      {(s.title || s.subtitle) && (
        <div style={{ textAlign: "center", marginBottom: 52, maxWidth: 600, margin: "0 auto 52px" }}>
          {s.title && (
            <h2
              data-section-id={s.id} data-field="title" data-editable=""
              style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 10 }}
            >{s.title}</h2>
          )}
          {s.subtitle && (
            <p
              data-section-id={s.id} data-field="subtitle" data-editable=""
              style={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.6 }}
            >{s.subtitle}</p>
          )}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 16, padding: 28,
            border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${brand.accent}18`, marginBottom: 18 }} />
            <div style={{ height: 14, background: "#e2e8f0", borderRadius: 6, width: "72%", marginBottom: 10 }} />
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5, width: "100%", marginBottom: 7 }} />
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5, width: "78%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Call to Action ── */
function CtaSection({ s, brand, ff }: P) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{ padding: "80px 32px", textAlign: "center", background: brand.accent, fontFamily: ff }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {s.title && (
          <h2
            data-section-id={s.id} data-field="title" data-editable=""
            style={{ fontSize: "2.25rem", fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-0.025em" }}
          >{s.title}</h2>
        )}
        {s.subtitle && (
          <p
            data-section-id={s.id} data-field="subtitle" data-editable=""
            style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.75)", marginBottom: 32, lineHeight: 1.65 }}
          >{s.subtitle}</p>
        )}
        {s.body && (
          <p
            data-section-id={s.id} data-field="body" data-editable=""
            style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: 28, lineHeight: 1.7, whiteSpace: "pre-wrap" }}
          >{s.body}</p>
        )}
        {s.button_label && (
          <a
            href={s.button_url ?? "#"}
            data-section-id={s.id} data-field="button_label" data-editable=""
            style={{
              display: "inline-block", background: "#fff", color: brand.accent,
              padding: "15px 36px", borderRadius: 12, fontWeight: 700,
              fontSize: "1rem", textDecoration: "none", letterSpacing: "-0.01em",
            }}
          >{s.button_label}</a>
        )}
      </div>
    </div>
  );
}

/* ── Photo (image) ── */
function ImageSection({ s, ff }: T) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{ padding: "48px 32px", fontFamily: ff }}
    >
      {s.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image_url} alt={s.title ?? ""} style={{
          width: "100%", maxHeight: 520, objectFit: "cover", borderRadius: 20, display: "block",
        }} />
      ) : (
        <div style={{
          width: "100%", height: 260, background: "#f1f5f9", borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#cbd5e1", fontSize: 14, fontWeight: 600,
        }}>No image selected</div>
      )}
      {s.title && (
        <p
          data-section-id={s.id} data-field="title" data-editable=""
          style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}
        >{s.title}</p>
      )}
    </div>
  );
}

/* ── Event ── */
function EventSection({ s, brand, ff }: P) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{ padding: "56px 32px", fontFamily: ff }}
    >
      <div style={{
        borderLeft: `4px solid ${brand.accent}`,
        background: "#f8fafc", borderRadius: "0 20px 20px 0",
        padding: "36px 36px 36px 32px", maxWidth: 800, margin: "0 auto",
      }}>
        {s.title && (
          <h3
            data-section-id={s.id} data-field="title" data-editable=""
            style={{ fontSize: "1.625rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}
          >{s.title}</h3>
        )}
        {s.subtitle && (
          <p
            data-section-id={s.id} data-field="subtitle" data-editable=""
            style={{ fontSize: "0.9375rem", color: "#64748b", fontWeight: 600, marginBottom: 16 }}
          >{s.subtitle}</p>
        )}
        {s.body && (
          <p
            data-section-id={s.id} data-field="body" data-editable=""
            style={{ fontSize: "0.9375rem", color: "#64748b", lineHeight: 1.75, marginBottom: 24, whiteSpace: "pre-wrap" }}
          >{s.body}</p>
        )}
        {s.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image_url} alt="" style={{
            width: "100%", borderRadius: 14, objectFit: "cover", maxHeight: 220, marginBottom: 24, display: "block",
          }} />
        )}
        {s.button_label && (
          <a
            href={s.button_url ?? "#"}
            data-section-id={s.id} data-field="button_label" data-editable=""
            style={{
              display: "inline-block", background: brand.accent, color: "#fff",
              padding: "13px 30px", borderRadius: 10, fontWeight: 700,
              fontSize: "0.9375rem", textDecoration: "none",
            }}
          >{s.button_label}</a>
        )}
      </div>
    </div>
  );
}

/* ── Program ── */
function ProgramSection({ s, brand, ff }: P) {
  return (
    <div
      data-section-wrapper={s.id}
      data-section-id={s.id}
      style={{ padding: "48px 32px", background: "#f8fafc", fontFamily: ff }}
    >
      <div style={{
        background: "#fff", borderRadius: 20,
        border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        overflow: "hidden", maxWidth: 720, margin: "0 auto",
      }}>
        {s.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image_url} alt="" style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} />
        )}
        <div style={{ padding: 36 }}>
          {s.title && (
            <h3
              data-section-id={s.id} data-field="title" data-editable=""
              style={{ fontSize: "1.625rem", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}
            >{s.title}</h3>
          )}
          {s.subtitle && (
            <p
              data-section-id={s.id} data-field="subtitle" data-editable=""
              style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#64748b", marginBottom: 16 }}
            >{s.subtitle}</p>
          )}
          {s.body && (
            <p
              data-section-id={s.id} data-field="body" data-editable=""
              style={{ fontSize: "0.9375rem", color: "#64748b", lineHeight: 1.75, marginBottom: 28, whiteSpace: "pre-wrap" }}
            >{s.body}</p>
          )}
          {s.button_label && (
            <a
              href={s.button_url ?? "#"}
              data-section-id={s.id} data-field="button_label" data-editable=""
              style={{
                display: "inline-block", background: brand.accent, color: "#fff",
                padding: "13px 30px", borderRadius: 10, fontWeight: 700,
                fontSize: "0.9375rem", textDecoration: "none",
              }}
            >{s.button_label}</a>
          )}
        </div>
      </div>
    </div>
  );
}
