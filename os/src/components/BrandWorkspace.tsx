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
  saveVersion,
  listVersions,
  publishVersion,
  unpublishPage,
  verifyPublishedVersion,
} from "@/app/(shell)/pages/actions";
import SectionCard from "./builder/SectionCard";
import { SECTION_TYPE_LABEL } from "@/lib/db/pages";
import { createPreviewSession } from "@/app/(shell)/preview/actions";
import type { PreviewInboundMsg } from "@/lib/preview-bridge";

/* ── postMessage types from preview iframe (shared P1E contract) ── */
type PreviewMsg = PreviewInboundMsg;

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

  /* ── P1D.2: Inline autosave state ── */
  type InlineSaveState = "idle" | "saving" | "saved" | "failed";
  const [inlineSaveState, setInlineSaveState] = useState<InlineSaveState>("idle");
  const inlineSaveClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* ── P1D.4: Seq counter — guards stale save responses from overwriting newer state ── */
  const latestSaveSeq = useRef(0);

  /* ── Publish ── */
  const [publishPending, startPublish] = useTransition();

  /* ── P1C: Publish verification state ── */
  type VerifyState = "idle" | "verifying" | "confirmed" | "stale" | "failed";
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [publishedVersionId, setPublishedVersionId] = useState<string | null>(null);

  /* ── Save Draft ── */
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

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
    // P1D: handshake — tell iframe our origin and current edit state
    sendToIframe({ type: "PREVIEW_INIT", origin: window.location.origin, editMode: isEditModeRef.current });
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

      if (msg.type === "PREVIEW_READY") {
        // Iframe confirmed handshake — diagnostic only
        console.debug("[BrandWorkspace] PREVIEW_READY received from", e.origin);
      }

      if (msg.type === "SECTION_CLICK") {
        selectedIdRef.current = msg.sectionId;
        setSelectedSectionId(msg.sectionId);
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
          // P1D.4: monotonic seq — each save request owns a unique seq number.
          // Stale responses (earlier seq) silently discard their state updates.
          const seq = (latestSaveSeq.current += 1);
          setInlineSaveState("saving");
          try {
            // P1D.3: updateSection returns { ok: true } | { error: string } — never throws on DB error.
            const result = await updateSection(sectionId, { [field as keyof SectionPatch]: value });
            // P1D.4: discard if a newer save has started since this one was awaited
            if (seq !== latestSaveSeq.current) return;
            if ("error" in result) {
              setInlineSaveState("failed");
            } else {
              setInlineSaveState("saved");
              // Clear "Saved ✓" badge after 2.5s — but only if no newer save has fired by then
              if (inlineSaveClearTimer.current) clearTimeout(inlineSaveClearTimer.current);
              inlineSaveClearTimer.current = setTimeout(() => {
                if (seq === latestSaveSeq.current) setInlineSaveState("idle");
              }, 2500);
              // P1D.2: refresh canvas so changes appear without manual reload
              bumpPreview(true);
            }
          } catch {
            // P1D.4: discard stale network errors too
            if (seq !== latestSaveSeq.current) return;
            setInlineSaveState("failed");
          } finally {
            delete inlineSaveTimers.current[key];
          }
        }, 700);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      // P1D.1: clear pending inline-save debounce timers — prevent late updateSection calls after unmount
      Object.values(inlineSaveTimers.current).forEach(clearTimeout);
      inlineSaveTimers.current = {};
      // P1D.2: clear save-state clear timer
      if (inlineSaveClearTimer.current) clearTimeout(inlineSaveClearTimer.current);
    };
  }, []);

  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    if (brand.previewMode !== "secure") return;

    let active = true;
    const currentPage = pagesRef.current.find((p) => p.id === selectedPageId);
    setPreviewLoading(true);
    setSecurePreviewError(null);

    createPreviewSession(
      brand.key,
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
  // P1D.5: return the updateSection result so AutoField can show "Save failed"
  async function handleSave(id: string, patch: SectionPatch) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    const result = await updateSection(id, patch);
    if ("ok" in result) bumpPreview();
    return result;
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

  /* ── P1C: Publish exact revision (snapshot → publish → verify) ── */
  function handlePublish() {
    startPublish(async () => {
      setVerifyState("idle");
      const currentPage = pagesRef.current.find((p) => p.id === selectedPageId);
      const pageTitle = currentPage?.title ?? "Published";
      const pageSlug = currentPage?.slug;

      // 1. Snapshot current sections into an immutable page_versions row
      await saveVersion(selectedPageId, pageTitle, sectionsRef.current, "Published");

      // 2. Fetch the just-created version id (newest first)
      const versions = await listVersions(selectedPageId);
      const latest = versions[0];
      if (!latest) {
        await updatePageMeta(selectedPageId, { status: "published" });
        setPageStatus("published");
        bumpPreview(true);
        return;
      }

      // 3. Publish that exact immutable version — sets pages.published_version_id
      const result = await publishVersion(selectedPageId, latest.id);
      if ("error" in result) {
        console.error("publishVersion failed:", result.error);
        await updatePageMeta(selectedPageId, { status: "published" });
        setPageStatus("published");
        bumpPreview(true);
        return;
      }

      setPageStatus("published");
      setPublishedVersionId(result.publishedVersionId);
      bumpPreview(true);

      // 4. Verify live content (2s delay for Vercel revalidation to propagate)
      if (pageSlug) {
        setVerifyState("verifying");
        await new Promise<void>((r) => setTimeout(r, 2000));
        const verification = await verifyPublishedVersion(brand.key, pageSlug, result.publishedVersionId);
        if ("error" in verification) {
          setVerifyState("failed");
        } else if (verification.verified) {
          setVerifyState("confirmed");
          setTimeout(() => setVerifyState("idle"), 8000);
        } else {
          setVerifyState("stale");
        }
      }
    });
  }

  /* ── Unpublish ── */
  const [unpublishPending, startUnpublish] = useTransition();

  function handleUnpublish() {
    startUnpublish(async () => {
      await unpublishPage(selectedPageId);
      setPageStatus("draft");
      setPublishedVersionId(null);
      setVerifyState("idle");
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

        {/* Page tabs */}
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

          <Link
            href={`/${brand.key}/pages`}
            className="flex-shrink-0 text-[11px] text-gray-500 hover:text-plum px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors font-semibold"
            title="Add page"
          >
            + Page
          </Link>

          <Link
            href={`/${brand.key}/blog`}
            className="flex-shrink-0 text-[11px] text-gray-500 hover:text-plum px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors font-semibold"
            title="Add blog post"
          >
            + Post
          </Link>

          <Link
            href={`/${brand.key}/events`}
            className="flex-shrink-0 text-[11px] text-gray-500 hover:text-plum px-2 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-plum/40 transition-colors font-semibold"
            title="Add event"
          >
            + Event
          </Link>

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
            {draftSaved ? "Saved" : draftSaving ? "Saving..." : "Save Draft"}
          </button>

          {/* History */}
          <Link
            href={`/${brand.key}/pages/${selectedPageId}`}
            className="text-[11px] font-semibold text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 hover:text-plum transition-colors"
            title="Version history"
          >
            History
          </Link>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Edit Mode toggle */}
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

          {/* P1D.2: Inline autosave indicator */}
          {inlineSaveState === "saving" && (
            <span className="text-[10px] font-semibold text-amber-600 animate-pulse">Saving...</span>
          )}
          {inlineSaveState === "saved" && (
            <span className="text-[10px] font-bold text-green-700">Saved ✓</span>
          )}
          {inlineSaveState === "failed" && (
            <span
              className="text-[10px] font-bold text-red-600"
              title="Autosave failed — check connection and retry"
            >
              Save failed
            </span>
          )}

          {/* P1C: Verification indicator */}
          {verifyState === "verifying" && (
            <span className="text-[10px] font-semibold text-amber-600 animate-pulse">
              Verifying...
            </span>
          )}
          {verifyState === "confirmed" && (
            <span
              className="text-[10px] font-bold text-green-700"
              title={publishedVersionId ? `Live version ${publishedVersionId}` : "Live"}
            >
              Live OK
            </span>
          )}
          {verifyState === "stale" && (
            <span
              className="text-[10px] font-bold text-amber-600"
              title="CDN may be stale - refresh in 30s"
            >
              Stale
            </span>
          )}
          {verifyState === "failed" && (
            <span className="text-[10px] font-bold text-red-600" title="Verification failed">
              Verify err
            </span>
          )}

          {/* Publish / Unpublish */}
          {pageStatus !== "published" ? (
            <button
              type="button"
              disabled={publishPending}
              onClick={handlePublish}
              className="text-[11px] font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {publishPending ? "Publishing..." : "Publish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={unpublishPending}
              onClick={handleUnpublish}
              className="text-[11px] font-semibold border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:border-red-200 hover:text-red-600 disabled:opacity-60 transition-colors"
              title="Move page back to draft"
            >
              {unpublishPending ? "Reverting..." : "Unpublish"}
            </button>
          )}
        </div>
      </div>

      {/* Canvas + Inspector */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Website canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-100">

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
            {brand.previewMode === "secure" && securePreviewError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white px-6 text-center">
                <div>
                  <p className="text-sm font-bold text-red-600">Secure preview unavailable</p>
                  <p className="mt-2 max-w-md text-xs leading-5 text-gray-500">{securePreviewError}</p>
                </div>
              </div>
            ) : brand.previewMode === "secure" && !securePreviewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white text-xs font-semibold text-gray-400">
                Creating secure preview...
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                key={brand.previewMode === "secure" ? securePreviewVersionId ?? selectedPageId : `${selectedPageId}-${previewVersion}`}
                src={
                  brand.previewMode === "secure" && securePreviewUrl
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

        {/* Inspector panel */}
        {inspectorOpen && selectedSection && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">

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
                X
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <SectionCard
                section={selectedSection}
                index={sections.findIndex((s) => s.id === selectedSectionId)}
                onSave={handleSave}
                onDelete={handleDeleteSection}
              />
            </div>

            <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200 bg-white">
              <Link
                href={`/${brand.key}/pages/${selectedPageId}`}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-plum border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                Open Page Editor
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
