"use client";

import { useEffect, useRef, useState } from "react";
import { useBrand } from "@/components/BrandProvider";
import { OS_BRANDS } from "@/lib/brands";
import {
  listMedia,
  listAllMedia,
  uploadMediaFile,
  type MediaRow,
} from "@/app/(shell)/media/actions";

/* ── Types ──────────────────────────────────────────────────── */
type TabKey = "brand" | "all";

interface MediaPickerProps {
  currentUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

/* ── Helpers ─────────────────────────────────────────────────── */
function brandAccent(key: string): string {
  return OS_BRANDS.find((b) => b.key === key)?.accent ?? "#6b7280";
}
function brandShort(key: string): string {
  return OS_BRANDS.find((b) => b.key === key)?.shortName ?? key;
}

/* ═══════════════════════════════════════════════════════════════ */

export default function MediaPicker({
  currentUrl,
  onSelect,
  onClose,
}: MediaPickerProps) {
  const { brand } = useBrand();

  // ── Tab: "brand" = current brand only, "all" = shared assets ──
  const [tab, setTab] = useState<TabKey>("brand");
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Upload ──
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Search + hover preview ──
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<MediaRow | null>(null);

  /* Load library when tab or brand changes */
  useEffect(() => {
    let active = true;
    setLoading(true);
    const loader = tab === "brand" ? listMedia(brand.key) : listAllMedia();
    loader
      .then((rows) => { if (active) setItems(rows); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [brand.key, tab]);

  /* Filtered list */
  const filtered = search
    ? items.filter(
        (m) =>
          m.alt?.toLowerCase().includes(search.toLowerCase()) ||
          m.url.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  /* Preview panel source: hovered item takes precedence, then current */
  const currentFromLib = items.find((m) => m.url === currentUrl) ?? null;
  const previewItem = hovered ?? currentFromLib;

  /* ── Upload handler ── */
  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large — max 10 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("brandKey", brand.key);
    fd.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

    const result = await uploadMediaFile(fd);
    setUploading(false);

    if ("error" in result) {
      setUploadError(result.error);
      return;
    }

    // Prepend to list, auto-select, and close
    setItems((prev) => [result.row, ...prev]);
    onSelect(result.row.url);
    onClose();
  }

  /* ── Render ── */
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">🖼️</span>
            <div>
              <h2 className="text-base font-bold text-charcoal leading-tight">Media Library</h2>
              <p className="text-[11px] text-gray-400">
                {tab === "brand" ? brand.name : "All brands · shared assets"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-400 hover:text-charcoal flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* ── Tool strip: upload + search ── */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0 flex items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-plum text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-60 hover:bg-plum/90 active:scale-95 transition-all flex-shrink-0"
          >
            <span>{uploading ? "⏳" : "↑"}</span>
            {uploading ? "Uploading…" : "Upload new"}
          </button>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab === "brand" ? brand.shortName : "all brands"}…`}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum/50"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Upload error */}
        {uploadError && (
          <p className="text-xs text-red-600 px-6 py-2 bg-red-50 border-b border-red-100 flex-shrink-0">
            {uploadError}
          </p>
        )}

        {/* ── Tabs ── */}
        <div className="px-6 flex gap-0.5 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
          {(
            [
              { key: "brand" as const, label: brand.shortName, icon: "📁" },
              { key: "all"   as const, label: "Shared Assets",  icon: "🌐" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setSearch(""); setHovered(null); }}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 border-b-2 transition-all ${
                tab === t.key
                  ? "border-plum text-plum"
                  : "border-transparent text-gray-400 hover:text-charcoal"
              }`}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
              {tab === t.key && items.length > 0 && (
                <span className="bg-plum/15 text-plum text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                  {filtered.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Body: grid + side preview ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 min-w-0">

            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-gray-400">Loading…</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-12">
                {search ? (
                  <>
                    <p className="text-sm font-semibold text-charcoal mb-1">No results</p>
                    <p className="text-xs text-gray-400">
                      No images match &ldquo;{search}&rdquo;
                    </p>
                  </>
                ) : tab === "brand" ? (
                  <>
                    <div className="text-3xl mb-3">📁</div>
                    <p className="text-sm font-semibold text-charcoal mb-1">
                      No images for {brand.shortName} yet
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Upload your first image with the button above,
                      <br />or switch to Shared Assets to reuse images from other brands.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-3">🌐</div>
                    <p className="text-sm font-semibold text-charcoal mb-1">
                      No shared assets yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Upload images in any brand to see them here.
                    </p>
                  </>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5">
                {filtered.map((m) => {
                  const isActive = m.url === currentUrl;
                  const isHovered = hovered?.id === m.id;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { onSelect(m.url); onClose(); }}
                      onMouseEnter={() => setHovered(m)}
                      onMouseLeave={() => setHovered(null)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left transition-all group ${
                        isActive
                          ? "border-plum shadow-lg shadow-plum/15"
                          : isHovered
                          ? "border-gray-300 shadow-sm"
                          : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      {/* Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.alt ?? ""}
                        className="w-full h-28 object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      />

                      {/* Selected badge */}
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 bg-plum text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                          ✓ In use
                        </div>
                      )}

                      {/* Brand badge — only on Shared Assets tab */}
                      {tab === "all" && (
                        <div
                          className="absolute top-1.5 left-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm"
                          style={{ backgroundColor: brandAccent(m.brand_key) }}
                        >
                          {brandShort(m.brand_key)}
                        </div>
                      )}

                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-2 pt-4 pb-1.5">
                        <p className="text-white text-[10px] font-medium truncate leading-tight">
                          {m.alt ?? "Untitled"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Side preview panel ── */}
          <div className="w-44 flex-shrink-0 border-l border-gray-100 flex flex-col bg-gray-50/40">
            {previewItem ? (
              <>
                {/* Preview image */}
                <div className="flex-1 p-3 flex items-center justify-center overflow-hidden bg-[#f4f4f6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewItem.url}
                    alt={previewItem.alt ?? ""}
                    className="max-w-full max-h-[220px] object-contain rounded-lg shadow-sm"
                  />
                </div>

                {/* Preview info + action */}
                <div className="flex-shrink-0 p-3 border-t border-gray-100">
                  <p
                    className="text-[11px] font-bold text-charcoal truncate mb-0.5"
                    title={previewItem.alt ?? undefined}
                  >
                    {previewItem.alt ?? "Untitled"}
                  </p>
                  {tab === "all" && (
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: brandAccent(previewItem.brand_key) }}
                      />
                      <span className="text-[10px] text-gray-400">
                        {brandShort(previewItem.brand_key)}
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mb-3">
                    {new Date(previewItem.created_at).toLocaleDateString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => { onSelect(previewItem.url); onClose(); }}
                    className="w-full bg-plum text-white text-[11px] font-bold py-2 rounded-lg hover:bg-plum/90 active:scale-95 transition-all"
                  >
                    Use image
                  </button>
                  {previewItem.url !== currentUrl && currentUrl && (
                    <p className="text-[9px] text-gray-400 text-center mt-1.5">
                      Replaces current image
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Empty panel state */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="text-2xl mb-2 opacity-25">👆</div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  Hover over an image to preview it here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
