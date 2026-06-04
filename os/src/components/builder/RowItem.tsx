"use client";

import { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  SECTION_ICONS,
  SECTION_TYPE_LABEL,
  type SectionRow,
  type RowLayout,
} from "@/lib/db/pages";
import LayoutPicker from "./LayoutPicker";

/* ── Layout metadata ─────────────────────────────────────────── */
const LAYOUT_LABEL: Record<RowLayout, string> = {
  "1":     "Full Width",
  "2":     "Side by Side",
  "3":     "Three Across",
  "70-30": "Big Left",
  "30-70": "Big Right",
};

function layoutNumCols(layout: RowLayout | null): number {
  if (layout === "3") return 3;
  if (layout === "1") return 1;
  return 2;
}

function colLabel(layout: RowLayout | null, col: number): string {
  if (layout === "70-30") return col === 0 ? "Left (wide)" : "Right (narrow)";
  if (layout === "30-70") return col === 0 ? "Left (narrow)" : "Right (wide)";
  if (layout === "3") return ["Left", "Center", "Right"][col] ?? `Col ${col + 1}`;
  return col === 0 ? "Left" : "Right";
}

/* ── 6-dot drag handle ────────────────────────────────────────── */
function DotGrid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="2" cy="2" r="1.5" fill="currentColor" />
      <circle cx="8" cy="2" r="1.5" fill="currentColor" />
      <circle cx="2" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="2" cy="14" r="1.5" fill="currentColor" />
      <circle cx="8" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ── Empty slot droppable ─────────────────────────────────────── */
function EmptySlot({ rowId, col, dragOverId }: { rowId: string; col: number; dragOverId: string | null }) {
  const slotId = `slot:${rowId}:${col}`;
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { type: "empty-slot", container: rowId, col },
  });

  const highlighted = isOver || dragOverId === slotId;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed px-2 py-3 text-center transition-all ${
        highlighted
          ? "border-plum/60 bg-plum/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <p className="text-[10px] text-gray-400">Drop here</p>
    </div>
  );
}

/* ── A section inside a slot (sortable) ─────────────────────────── */
function SlotSection({
  section,
  rowId,
  isSelected,
  onSelect,
  onMoveToRoot,
  onDuplicate,
  onDelete,
  availableRows,
  onMoveToSlot,
}: {
  section: SectionRow;
  rowId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveToRoot: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  availableRows: { id: string; layout: RowLayout | null; label: string }[];
  onMoveToSlot: (sectionId: string, targetRowId: string, col: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: "section", container: rowId, col: section.col },
  });

  const [showMenu, setShowMenu] = useState(false);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="h-9 rounded-lg border-2 border-dashed border-plum/30 bg-plum/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group/slot flex items-center gap-1 rounded-lg border transition-all ${
        isSelected
          ? "bg-white border-plum/30 shadow-sm"
          : "border-transparent hover:bg-white/70 hover:border-gray-200"
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Drag to reorder"
        className="flex-shrink-0 flex items-center justify-center w-5 h-8 text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <DotGrid />
      </button>

      {/* Icon + title */}
      <button
        type="button"
        onClick={() => onSelect(section.id)}
        className="flex-1 flex items-center gap-1.5 py-1.5 text-left min-w-0"
      >
        <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
          {SECTION_ICONS[section.type]}
        </span>
        <span className={`text-[11px] font-semibold truncate ${isSelected ? "text-plum" : "text-charcoal"}`}>
          {section.title || SECTION_TYPE_LABEL[section.type]}
        </span>
      </button>

      {/* Actions (visible on hover/selected) */}
      <div
        className={`flex items-center gap-0.5 pr-1 flex-shrink-0 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover/slot:opacity-100"
        }`}
      >
        {/* Move To menu */}
        <div className="relative">
          <button
            type="button"
            title="Move to…"
            onClick={() => setShowMenu((v) => !v)}
            className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-plum hover:bg-plum/5 text-[10px] font-bold transition-colors"
          >
            ↕
          </button>
          {showMenu && (
            <div
              className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 w-44"
              onMouseLeave={() => setShowMenu(false)}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">Move to…</p>
              <button
                type="button"
                onClick={() => { onMoveToRoot(section.id); setShowMenu(false); }}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 text-charcoal"
              >
                ↑ Extract to page
              </button>
              {availableRows.filter(r => r.id !== rowId).map(r => (
                Array.from({ length: layoutNumCols(r.layout) }, (_, c) => (
                  <button
                    key={`${r.id}-${c}`}
                    type="button"
                    onClick={() => { onMoveToSlot(section.id, r.id, c); setShowMenu(false); }}
                    className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 text-charcoal"
                  >
                    → {r.label}, {colLabel(r.layout, c)}
                  </button>
                ))
              ))}
            </div>
          )}
        </div>

        {/* Duplicate */}
        <button
          type="button"
          title="Duplicate"
          onClick={() => onDuplicate(section.id)}
          className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-plum hover:bg-plum/5 text-[10px] transition-colors"
        >
          📋
        </button>

        {/* Delete */}
        <button
          type="button"
          title="Delete"
          onClick={() => {
            if (confirm(`Delete "${section.title || SECTION_TYPE_LABEL[section.type]}"?`)) {
              onDelete(section.id);
            }
          }}
          className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 text-[10px] transition-colors"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RowItem — the main export
════════════════════════════════════════════════════════════════ */

export interface RowItemProps {
  row: SectionRow;
  index: number;
  totalRows: number;
  children: SectionRow[];           // sections with parent_id === row.id
  isExpanded: boolean;
  dragOverId: string | null;
  selectedSectionId: string | null;
  availableRows: { id: string; layout: RowLayout | null; label: string }[];
  onSelectSection: (id: string) => void;
  onMoveToRoot: (sectionId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveToSlot: (sectionId: string, rowId: string, col: number) => void;
  onChangeLayout: (layout: RowLayout) => void;
  onMoveRow: (dir: -1 | 1) => void;
  onDuplicateRow: () => void;
  onDeleteRow: () => void;
}

export default function RowItem({
  row,
  index,
  totalRows,
  children,
  isExpanded,
  dragOverId,
  selectedSectionId,
  availableRows,
  onSelectSection,
  onMoveToRoot,
  onDuplicateSection,
  onDeleteSection,
  onMoveToSlot,
  onChangeLayout,
  onMoveRow,
  onDuplicateRow,
  onDeleteRow,
}: RowItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: { type: "row", container: "root" },
  });

  const [showToolbar, setShowToolbar] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const layout = row.layout as RowLayout | null;
  const numCols = layoutNumCols(layout);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="h-16 rounded-xl border-2 border-dashed border-plum/30 bg-plum/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border border-plum/20 bg-plum/5 overflow-hidden"
    >
      {/* Row header */}
      <div className="flex items-center gap-1 px-1 py-1.5 bg-plum/10">
        {/* Drag handle (for reordering the row at root level) */}
        <button
          type="button"
          aria-label="Drag row"
          className="flex-shrink-0 flex items-center justify-center w-5 h-7 text-plum/30 hover:text-plum/60 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <DotGrid />
        </button>

        {/* Row label */}
        <span className="text-[10px] font-bold text-plum/70 flex-1 truncate">
          ⬜ {layout ? LAYOUT_LABEL[layout] : "Row"}
          {layout && <span className="ml-1 opacity-50">({numCols} col{numCols !== 1 ? "s" : ""})</span>}
        </span>

        {/* Toolbar toggle */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            title="Row options"
            onClick={() => setShowToolbar((v) => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-plum/50 hover:text-plum hover:bg-plum/10 transition-colors text-xs"
          >
            ⚙
          </button>

          {showToolbar && (
            <div
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1 w-44"
              onMouseLeave={() => setShowToolbar(false)}
            >
              <button
                type="button"
                onClick={() => { setShowLayoutPicker(true); setShowToolbar(false); }}
                className="w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-charcoal flex items-center gap-2"
              >
                <span>⬜</span> Change layout
              </button>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => { onMoveRow(-1); setShowToolbar(false); }}
                className="w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-charcoal disabled:opacity-40 flex items-center gap-2"
              >
                <span>↑</span> Move up
              </button>
              <button
                type="button"
                disabled={index >= totalRows - 1}
                onClick={() => { onMoveRow(1); setShowToolbar(false); }}
                className="w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-charcoal disabled:opacity-40 flex items-center gap-2"
              >
                <span>↓</span> Move down
              </button>
              <button
                type="button"
                onClick={() => { onDuplicateRow(); setShowToolbar(false); }}
                className="w-full text-left text-xs px-3 py-2 hover:bg-gray-50 text-charcoal flex items-center gap-2"
              >
                <span>📋</span> Duplicate layout
              </button>
              <div className="border-t border-gray-100 my-0.5" />
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this row and all its contents?")) {
                    onDeleteRow();
                    setShowToolbar(false);
                  }
                }}
                className="w-full text-left text-xs px-3 py-2 hover:bg-red-50 text-red-500 flex items-center gap-2"
              >
                <span>🗑</span> Delete layout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slot columns */}
      {isExpanded && (
        <div className="flex gap-1 p-1.5">
          {Array.from({ length: numCols }, (_, colIdx) => {
            const colKids = children
              .filter((c) => c.col === colIdx)
              .sort((a, b) => a.order - b.order);
            const colKidIds = colKids.map((c) => c.id);
            const isEmpty = colKids.length === 0;

            return (
              <div
                key={colIdx}
                className="flex-1 min-w-0 border border-gray-200/60 rounded-lg p-1 bg-white/50"
              >
                {/* Column label */}
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-300 px-1 pb-1">
                  {colLabel(layout, colIdx)}
                </p>

                <SortableContext
                  items={colKidIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0.5">
                    {colKids.map((s) => (
                      <SlotSection
                        key={s.id}
                        section={s}
                        rowId={row.id}
                        isSelected={selectedSectionId === s.id}
                        onSelect={onSelectSection}
                        onMoveToRoot={onMoveToRoot}
                        onDuplicate={onDuplicateSection}
                        onDelete={onDeleteSection}
                        availableRows={availableRows}
                        onMoveToSlot={onMoveToSlot}
                      />
                    ))}
                  </div>
                </SortableContext>

                {isEmpty && (
                  <EmptySlot rowId={row.id} col={colIdx} dragOverId={dragOverId} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Layout picker modal */}
      {showLayoutPicker && (
        <LayoutPicker
          title="Change layout"
          currentLayout={layout}
          onSelect={onChangeLayout}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}
    </div>
  );
}
