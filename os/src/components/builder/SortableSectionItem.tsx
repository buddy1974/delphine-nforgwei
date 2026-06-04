"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SECTION_TYPE_LABEL,
  SECTION_ICONS,
  type SectionRow,
} from "@/lib/db/pages";

/* ── Six-dot drag handle icon ───────────────────────────────── */
function DotGrid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="2"  cy="2"  r="1.5" fill="currentColor" />
      <circle cx="8"  cy="2"  r="1.5" fill="currentColor" />
      <circle cx="2"  cy="8"  r="1.5" fill="currentColor" />
      <circle cx="8"  cy="8"  r="1.5" fill="currentColor" />
      <circle cx="2"  cy="14" r="1.5" fill="currentColor" />
      <circle cx="8"  cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export interface SortableSectionItemProps {
  section: SectionRow;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SortableSectionItem({
  section,
  index,
  isSelected,
  isExpanded,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const icon = SECTION_ICONS[section.type];
  const typeLabel = SECTION_TYPE_LABEL[section.type];
  const preview = section.subtitle ?? section.body ?? null;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: isDragging ? "relative" : undefined,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      {isDragging ? (
        /* Dashed placeholder at origin slot while dragging */
        <div className="h-11 rounded-xl border-2 border-dashed border-plum/30 bg-plum/5" />
      ) : (
        <div
          className={`group/row rounded-xl border transition-all ${
            isSelected
              ? "bg-white border-plum/30 shadow-sm"
              : "border-transparent hover:bg-white/70 hover:border-gray-200"
          }`}
        >
          {/* ── Main row ── */}
          <div className="flex items-center gap-1">

            {/* Drag handle */}
            <button
              type="button"
              aria-label="Drag to reorder"
              className="flex-shrink-0 flex items-center justify-center w-6 h-10 text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none transition-colors rounded-l-xl"
              {...attributes}
              {...listeners}
            >
              <DotGrid />
            </button>

            {/* Section icon */}
            <span
              className="flex-shrink-0 text-base leading-none select-none"
              aria-hidden="true"
            >
              {icon}
            </span>

            {/* Click-to-select content area */}
            <button
              type="button"
              onClick={() => onSelect(section.id)}
              className="flex-1 flex items-center gap-2 py-2.5 pr-1 text-left min-w-0"
            >
              {/* Title / fallback label */}
              <span
                className={`text-xs font-semibold flex-1 truncate min-w-0 ${
                  isSelected ? "text-plum" : "text-charcoal"
                }`}
              >
                {section.title || typeLabel}
              </span>
              {/* Type chip — always visible */}
              <span
                className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-plum/10 text-plum"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {typeLabel}
              </span>
            </button>

            {/* Quick actions — visible on hover or when selected */}
            <div
              className={`flex items-center gap-0.5 pr-2 flex-shrink-0 transition-opacity ${
                isSelected ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
              }`}
            >
              <button
                type="button"
                title="Duplicate section"
                onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[12px] text-gray-400 hover:text-plum hover:bg-plum/8 transition-colors"
              >
                📋
              </button>
              <button
                type="button"
                title="Delete section"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${section.title || typeLabel}"?`)) {
                    onDelete(section.id);
                  }
                }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[12px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                🗑
              </button>
            </div>
          </div>

          {/* ── Expanded subtitle preview ── */}
          {isExpanded && preview && (
            <div className="px-9 pb-2.5">
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                {preview}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
