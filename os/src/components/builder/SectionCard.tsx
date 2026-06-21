"use client";

import { useState } from "react";
import AutoField from "./AutoField";
import MediaPicker from "./MediaPicker";
import { SECTION_TYPE_LABEL, type SectionRow, type SectionPatch } from "@/lib/db/pages";

export default function SectionCard({
  section,
  index,
  onSave,
  onDelete,
}: {
  section: SectionRow;
  index: number;
  onSave: (id: string, patch: SectionPatch) => Promise<{ ok: true } | { error: string }>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const hasImage = ["hero", "image", "cards", "event_block", "program_card"].includes(section.type);
  const hasButton = ["hero", "cta", "event_block", "program_card"].includes(section.type);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-plum">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-plum/10 text-[10px]">
            {index + 1}
          </span>
          {SECTION_TYPE_LABEL[section.type]}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!confirm("Delete this section?")) return;
            setBusy(true);
            await onDelete(section.id);
          }}
          className="w-7 h-7 rounded-md border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 text-sm"
          aria-label="Delete section"
        >
          ✕
        </button>
      </div>

      {/* Editable fields */}
      <div className="p-4 space-y-3">
        <AutoField
          label="Title"
          value={section.title ?? ""}
          big
          placeholder="Section heading"
          onSave={(v) => onSave(section.id, { title: v })}
        />

        {section.type !== "image" && (
          <AutoField
            label="Subtitle"
            value={section.subtitle ?? ""}
            placeholder="Optional subheading"
            onSave={(v) => onSave(section.id, { subtitle: v })}
          />
        )}

        {section.type !== "image" && (
          <AutoField
            label="Body text"
            value={section.body ?? ""}
            multiline
            placeholder="Paragraph text…"
            onSave={(v) => onSave(section.id, { body: v })}
          />
        )}

        {hasImage && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Image</p>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0">
                {section.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={section.image_url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-300 text-center leading-tight p-1">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full text-xs font-semibold border border-plum/30 text-plum px-3 py-2 rounded-lg hover:bg-plum/5 transition-colors text-center"
                >
                  Select from media library
                </button>
                <AutoField
                  label="or paste URL"
                  value={section.image_url ?? ""}
                  placeholder="https://…"
                  onSave={(v) => onSave(section.id, { image_url: v })}
                />
              </div>
            </div>
          </div>
        )}

        {hasButton && (
          <div className="grid grid-cols-2 gap-3">
            <AutoField
              label="Button label"
              value={section.button_label ?? ""}
              placeholder="e.g. Register"
              onSave={(v) => onSave(section.id, { button_label: v })}
            />
            <AutoField
              label="Button link"
              value={section.button_url ?? ""}
              placeholder="/register"
              onSave={(v) => onSave(section.id, { button_url: v })}
            />
          </div>
        )}
      </div>

      {showMediaPicker && (
        <MediaPicker
          currentUrl={section.image_url ?? ""}
          onSelect={(url) => onSave(section.id, { image_url: url })}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
