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
import { SECTION_TYPE_LABEL } from "@/lib/db/pages";
import { saveVersion } from "@/app/(shell)/pages/actions";
import { createDelphinePreviewSession } from "@/app/(shell)/preview/actions";

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
  const [securePreviewUrl, setSecurePreviewUrl] = useState<string | null>(null);
  const [securePreviewVersionId, setSecurePreviewVersionId] = useState<string | null>(null);
  const [securePreviewError, setSecurePreviewError] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditModeRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);
  const sectionsRef = useRef<SectionRow[]>(initialSections);
  const pagesRef = useRef(pages);
  const previewOriginRef = useRef<string | null>(null);

  /* ── Inline save debounce ── */
  const inlineSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /* ── Publish ── */
  const [publishPending, startPublish] = useTransition();

  /* ── Save Draft ── */
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  /* ── Version History panel ── */
  const [historyOpen, setHistoryOpen] = useState(false);

  /* ── Helpers ── */

  function sendToIframe(msg: Record<string, unknown>) {
    iframeRef.current?.contentWindow?.postMessage(
      msg,
      previewOriginRef.current ?? window.location.origin
    );
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
      if (e.origin !== window.location.origin && e.origin !== previewOriginRef.current) return;
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

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    if (brand.key !== "delphine") return;

    let active = true;
    const currentPage = pagesRef.current.find((p) => p.id === selectedPageId);
    setPreviewLoading(true);
    setSecurePreviewError(null);

    createDelphinePreviewSession(
      selectedPageId,
      currentPage?.title ?? "Preview",
      sectionsRef.current
    ).then((result) => {
      if (!active) return;
      if ("error" in result) {
        setSecurePreviewUrl(null);
        setSecurePreviewVersionId(null);
        previewOriginRef.current = null;
        setSecurePreviewError(result.error);
      } else {
        setSecurePreviewUrl(result.previewUrl);
        setSecurePreviewVersionId(result.pageVersionId);
        previewOriginRef.current = new URL(result.previewUrl).origin;
      }
      setPreviewLoading(false);
    });

    return () => {
      active = false;
    };
  }, [brand.key, previewVersion, selectedPageId]);

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

  /* ── Save Draft (version snapshot) ── */
  async function handleSaveDraft() {
    setDraftSaving(true);
    try {
      const currentPage = pages.find((p) => p.id === selectedPageId);
      await saveVersion(selectedPageId, currentPage?.title ?? "Draft", sections);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } finally {
      setDraftSaving(false);
    }
  }

  /* ── Publish ── */
  function handlePublish() {
    startPublish(async () => {
      await updatePageMeta(selectedPageId, { status: "published" });
      setPageStatus("published");
      bumpPreview(true);
    });
  }

  /* ── Unpublish ── */
  const [unpublishPending, startUnpublish] = useTransition();

  function handleUnpublish() {
    startUnpublish(async () => {
      await updatePageMeta(selectedPageId, { status: "draft" });
      setPageStatus("draft");
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
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 h-12 flex items-center gap-2 overflow-hidden">

        {/* Brand label */}
        <div className="flex items-center gap-2 flex-shrink-0 border-r border-gray-200 pr-3 mr-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: brand.accent }}
          />
          <span className="text-xs font-bold text-charcoal">{brand.shortName}</span>
        </div>

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
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">

          {/* Add Page */}
          <Link
            href={`/${brand.key}/pages`}
            className="flex-shrink-0 text-[11px] text-gray-500 hover:text-plum px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors font-semibold"
            title="Add page"
          >
            + Page
          </Link>

          {/* Add Blog Post */}
          <Link
            href={`/${brand.key}/blog`}
            className="flex-shrink-0 text-[11px] text-gray-500 hover:text-plum px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors font-semibold"
            title="Add blog post"
          >
            + Post
          </Link>

          {/* Add Event */}
          <Link
            href={`/${brand.key}/events`}
            className="flex-shrink-0 text-[11px] text-gray-500 hover:text-plum px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors font-semibold"
            title="Add event"
          >
            + Event
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Status badge */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
              STATUS_STYLE[pageStatus] ?? STATUS_STYLE.draft
            }`}
          >
            {pageStatus}
          </span>

          {/* Save Draft */}
          <button
            type="button"
            disabled={draftSaving}
            onClick={handleSaveDraft}
            className="text-[11px] font-semibold text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Save a version snapshot"
          >
            {draftSaved ? "Saved" : draftSaving ? "Saving…" : "Save Draft"}
          </button>

          {/* History */}
          <Link
            href={`/${brand.key}/pages/${selectedPageId}`}
            className="text-[11px] font-semibold text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 hover:text-plum transition-colors"
            title="Version history"
          >
            History
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Edit Mode / Preview Mode toggle */}
          <button
            type="button"
            onClick={() => toggleEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
              isEditMode
                ? "bg-plum text-white shadow shadow-plum/25"
                : "border border-gray-200 text-gray-500 hover:border-plum/40 hover:text-plum"
            }`}
          >
            {isEditMode ? "Exit Edit Mode" : "Edit Sections"}
          </button>

          {/* Publish / Unpublish */}
          {pageStatus !== "published" ? (
            <button
              type="button"
              disabled={publishPending}
              onClick={handlePublish}
              className="text-[11px] font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {publishPending ? "Publishing…" : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={unpublishPending}
              onClick={handleUnpublish}
              className="text-[11px] font-semibold border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:border-red-200 hover:text-red-600 disabled:opacity-60 transition-colors"
              title="Move page back to draft"
            >
              {unpublishPending ? "Reverting…" : "Unpublish"}
            </button>
          )}
        </div>
      </div>

      {/* ══ Canvas + Inspector ══ */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Website canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-100">

          {/* Click-to-edit hint — always visible so users know the canvas is interactive */}
          {!selectedSection && (
            <div className={`flex-shrink-0 py-1.5 px-4 text-center text-[11px] font-semibold select-none ${isEditMode ? "bg-plum/90 text-white" : "bg-amber-50 text-amber-700 border-b border-amber-200"}`}>
              {isEditMode
                ? "Click any section on the canvas to open its editor"
                : "Click any section on the canvas below to edit it"}
            </div>
          )}

          {/* Iframe */}
          <div className="flex-1 relative">
            {(previewLoading || loadingPage) && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-plum/20 z-10 overflow-hidden">
                <div className="h-full bg-plum w-2/3 animate-pulse" />
              </div>
            )}
            {brand.key === "delphine" && securePreviewError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white px-6 text-center">
                <div>
                  <p className="text-sm font-bold text-red-600">Secure preview unavailable</p>
                  <p className="mt-2 max-w-md text-xs leading-5 text-gray-500">{securePreviewError}</p>
                </div>
              </div>
            ) : brand.key === "delphine" && !securePreviewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white text-xs font-semibold text-gray-400">
                Creating secure preview…
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                key={brand.key === "delphine" ? securePreviewVersionId ?? selectedPageId : `${selectedPageId}-${previewVersion}`}
                src={
                  brand.key === "delphine" && securePreviewUrl
                    ? securePreviewUrl
                    : `${BP}/pages/${selectedPageId}/preview?v=${previewVersion}`
                }
                title="Website visual preview"
                className="absolute inset-0 w-full h-full border-none bg-white"
                onLoad={onIframeLoad}
              />
            )}
          </div>
        </div>

        {/* Inspector panel — slides in when editing a section ── */}
        {inspectorOpen && selectedSection && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">

            {/* Inspector header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
              <p className="text-xs font-bold text-charcoal">
                {SECTION_TYPE_LABEL[selectedSection.type] ?? "Section"}
              </p>
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

            {/* Bottom: open page editor */}
            <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200 bg-white">
              <Link
                href={`/${brand.key}/pages/${selectedPageId}`}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-plum border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                Open Page Editor ↗
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
