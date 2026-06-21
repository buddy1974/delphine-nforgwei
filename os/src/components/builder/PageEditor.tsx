"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useBrand } from "@/components/BrandProvider";
import SectionCard from "./SectionCard";
import SortableSectionItem from "./SortableSectionItem";
import RowItem from "./RowItem";
import LayoutPicker from "./LayoutPicker";
import VersionHistory from "./VersionHistory";
import {
  SECTION_TYPES,
  SECTION_TYPE_LABEL,
  SECTION_ICONS,
  ROW_LAYOUTS,
  type PageRow,
  type SectionRow,
  type SectionPatch,
  type SectionType,
  type PageStatus,
  type RowLayout,
  PAGE_STATUSES,
} from "@/lib/db/pages";
import {
  updateSection,
  addSection,
  deleteSection,
  duplicateSection,
  batchReorderSections,
  updatePageMeta,
  createRow,
  updateRowLayout,
  duplicateRow,
  moveToSlot,
  moveToRoot,
  reorderRowChildren,
} from "@/app/(shell)/pages/actions";

/* ── Drag overlay cards ──────────────────────────────────────── */
function OverlayCard({ section, index }: { section: SectionRow; index: number }) {
  const isRow = section.type === "row";
  return (
    <div className={`flex items-center gap-2 bg-white rounded-xl border shadow-2xl px-3 py-2.5 cursor-grabbing opacity-95 select-none ${
      isRow ? "border-plum/50 shadow-plum/25" : "border-plum/40 shadow-plum/20"
    }`}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true" className="text-gray-400 flex-shrink-0">
        <circle cx="2" cy="2" r="1.5" fill="currentColor" />
        <circle cx="8" cy="2" r="1.5" fill="currentColor" />
        <circle cx="2" cy="8" r="1.5" fill="currentColor" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="2" cy="14" r="1.5" fill="currentColor" />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
      </svg>
      <span className="text-base leading-none" aria-hidden="true">{SECTION_ICONS[section.type]}</span>
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold bg-plum/10 text-plum flex-shrink-0">
        {index + 1}
      </span>
      <span className="text-xs font-semibold text-plum truncate">
        {section.title || SECTION_TYPE_LABEL[section.type]}
      </span>
    </div>
  );
}

/* ── Types ───────────────────────────────────────────────────── */
type PreviewMsg =
  | { type: "SECTION_CLICK"; sectionId: string; field: string }
  | { type: "FIELD_CHANGE"; sectionId: string; field: string; value: string };

/* ═══════════════════════════════════════════════════════════════ */

export default function PageEditor({
  page,
  initialSections,
}: {
  page: PageRow;
  initialSections: SectionRow[];
}) {
  const { brand } = useBrand();
  const [sections, setSections] = useState<SectionRow[]>(initialSections);
  const [status, setStatus] = useState<PageStatus>(page.status);
  const [title, setTitle] = useState(page.title);
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSections.find((s) => !s.parent_id)?.id ?? null
  );
  const [showHistory, setShowHistory] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  // ── Row creation modal ─────────────────────────────────────
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  // ── Preview iframe ─────────────────────────────────────────
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditModeRef = useRef(false);
  const selectedIdRef = useRef<string | null>(selectedId);
  const [isEditMode, setIsEditMode] = useState(false);
  const inlineSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Drag state ─────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<SectionRow | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ── Derived ── */
  const topLevel = sections.filter((s) => !s.parent_id).sort((a, b) => a.order - b.order);
  const childMap = new Map<string, SectionRow[]>();
  for (const s of sections) {
    if (s.parent_id) {
      const arr = childMap.get(s.parent_id) ?? [];
      arr.push(s);
      childMap.set(s.parent_id, arr);
    }
  }
  const rows = topLevel.filter((s) => s.type === "row");
  const availableRows = rows.map((r, i) => ({
    id: r.id,
    layout: r.layout as RowLayout | null,
    label: `Row ${i + 1}${r.layout ? ` (${r.layout})` : ""}`,
  }));

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;
  const activeSectionIndex = topLevel.findIndex((s) => s.id === activeSection?.id);

  /* ── Preview helpers ── */
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
    if (!on) bumpPreview(true);
  }
  function selectSection(id: string | null) {
    selectedIdRef.current = id;
    setSelectedId(id);
    if (id) sendToIframe({ type: "HIGHLIGHT_SECTION", sectionId: id });
  }
  function onIframeLoad() {
    setPreviewLoading(false);
    if (isEditModeRef.current) sendToIframe({ type: "EDIT_MODE", enabled: true });
    if (selectedIdRef.current) sendToIframe({ type: "HIGHLIGHT_SECTION", sectionId: selectedIdRef.current });
  }

  /* ── postMessage ── */
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const msg = e.data as PreviewMsg | null;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "SECTION_CLICK") {
        selectedIdRef.current = msg.sectionId;
        setSelectedId(msg.sectionId);
      }
      if (msg.type === "FIELD_CHANGE") {
        const { sectionId, field, value } = msg;
        setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, [field]: value } : s));
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
  }, []);

  /* ── Section handlers ── */
  // P1D.5: return the updateSection result so AutoField can show "Save failed"
  async function handleSave(id: string, patch: SectionPatch) {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
    const result = await updateSection(id, patch);
    if ("ok" in result) bumpPreview();
    return result;
  }
  async function handleAdd(type: SectionType) {
    setAdding(false);
    const created = await addSection(page.id, type);
    setSections((prev) => [...prev, created]);
    selectSection(created.id);
    bumpPreview(true);
  }
  async function handleDelete(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id && s.parent_id !== id));
    if (selectedId === id) {
      const next = sections.find((s) => s.id !== id && !s.parent_id)?.id ?? null;
      selectSection(next);
    }
    await deleteSection(id);
    bumpPreview(true);
  }
  async function handleDuplicateSection(id: string) {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    if (s.parent_id) {
      // duplicate within slot
      const result = await duplicateSection(id, page.id);
      if ("error" in result) return;
      setSections((prev) => {
        const srcIdx = prev.findIndex((x) => x.id === id);
        if (srcIdx === -1) return prev;
        const updated = prev.map((x, i) => i > srcIdx && x.parent_id === s.parent_id && x.col === s.col ? { ...x, order: x.order + 1 } : x);
        updated.splice(srcIdx + 1, 0, { ...s, id: result.id });
        return updated;
      });
    } else {
      const result = await duplicateSection(id, page.id);
      if ("error" in result) return;
      setSections((prev) => {
        const srcIdx = prev.findIndex((x) => x.id === id);
        const updated = prev.map((x, i) => i > srcIdx && !x.parent_id ? { ...x, order: x.order + 1 } : x);
        updated.splice(srcIdx + 1, 0, { ...s, id: result.id, order: s.order + 1 });
        return updated;
      });
    }
    selectSection(id);
    bumpPreview(true);
  }

  async function handleStatus(next: PageStatus) {
    setStatus(next);
    await updatePageMeta(page.id, { status: next });
    bumpPreview(true);
  }
  async function handleTitleBlur() {
    if (title.trim() && title !== page.title) {
      await updatePageMeta(page.id, { title: title.trim() });
      bumpPreview();
    }
  }

  /* ── Row handlers ── */
  async function handleCreateRow(layout: RowLayout) {
    const row = await createRow(page.id, layout);
    setSections((prev) => [...prev, row]);
    selectSection(row.id);
    bumpPreview(true);
  }

  async function handleChangeRowLayout(rowId: string, layout: RowLayout) {
    setSections((prev) => prev.map((s) => s.id === rowId ? { ...s, layout } : s));
    await updateRowLayout(rowId, layout);
    bumpPreview();
  }

  async function handleMoveRow(rowId: string, dir: -1 | 1) {
    const tl = sections.filter((s) => !s.parent_id).sort((a, b) => a.order - b.order);
    const i = tl.findIndex((s) => s.id === rowId);
    const j = i + dir;
    if (j < 0 || j >= tl.length) return;
    const reordered = arrayMove(tl, i, j).map((s, idx) => ({ ...s, order: idx }));
    setSections((prev) => [...prev.filter((s) => s.parent_id), ...reordered]);
    await batchReorderSections(reordered.map((s) => ({ id: s.id, order: s.order })));
    bumpPreview();
  }

  async function handleDuplicateRow(rowId: string) {
    const result = await duplicateRow(rowId, page.id);
    setSections((prev) => {
      const srcIdx = prev.findIndex((s) => s.id === rowId);
      const updated = prev.map((s, i) => i > srcIdx && !s.parent_id ? { ...s, order: s.order + 1 } : s);
      updated.splice(srcIdx + 1, 0, result.row, ...result.children);
      return updated;
    });
    bumpPreview(true);
  }

  async function handleDeleteRow(rowId: string) {
    setSections((prev) => prev.filter((s) => s.id !== rowId && s.parent_id !== rowId));
    if (selectedId === rowId || sections.find((s) => s.id === selectedId)?.parent_id === rowId) {
      selectSection(null);
    }
    await deleteSection(rowId);
    bumpPreview(true);
  }

  async function handleMoveToRoot(sectionId: string) {
    const fresh = await moveToRoot(sectionId, page.id);
    setSections(fresh);
    selectSection(sectionId);
    bumpPreview(true);
  }

  async function handleMoveToSlot(sectionId: string, rowId: string, col: number) {
    const fresh = await moveToSlot(sectionId, rowId, col);
    setSections(fresh);
    selectSection(sectionId);
    bumpPreview(true);
  }

  /* ── Drag handlers ── */
  function handleDragStart(event: DragStartEvent) {
    const found = sections.find((s) => s.id === event.active.id);
    setActiveSection(found ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    setDragOverId((event.over?.id as string) ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveSection(null);
    setDragOverId(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current as { container?: string; col?: number; type?: string } | undefined;
    const overData = over.data.current as { container?: string; col?: number; type?: string } | undefined;

    const activeSec = sections.find((s) => s.id === activeId);
    if (!activeSec) return;

    const sourceContainer = activeData?.container ?? (activeSec.parent_id ?? "root");

    // Determine target container and col
    let targetContainer = "root";
    let targetCol: number | undefined;

    if (overId.startsWith("slot:")) {
      const parts = overId.split(":");
      targetContainer = parts[1];
      targetCol = parseInt(parts[2], 10);
    } else {
      const overSec = sections.find((s) => s.id === overId);
      if (overSec) {
        targetContainer = overData?.container ?? (overSec.parent_id ?? "root");
        if (targetContainer !== "root") targetCol = overData?.col ?? overSec.col ?? 0;
      }
    }

    // ── Case 1: Root → Root (reorder top-level) ──
    if (sourceContainer === "root" && targetContainer === "root") {
      const tl = sections.filter((s) => !s.parent_id).sort((a, b) => a.order - b.order);
      const oldIdx = tl.findIndex((s) => s.id === activeId);
      const newIdx = tl.findIndex((s) => s.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(tl, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));
      setSections((prev) => [...prev.filter((s) => s.parent_id), ...reordered]);
      await batchReorderSections(reordered.map((s) => ({ id: s.id, order: s.order })));
      bumpPreview();
      return;
    }

    // ── Case 2: Same row, same col reorder ──
    if (
      sourceContainer !== "root" &&
      targetContainer !== "root" &&
      sourceContainer === targetContainer
    ) {
      const rowKids = sections
        .filter((s) => s.parent_id === sourceContainer)
        .sort((a, b) => a.order - b.order);
      const oldIdx = rowKids.findIndex((s) => s.id === activeId);
      const newIdx = rowKids.findIndex((s) => s.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(rowKids, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));
      setSections((prev) => [...prev.filter((s) => s.parent_id !== sourceContainer), ...reordered]);
      await reorderRowChildren(reordered.map((s) => ({ id: s.id, col: s.col ?? 0, order: s.order })));
      bumpPreview();
      return;
    }

    // ── Case 3: Into a slot (root→slot or slot→different slot) ──
    if (targetContainer !== "root" && targetCol !== undefined) {
      const fresh = await moveToSlot(activeId, targetContainer, targetCol);
      setSections(fresh);
      selectSection(activeId);
      bumpPreview(true);
      return;
    }

    // ── Case 4: Slot → Root ──
    if (sourceContainer !== "root" && targetContainer === "root") {
      const fresh = await moveToRoot(activeId, page.id);
      setSections(fresh);
      selectSection(activeId);
      bumpPreview(true);
    }
  }

  async function handleDragCancel() {
    setActiveSection(null);
    setDragOverId(null);
  }

  /* ── Render ── */
  return (
    <div className="flex -mx-8 -my-8 min-h-[calc(100vh-4rem)]">

      {/* ════════ LEFT: Draft preview ════════ */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden min-w-0">
        {/* Browser chrome */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-400/50" />
            <span className="w-3 h-3 rounded-full bg-amber-400/50" />
            <span className="w-3 h-3 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: brand.accent }} />
            <span className="text-[11px] text-gray-400 font-mono truncate">{brand.domain}/{page.slug}</span>
            {previewLoading && <span className="text-[10px] text-amber-500 font-bold flex-shrink-0 ml-auto">Refreshing…</span>}
          </div>
          <button
            type="button"
            onClick={() => toggleEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
              isEditMode ? "bg-plum text-white shadow shadow-plum/30" : "border border-gray-200 text-gray-500 hover:border-plum/40 hover:text-plum"
            }`}
          >
            {isEditMode ? "✏ Editing" : "👁 Preview"}
          </button>
          <Link href="/pages" className="text-[11px] text-gray-400 hover:text-charcoal transition-colors flex-shrink-0">← Pages</Link>
          <a href={`/pages/${page.id}/preview`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 hover:text-plum transition-colors flex-shrink-0">↗</a>
        </div>

        {/* iframe */}
        <div className="flex-1 relative">
          {isEditMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-plum text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none select-none">
              Click any text to edit · Click again to type
            </div>
          )}
          <iframe
            ref={iframeRef}
            key={previewVersion}
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pages/${page.id}/preview?v=${previewVersion}`}
            title="Draft page preview"
            className="absolute inset-0 w-full h-full border-none bg-white"
            onLoad={onIframeLoad}
          />
          {previewLoading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-plum/20 z-10 overflow-hidden">
              <div className="h-full bg-plum w-2/3 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* ════════ RIGHT: Controls ════════ */}
      <div className="w-96 flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0 gap-2">
          <Link href="/pages" className="text-xs font-semibold text-gray-500 hover:text-charcoal flex items-center gap-1 flex-shrink-0">← Pages</Link>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] text-gray-400">Status</span>
            <select
              value={status}
              onChange={(e) => handleStatus(e.target.value as PageStatus)}
              className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-plum/20"
            >
              {PAGE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Page title */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-200 bg-white flex-shrink-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-[15px] font-bold text-charcoal bg-transparent border border-transparent hover:border-gray-200 focus:border-plum/40 rounded-lg px-2 py-1 focus:outline-none"
          />
          <p className="text-[11px] text-gray-400 px-2 mt-0.5">/{page.slug} · autosaves</p>
        </div>

        {/* Page Map + section editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 pt-4 pb-2">

            {/* Map header */}
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Page Map</p>
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <span className="text-[9px] font-bold text-plum bg-plum/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Click preview to select
                  </span>
                )}
                {topLevel.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded((v) => !v)}
                    className="text-[10px] font-semibold text-gray-400 hover:text-charcoal transition-colors"
                  >
                    {isMapExpanded ? "Collapse" : "Expand"}
                  </button>
                )}
              </div>
            </div>

            {topLevel.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-5">No sections yet — add one below</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext
                  items={topLevel.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0.5">
                    {topLevel.map((s, i) => {
                      if (s.type === "row") {
                        const rowIndex = rows.indexOf(s);
                        return (
                          <RowItem
                            key={s.id}
                            row={s}
                            index={rowIndex}
                            totalRows={rows.length}
                            children={childMap.get(s.id) ?? []}
                            isExpanded={isMapExpanded}
                            dragOverId={dragOverId}
                            selectedSectionId={selectedId}
                            availableRows={availableRows}
                            onSelectSection={selectSection}
                            onMoveToRoot={handleMoveToRoot}
                            onDuplicateSection={handleDuplicateSection}
                            onDeleteSection={handleDelete}
                            onMoveToSlot={handleMoveToSlot}
                            onChangeLayout={(layout) => handleChangeRowLayout(s.id, layout)}
                            onMoveRow={(dir) => handleMoveRow(s.id, dir)}
                            onDuplicateRow={() => handleDuplicateRow(s.id)}
                            onDeleteRow={() => handleDeleteRow(s.id)}
                          />
                        );
                      }
                      return (
                        <SortableSectionItem
                          key={s.id}
                          section={s}
                          index={i}
                          isSelected={selectedId === s.id}
                          isExpanded={isMapExpanded}
                          onSelect={selectSection}
                          onDuplicate={handleDuplicateSection}
                          onDelete={handleDelete}
                          availableRows={availableRows}
                          onMoveToSlot={handleMoveToSlot}
                        />
                      );
                    })}
                  </div>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                  {activeSection && (
                    <OverlayCard
                      section={activeSection}
                      index={activeSectionIndex >= 0 ? activeSectionIndex : 0}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Selected section editor */}
          {selectedSection && !["row"].includes(selectedSection.type) && (
            <div className="px-3 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2 mt-3">Edit section</p>
              <SectionCard
                section={selectedSection}
                index={sections.findIndex((s) => s.id === selectedId)}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          )}

          {/* Add section + Add row */}
          <div className="px-3 pb-4 flex gap-2">
            {/* Add section */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setAdding((v) => !v)}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-xs font-bold text-gray-500 hover:border-plum/40 hover:text-plum transition-colors"
              >
                + Section
              </button>
              {adding && (
                <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-2 gap-1 z-20">
                  {SECTION_TYPES.filter((t) => t !== "row").map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAdd(t)}
                      className="text-left text-xs px-3 py-2 rounded-lg hover:bg-blush/60 text-charcoal font-medium"
                    >
                      {SECTION_TYPE_LABEL[t]}
                    </button>
                  ))}
                  <button type="button" onClick={() => setAdding(false)} className="col-span-2 text-center text-[11px] text-gray-400 hover:text-gray-600 py-1">Cancel</button>
                </div>
              )}
            </div>

            {/* Add row */}
            <button
              type="button"
              onClick={() => setShowLayoutPicker(true)}
              className="flex-shrink-0 border-2 border-dashed border-plum/30 rounded-xl py-2.5 px-3 text-xs font-bold text-plum/60 hover:border-plum/60 hover:text-plum transition-colors"
              title="Add a multi-column row"
            >
              ⬜ Row
            </button>
          </div>
        </div>

        {/* Version history */}
        <div className="px-3 py-3 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-charcoal border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            <span>🕐</span> Version history
          </button>
        </div>
      </div>

      {/* Layout picker for new rows */}
      {showLayoutPicker && (
        <LayoutPicker
          onSelect={handleCreateRow}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}

      {/* Version history slide-over */}
      {showHistory && (
        <VersionHistory
          pageId={page.id}
          pageTitle={title}
          currentSections={sections}
          onRestored={(restored) => {
            setSections(restored);
            selectSection(restored.find((s) => !s.parent_id)?.id ?? null);
            bumpPreview(true);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
