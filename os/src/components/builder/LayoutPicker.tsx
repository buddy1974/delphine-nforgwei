"use client";

import type { RowLayout } from "@/lib/db/pages";

/* ── Visual layout mini-diagrams ─────────────────────────────── */
function LayoutDiagram({ layout }: { layout: RowLayout }) {
  const wrap: React.CSSProperties = { display: "flex", gap: 3, height: 40, padding: "2px 0" };
  const block = (flex: number, label?: string): React.ReactNode => (
    <div
      key={label}
      style={{
        flex,
        background: "#e2e8f0",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 8,
        fontWeight: 700,
        color: "#94a3b8",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </div>
  );

  switch (layout) {
    case "1":
      return <div style={wrap}>{block(1, "TEXT")}</div>;
    case "2":
      return <div style={wrap}>{block(1, "TEXT")}{block(1, "IMG")}</div>;
    case "3":
      return <div style={wrap}>{block(1, "A")}{block(1, "B")}{block(1, "C")}</div>;
    case "70-30":
      return <div style={wrap}>{block(7, "LARGE")}{block(3, "SM")}</div>;
    case "30-70":
      return <div style={wrap}>{block(3, "SM")}{block(7, "LARGE")}</div>;
    default:
      return null;
  }
}

/* ── Config ──────────────────────────────────────────────────── */
const OPTIONS: {
  layout: RowLayout;
  label: string;
  desc: string;
  example: string;
}[] = [
  { layout: "1",     label: "One Block",     desc: "Full width",     example: "[ Text ]" },
  { layout: "2",     label: "Side by Side",  desc: "Equal halves",   example: "[ Text ] [ Image ]" },
  { layout: "3",     label: "Three Across",  desc: "Equal thirds",   example: "[ A ] [ B ] [ C ]" },
  { layout: "70-30", label: "Big Left",      desc: "70 / 30",        example: "[ Large Text ] [ Small Image ]" },
  { layout: "30-70", label: "Big Right",     desc: "30 / 70",        example: "[ Small Image ] [ Large Text ]" },
];

/* ═══════════════════════════════════════════════════════════════ */

interface LayoutPickerProps {
  title?: string;
  currentLayout?: RowLayout | null;
  onSelect: (layout: RowLayout) => void;
  onClose: () => void;
}

export default function LayoutPicker({
  title = "Choose a layout",
  currentLayout,
  onSelect,
  onClose,
}: LayoutPickerProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-charcoal">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-charcoal"
          >
            ✕
          </button>
        </div>

        {/* Cards */}
        <div className="p-5 grid grid-cols-1 gap-2.5">
          {OPTIONS.map((opt) => {
            const isActive = opt.layout === currentLayout;
            return (
              <button
                key={opt.layout}
                type="button"
                onClick={() => { onSelect(opt.layout); onClose(); }}
                className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-all hover:shadow-sm ${
                  isActive
                    ? "border-plum bg-plum/5 shadow-sm shadow-plum/10"
                    : "border-gray-200 hover:border-plum/40"
                }`}
              >
                {/* Diagram */}
                <div className="flex-shrink-0 w-36">
                  <LayoutDiagram layout={opt.layout} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${isActive ? "text-plum" : "text-charcoal"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  <p className="text-[11px] text-gray-400 font-mono mt-1 truncate">{opt.example}</p>
                </div>

                {isActive && (
                  <span className="flex-shrink-0 text-xs font-bold text-plum bg-plum/10 px-2 py-0.5 rounded-md">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
