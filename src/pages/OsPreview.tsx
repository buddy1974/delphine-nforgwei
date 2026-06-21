import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { renderSection, RowBlock, type Section } from "@/components/sections/preview-adapters";
import type { PreviewInboundMsg } from "@/lib/preview-bridge";

const OS_URL = import.meta.env.VITE_OS_URL || "http://localhost:3100/os";

type PreviewData = {
  brand?: string;
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

// ── Main component ────────────────────────────────────────────────────────────

export default function OsPreview() {
  // P1E: brand comes from the route (/os-preview/:brand). Defaults to delphine
  // so the existing Delphine preview URL behaves exactly as before.
  const { brand: routeBrand } = useParams<{ brand: string }>();
  const brandKey = routeBrand ?? "delphine";

  const token = useMemo(() => new URLSearchParams(window.location.search).get("token"), []);
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<PreviewData | null>(null);

  // P1D: bridge state
  const trustedOriginRef = useRef<string>(new URL(OS_URL).origin);
  const editModeRef = useRef(false);
  const inputTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

    fetch(`${OS_URL}/api/preview/${brandKey}?token=${encodeURIComponent(token)}`, {
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
  }, [token, brandKey]);

  // P1D: Inbound message bridge — PREVIEW_INIT, EDIT_MODE, HIGHLIGHT_SECTION
  useEffect(() => {
    // P1D.1: the configured OS origin is the only origin allowed to control this iframe
    const configuredOsOrigin = new URL(OS_URL).origin;

    function handleMessage(e: MessageEvent) {
      // P1D.1: strict origin gate — reject any message not from the configured OS origin.
      // trustedOriginRef starts equal to configuredOsOrigin and is only ever set from
      // a PREVIEW_INIT that already passed this check, so both guards are equivalent.
      if (e.origin !== configuredOsOrigin && e.origin !== trustedOriginRef.current) return;

      if (!e.data || typeof e.data !== "object") return;
      const msg = e.data as { type: string; [k: string]: unknown };

      if (msg.type === "PREVIEW_INIT") {
        // P1D.1: PREVIEW_INIT must come from the statically configured OS origin only.
        // This prevents a rogue page that happens to load first from hijacking the bridge.
        if (e.origin !== configuredOsOrigin) return;
        // Update trustedOriginRef (will still equal configuredOsOrigin, but makes
        // the outbound postMessage target explicit and testable)
        trustedOriginRef.current = e.origin;
        const initEditMode = !!msg.editMode;
        editModeRef.current = initEditMode;
        document.body.classList.toggle("os-edit-mode", initEditMode);
        document.querySelectorAll("[data-editable]").forEach((el) => {
          (el as HTMLElement).contentEditable = initEditMode ? "true" : "false";
          (el as HTMLElement).spellcheck = false;
        });
        // Emit PREVIEW_READY back to parent
        window.parent.postMessage(
          { type: "PREVIEW_READY" } satisfies PreviewInboundMsg,
          trustedOriginRef.current
        );
        return;
      }

      if (msg.type === "EDIT_MODE") {
        const on = !!msg.enabled;
        editModeRef.current = on;
        document.body.classList.toggle("os-edit-mode", on);
        document.querySelectorAll("[data-editable]").forEach((el) => {
          (el as HTMLElement).contentEditable = on ? "true" : "false";
          (el as HTMLElement).spellcheck = false;
        });
        return;
      }

      if (msg.type === "HIGHLIGHT_SECTION") {
        const sectionId = msg.sectionId as string | undefined;
        // Clear all existing highlights
        document.querySelectorAll(".os-section-selected").forEach((el) => {
          el.classList.remove("os-section-selected");
        });
        if (!sectionId) return;
        // Find the section wrapper (first element with this section id, typically no data-field)
        const target = document.querySelector<HTMLElement>(
          `[data-section-id="${CSS.escape(sectionId)}"]:not([data-field])`
        ) ?? document.querySelector<HTMLElement>(`[data-section-id="${CSS.escape(sectionId)}"]`);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        target.classList.add("os-section-selected");
        return;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // P1D: Click handler — SECTION_CLICK + link guard in edit mode
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // In edit mode: prevent navigation links (but allow data-field elements to bubble)
      if (editModeRef.current) {
        const link = target.closest<HTMLAnchorElement>("a[href]");
        if (link && !link.dataset.field) {
          event.preventDefault();
        }
        const btn = target.closest<HTMLButtonElement>("button[type]");
        if (btn && !btn.dataset.field) {
          event.preventDefault();
        }
      }

      // Find nearest section
      const sectionEl = target.closest<HTMLElement>("[data-section-id]");
      if (!sectionEl) return;

      // Prefer field from closest [data-field] ancestor; fall back to "title"
      const fieldEl = target.closest<HTMLElement>("[data-field]");
      const field = fieldEl?.dataset.field ?? "title";

      window.parent.postMessage(
        {
          type: "SECTION_CLICK",
          sectionId: sectionEl.dataset.sectionId,
          field,
        } satisfies PreviewInboundMsg,
        trustedOriginRef.current
      );

      // Highlight clicked section wrapper
      document.querySelectorAll(".os-section-selected").forEach((el) => {
        el.classList.remove("os-section-selected");
      });
      const wrapper = sectionEl.dataset.field
        ? sectionEl.closest<HTMLElement>("[data-section-id]:not([data-field])")
        : sectionEl;
      if (wrapper) wrapper.classList.add("os-section-selected");
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // P1D: Input handler — FIELD_CHANGE (debounced 600ms)
  useEffect(() => {
    function handleInput(event: Event) {
      if (!editModeRef.current) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const fieldEl = target.closest<HTMLElement>("[data-field]");
      if (!fieldEl) return;
      const sectionEl = fieldEl.closest<HTMLElement>("[data-section-id]");
      if (!sectionEl) return;

      const sectionId = sectionEl.dataset.sectionId;
      const field = fieldEl.dataset.field;
      if (!sectionId || !field) return;

      const key = `${sectionId}.${field}`;
      clearTimeout(inputTimersRef.current[key]);
      inputTimersRef.current[key] = setTimeout(() => {
        window.parent.postMessage(
          {
            type: "FIELD_CHANGE",
            sectionId,
            field,
            value: fieldEl.innerText.replace(/\n/g, " ").trim(),
          } satisfies PreviewInboundMsg,
          trustedOriginRef.current
        );
        delete inputTimersRef.current[key];
      }, 600);
    }

    // Prevent Enter from inserting block elements in contenteditable
    function handleKeydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === "Enter" && target?.contentEditable === "true") {
        event.preventDefault();
      }
    }

    document.addEventListener("input", handleInput);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("input", handleInput);
      document.removeEventListener("keydown", handleKeydown);
      // P1D.1: clear pending debounce timers — prevent late FIELD_CHANGE posts after unmount
      Object.values(inputTimersRef.current).forEach(clearTimeout);
      inputTimersRef.current = {};
    };
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

  const brand = data.brand ?? brandKey;
  const isDelphine = brand === "delphine";

  return (
    <article data-page-version-id={data.page.versionId} className="bg-background">
      {/* Preview banner */}
      <div className="bg-accent/20 border-b border-border px-6 py-2 text-center text-xs font-semibold text-muted-foreground">
        Secure preview · immutable version {data.page.versionId}
      </div>

      {isDelphine && <Navbar />}

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
        <div className={isDelphine ? "pt-24" : ""}>
          {topLevel.map((section) =>
            section.type === "row" ? (
              <RowBlock key={section.id} row={section} children={childMap.get(section.id) ?? []} brand={brand} />
            ) : (
              renderSection(section, brand)
            )
          )}
        </div>
      )}

      {isDelphine && <Footer />}

      {/* P1D: Edit mode highlight style */}
      <style>{`
        .os-section-selected {
          outline: 2px solid hsl(288, 72%, 55%);
          outline-offset: -2px;
        }
        .os-edit-mode [data-editable="true"] {
          cursor: text;
          border-radius: 3px;
          transition: outline 0.15s;
        }
        .os-edit-mode [data-editable="true"]:hover {
          outline: 1px dashed hsl(288, 60%, 65%);
          outline-offset: 2px;
        }
        .os-edit-mode [data-editable="true"]:focus {
          outline: 2px solid hsl(288, 72%, 55%);
          outline-offset: 2px;
        }
      `}</style>
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
