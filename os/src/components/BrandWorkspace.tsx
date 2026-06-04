"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { type OsBrand } from "@/lib/brands";
import {
  type PageRow,
  type SectionRow,
  type SectionPatch,
  type PageStatus,
} from "@/lib/db/pages";
import {
  getPage,
  updateSection,
  updatePageMeta,
  deleteSection,
} from "@/app/(shell)/pages/actions";
import SectionCard from "./builder/SectionCard";

/* ── postMessage types from preview iframe ─────────────────── */
type PreviewMsg =
  | { type: "SECTION_CLICK"; sectionId: string; field: string }
  | { type: "FIELD_CHANGE"; sectionId: string; field: string; value: string };

const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* ── Status badge styles ─────────────────────────────────────── */
const STATUS_STYLE: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  review:    "bg-amber-100 text-amber-700",
  draft:     "bg-gray-100 text-gray-500",
};

/* ═══════════════════════════════════════════════════════════════ */

export interface BrandWorkspaceProps {
  brand: OsBrand;
  pages: Pick<PageRow, "id" | "title" | "slug" | "status">[];
  initialPageId: string;
  initialSections: SectionRow[];
  initialStatus: PageStatus;
}

export default function BrandWorkspace({
  brand,
  pages,
  initialPageId,
  initialSections,
  initialStatus,
}: BrandWorkspaceProps) {
  /* ── Page state ── */
  const [selectedPageId, setSelectedPageId] = useState(initialPageId);
  const [sections, setSections] = useState<SectionRow[]>(initialSections);
  const [pageStatus, setPageStatus] = useState<PageStatus>(initialStatus);
  const [loadingPage, setLoadingPage] = useState(false);

  /* ── Edit/preview mode ── */
  const [isEditMode, setIsEditMode] = useState(false);

  /* ── Inspector: selected section ── */
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  /* ── Preview iframe ── */
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditModeRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);

  /* ── Inline save debounce ── */
  const inlineSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /* ── Publish ── */
  const [publishPending, startPublish] = useTransition();

  /* ── Helpers ── */

  function sendToIframe(msg: Record<string, unknown>) {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }

  function bumpPreview(force = false) {
    if (isEditModeRef.current && !force) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewLoading(true);
      setPreviewVersion((v) => v + 1);
    }, 400);
  }

  function toggleEditMode(on: boolean) {
    isEditModeRef.current = on;
    setIsEditMode(on);
    sendToIframe({ type: "EDIT_MODE", enabled: on });
    if (!on) {
      // Exiting edit mode: close inspector and refresh preview
      setSelectedSectionId(null);
      selectedIdRef.current = null;
      bumpPreview(true);
    }
  }

  function closeInspector() {
    setSelectedSectionId(null);
    selectedIdRef.current = null;
    sendToIframe({ type: "HIGHLIGHT_SECTION", sectionId: "" });
  }

  function onIframeLoad() {
    setPreviewLoading(false);
    if (isEditModeRef.current) sendToIframe({ type: "EDIT_MODE", enabled: true });
    if (selectedIdRef.current) {
      sendToIframe({ type: "HIGHLIGHT_SECTION", sectionId: selectedIdRef.current });
    }
  }

  /* ── postMessage bridge ── */
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const msg = e.data as PreviewMsg | null;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "SECTION_CLICK") {
        selectedIdRef.current = msg.sectionId;
        setSelectedSectionId(msg.sectionId);
        // Auto-enable edit mode when user clicks a section
        if (!isEditModeRef.current) {
          isEditModeRef.current = true;
          setIsEditMode(true);
          sendToIframe({ type: "EDIT_MODE", enabled: true });
        }
      }

      if (msg.type === "FIELD_CHANGE") {
        const { sectionId, field, value } = msg;
        setSections((prev) =>
          prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
        );
        const key = `${sectionId}.${field}`;
        if (inlineSaveTimers.current[key]) clearTimeout(inlineSaveTimers.current[key]);
        inlineSaveTimers.current[key] = setTimeout(async () => {
          await updateSection(sectionId, { [field as keyof SectionPatch]: value });
          delete inlineSaveTimers.current[key];
        }, 700);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []); // stable — uses refs for values

  /* ── Page switching ── */
  async function handlePageChange(pageId: string) {
    if (pageId === selectedPageId || loadingPage) return;
    setLoadingPage(true);
    closeInspector();

    const result = await getPage(pageId);
    if (result) {
      setSelectedPageId(pageId);
      setSections(result.sections);
      setPageStatus(result.page.status);
      setPreviewVersion((v) => v + 1);
    }
    setLoadingPage(false);
  }

  /* ── Section edit handlers (inspector) ── */
  async function handleSave(id: string, patch: SectionPatch) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    await updateSection(id, patch);
    bumpPreview();
  }

  async function handleDeleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) closeInspector();
    await deleteSection(id);
    bumpPreview(true);
  }

  /* ── Publish ── */
  function handlePublish() {
    startPublish(async () => {
      await updatePageMeta(selectedPageId, { status: "published" });
      setPageStatus("published");
      bumpPreview(true);
    });
  }

  /* ── Derived ── */
  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;
  const inspectorOpen = isEditMode && selectedSection !== null;

  /* ── Render ── */
  return (
    <div className="flex flex-col -mx-8 -my-8 min-h-[calc(100vh-3.5rem)]">

      {/* ══ Toolbar ══ */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 h-12 flex items-center gap-2 overflow-hidden">

        {/* Brand accent dot */}
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: brand.accent }}
        />

        {/* Page tabs — scroll if many pages */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto min-w-0 scrollbar-none">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePageChange(p.id)}
              disabled={loadingPage}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                p.id === selectedPageId
                  ? "bg-plum text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-charcoal disabled:opacity-60"
              }`}
            >
              {p.title}
            </button>
          ))}

          {/* Add Page link */}
          <Link
            href={`/${brand.key}/pages`}
            className="flex-shrink-0 text-xs text-gray-400 hover:text-plum px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors ml-1"
          >
            + Add page
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
              STATUS_STYLE[pageStatus] ?? STATUS_STYLE.draft
            }`}
          >
            {pageStatus}
          </span>

          {/* Edit / Preview toggle */}
          <button
            type="button"
            onClick={() => toggleEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              isEditMode
                ? "bg-plum text-white shadow shadow-plum/25"
                : "border border-gray-200 text-gray-500 hover:border-plum/40 hover:text-plum"
            }`}
          >
            {isEditMode ? "✏ Editing" : "👁 Preview"}
          </button>

          {/* Publish */}
          {pageStatus !== "published" && (
            <button
              type="button"
              disabled={publishPending}
              onClick={handlePublish}
              className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {publishPending ? "Publishing…" : "Publish"}
            </button>
          )}

          {/* Open full SP Page Builder */}
          <Link
            href={`/${brand.key}/pages/${selectedPageId}`}
            className="text-[11px] text-gray-400 hover:text-plum transition-colors border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold"
            title="Open full page editor"
          >
            Full editor ↗
          </Link>
        </div>
      </div>

      {/* ══ Canvas + Inspector ══ */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Website canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-100">

          {/* Edit mode hint */}
          {isEditMode && !selectedSection && (
            <div className="flex-shrink-0 py-1.5 px-4 bg-plum/90 text-white text-center text-[11px] font-semibold select-none">
              Click any text, image, or section to open the editor
            </div>
          )}

          {/* Iframe */}
          <div className="flex-1 relative">
            {(previewLoading || loadingPage) && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-plum/20 z-10 overflow-hidden">
                <div className="h-full bg-plum w-2/3 animate-pulse" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`${selectedPageId}-${previewVersion}`}
              src={`${BP}/pages/${selectedPageId}/preview?v=${previewVersion}`}
              title="Website visual preview"
              className="absolute inset-0 w-full h-full border-none bg-white"
              onLoad={onIframeLoad}
            />
          </div>
        </div>

        {/* Inspector panel — slides in when editing a section ── */}
        {inspectorOpen && selectedSection && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">

            {/* Inspector header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
              <p className="text-xs font-bold text-charcoal">Edit Section</p>
              <button
                type="button"
                onClick={closeInspector}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-gray-50 text-sm transition-colors"
                title="Close inspector"
              >
                ✕
              </button>
            </div>

            {/* Section fields */}
            <div className="flex-1 overflow-y-auto p-3">
              <SectionCard
                section={selectedSection}
                index={sections.findIndex((s) => s.id === selectedSectionId)}
                onSave={handleSave}
                onDelete={handleDeleteSection}
              />
            </div>

            {/* Bottom: open full editor */}
            <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200 bg-white">
              <Link
                href={`/${brand.key}/pages/${selectedPageId}`}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-plum border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                Open full page editor ↗
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
