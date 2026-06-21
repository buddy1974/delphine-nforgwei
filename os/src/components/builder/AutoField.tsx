"use client";

import { useEffect, useRef, useState } from "react";

type SaveResult = { ok: true } | { error: string };

/**
 * A debounced auto-saving field. Renders an auto-growing textarea (multiline)
 * or single-line input. Calls onSave(value) ~700ms after the user stops typing.
 * Surfaces per-field "Saving… / Saved ✓ / Save failed" state.
 *
 * P1D.5: Added "failed" state, monotonic seq guard, and try/catch.
 * Only the latest in-flight request may update save state.
 * "Save failed" does NOT auto-clear — user must acknowledge by retyping.
 */
export default function AutoField({
  label,
  value,
  multiline = false,
  placeholder,
  big = false,
  onSave,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  placeholder?: string;
  big?: boolean;
  onSave: (value: string) => Promise<SaveResult>;
}) {
  const [val, setVal] = useState(value);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // keep external updates in sync (e.g. after reorder reload)
  useEffect(() => setVal(value), [value]);

  // auto-grow the textarea
  useEffect(() => {
    if (multiline && taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = `${taRef.current.scrollHeight}px`;
    }
  }, [val, multiline]);

  function schedule(next: string) {
    setVal(next);
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      // P1D.5: monotonic seq — only the latest in-flight request may update state.
      // Stale responses from earlier keystrokes are silently discarded.
      const seq = (seqRef.current += 1);
      try {
        const result = await onSave(next);
        if (seq !== seqRef.current) return;
        if ("error" in result) {
          // DB error returned as discriminated union — show failure; do NOT auto-clear
          setState("failed");
        } else {
          setState("saved");
          // Auto-clear "Saved ✓" after 1.2s, but only if no newer save has fired
          setTimeout(() => {
            if (seq === seqRef.current) setState("idle");
          }, 1200);
        }
      } catch {
        // Network-level failure (fetch threw, 503 bubbled as exception, etc.)
        if (seq !== seqRef.current) return;
        setState("failed"); // do NOT auto-clear
      }
    }, 700);
  }

  const base =
    "w-full bg-transparent border border-transparent hover:border-gray-200 " +
    "focus:border-plum/40 rounded-lg px-3 py-2 focus:outline-none " +
    "focus:ring-2 focus:ring-plum/15 transition-colors";

  return (
    <label className="block">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
        {label}
        {state === "saving" && (
          <span className="text-amber-500 normal-case font-normal tracking-normal">Saving…</span>
        )}
        {state === "saved" && (
          <span className="text-green-600 normal-case font-normal tracking-normal">Saved ✓</span>
        )}
        {state === "failed" && (
          <span
            className="text-red-600 normal-case font-normal tracking-normal"
            title="Autosave failed — check connection and retry"
          >
            Save failed
          </span>
        )}
      </span>
      {multiline ? (
        <textarea
          ref={taRef}
          value={val}
          placeholder={placeholder}
          onChange={(e) => schedule(e.target.value)}
          rows={2}
          className={`${base} resize-none leading-relaxed text-sm text-charcoal`}
        />
      ) : (
        <input
          type="text"
          value={val}
          placeholder={placeholder}
          onChange={(e) => schedule(e.target.value)}
          className={`${base} ${big ? "text-lg font-semibold" : "text-sm"} text-charcoal`}
        />
      )}
    </label>
  );
}
