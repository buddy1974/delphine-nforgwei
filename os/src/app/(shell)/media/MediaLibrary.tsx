"use client";

import { useEffect, useRef, useState } from "react";
import { useBrand } from "@/components/BrandProvider";
import {
  listMedia,
  uploadMediaFile,
  deleteMedia,
  type MediaRow,
} from "./actions";

export default function MediaLibrary() {
  const { brand } = useBrand();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<MediaRow | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    const rows = await listMedia(brand.key);
    setItems(rows);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [brand.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = search
    ? items.filter(
        (m) =>
          m.alt?.toLowerCase().includes(search.toLowerCase()) ||
          m.url.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  /* ── Upload ── */
  async function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large — maximum 10 MB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("brandKey", brand.key);
    fd.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

    const result = await uploadMediaFile(fd);

    if ("error" in result) {
      setUploadError(result.error);
    } else {
      setItems((prev) => [result.row, ...prev]);
    }
    setUploading(false);
  }

  /* ── Delete ── */
  async function handleDelete(item: MediaRow) {
    const label = item.alt ?? item.url.split("/").pop() ?? "this image";
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    await deleteMedia(item.id);
    setItems((prev) => prev.filter((m) => m.id !== item.id));
    if (previewItem?.id === item.id) setPreviewItem(null);
  }

  /* ── Copy URL ── */
  async function handleCopy(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  /* ── Render ── */

  return (
    <div className="max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Media</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Images for{" "}
            <span className="font-semibold" style={{ color: brand.accent }}>
              {brand.name}
            </span>
          </p>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-plum text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-plum/20 hover:bg-plum/90 disabled:opacity-60 active:scale-95 transition-all flex-shrink-0"
        >
          {uploading ? "⏳ Uploading…" : "↑ Upload image"}
        </button>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer mb-6 transition-all select-none ${
          isDraggingOver
            ? "border-plum bg-plum/5 scale-[1.01]"
            : uploading
            ? "border-gray-200 bg-gray-50 cursor-default"
            : "border-gray-200 hover:border-plum/40 hover:bg-gray-50/60"
        }`}
      >
        <div className="text-4xl mb-2 pointer-events-none">
          {uploading ? "⏳" : isDraggingOver ? "📥" : "🖼️"}
        </div>
        <p className="text-sm font-semibold text-charcoal pointer-events-none">
          {uploading
            ? "Uploading…"
            : isDraggingOver
            ? "Drop to upload"
            : "Drag & drop an image here, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1 pointer-events-none">
          JPG · PNG · GIF · WebP · SVG · Max 10 MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          {uploadError}
        </p>
      )}

      {/* Search */}
      {items.length > 4 && (
        <div className="flex items-center gap-3 mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description…"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-sm text-gray-400 hover:text-charcoal px-2"
            >
              Clear
            </button>
          )}
          <span className="text-xs text-gray-400 flex-shrink-0">
            {filtered.length} of {items.length}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-base font-semibold text-charcoal mb-1">No images yet</p>
          <p className="text-sm text-gray-400">
            Upload the first image for {brand.shortName}
          </p>
        </div>
      )}

      {/* No search results */}
      {!loading && items.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-10">
          No images match &ldquo;{search}&rdquo;
        </p>
      )}

      {/* Image grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-plum/30 hover:shadow-md transition-all"
            >
              {/* Thumbnail */}
              <button
                type="button"
                title="Preview"
                onClick={() => setPreviewItem(m)}
                className="block w-full aspect-square overflow-hidden bg-gray-100 cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.alt ?? ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </button>

              {/* Info + actions */}
              <div className="p-2.5">
                <p
                  className="text-[11px] text-gray-700 font-semibold truncate leading-tight"
                  title={m.alt ?? undefined}
                >
                  {m.alt ?? "Untitled"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(m.created_at).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(m.url, m.id)}
                    className={`flex-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all ${
                      copied === m.id
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600 hover:bg-plum/10 hover:text-plum"
                    }`}
                  >
                    {copied === m.id ? "✓ Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m)}
                    title="Delete"
                    className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-xs"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-size preview modal */}
      {previewItem && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="min-w-0">
                <p className="text-sm font-bold text-charcoal truncate">
                  {previewItem.alt ?? "Image preview"}
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                  {previewItem.url}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => handleCopy(previewItem.url, previewItem.id)}
                  className="text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-plum/40 hover:text-plum transition-colors"
                >
                  {copied === previewItem.id ? "✓ Copied" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(previewItem)}
                  className="text-xs font-semibold border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-charcoal"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Image */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50 min-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.url}
                alt={previewItem.alt ?? ""}
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
