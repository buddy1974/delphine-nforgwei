"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/components/BrandProvider";
import { OS_BRANDS, type OsBrand } from "@/lib/brands";
import {
  listAllPages,
  createPage,
  duplicatePage,
  deletePage,
  updatePageMeta,
} from "./actions";
import type { PageRow, PageStatus } from "@/lib/db/pages";

/* ── helpers ─────────────────────────────────────────────────── */

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Module tabs under each brand.
// Pages and Media are active. Blog and Events are placeholders for future phases.
const BRAND_MODULES = [
  { key: "pages",  label: "Pages",  soon: false, href: "/pages"  },
  { key: "blog",   label: "Blog",   soon: true,  href: null      },
  { key: "events", label: "Events", soon: true,  href: null      },
  { key: "media",  label: "Media",  soon: false, href: "/media"  },
] as const;

const STATUS_DOT: Record<string, string> = {
  published: "bg-green-400",
  review: "bg-amber-400",
  draft: "bg-white/20",
};

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  review: "bg-amber-100 text-amber-700",
  draft: "bg-gray-100 text-gray-500",
};

/* ── component ───────────────────────────────────────────────── */

export default function PageList() {
  const { brand, setBrandKey } = useBrand();
  const router = useRouter();

  // All pages across every brand
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  // Tree: which brands are expanded
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set([brand.key])
  );

  // Selected page → drives the preview panel
  const [selectedPage, setSelectedPage] = useState<PageRow | null>(null);
  // Incremented to force iframe refresh after page-level actions
  const [previewKey, setPreviewKey] = useState(0);

  // Add page modal
  const [showNew, setShowNew] = useState(false);
  const [newBrand, setNewBrand] = useState<OsBrand["key"]>(brand.key);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [createPending, startCreate] = useTransition();
  const [createError, setCreateError] = useState("");

  // Per-page action busy state
  const [acting, setActing] = useState<string | null>(null);

  /* ── data loading ─────────────────────────────────────────── */

  async function refresh(keepSelected = false) {
    setLoading(true);
    setGlobalError("");
    try {
      const all = await listAllPages();
      setPages(all);
      // Keep selected page meta in sync after refresh
      if (keepSelected && selectedPage) {
        const fresh = all.find((p) => p.id === selectedPage.id);
        if (fresh) setSelectedPage(fresh);
      }
    } catch (e: unknown) {
      setGlobalError((e as Error).message ?? "Failed to load pages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── grouped pages ───────────────────────────────────────── */

  const byBrand = useMemo(() => {
    const map: Record<string, PageRow[]> = {};
    for (const b of OS_BRANDS) map[b.key] = [];
    for (const p of pages) {
      if (map[p.brand_key]) map[p.brand_key].push(p);
    }
    return map;
  }, [pages]);

  /* ── tree interactions ───────────────────────────────────── */

  function toggleBrand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function selectPage(p: PageRow) {
    setSelectedPage(p);
    setBrandKey(p.brand_key as OsBrand["key"]);
    // If the brand node is collapsed, expand it
    setExpanded((prev) => new Set(prev).add(p.brand_key));
    setPreviewKey((v) => v + 1);
  }

  /* ── page actions ────────────────────────────────────────── */

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    startCreate(async () => {
      const res = await createPage(newBrand, newTitle, newSlug);
      if ("error" in res) { setCreateError(res.error); return; }
      closeNew();
      router.push(`/pages/${res.id}`);
    });
  }

  function closeNew() {
    setShowNew(false);
    setNewTitle("");
    setNewSlug("");
    setCreateError("");
  }

  function openNew() {
    setNewBrand((selectedPage?.brand_key ?? brand.key) as OsBrand["key"]);
    setShowNew(true);
  }

  async function handlePublish(p: PageRow) {
    setActing(p.id);
    await updatePageMeta(p.id, { status: "published" as PageStatus });
    await refresh(true);
    setPreviewKey((v) => v + 1);
    setActing(null);
  }

  async function handleDuplicate(p: PageRow) {
    setActing(p.id);
    const res = await duplicatePage(p.id);
    if ("error" in res) { alert(res.error); setActing(null); return; }
    await refresh(false);
    setActing(null);
  }

  async function handleDelete(p: PageRow) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setActing(p.id);
    await deletePage(p.id);
    if (selectedPage?.id === p.id) setSelectedPage(null);
    await refresh(false);
    setActing(null);
  }

  /* ── derived values ──────────────────────────────────────── */

  const selectedBrand =
    (selectedPage
      ? OS_BRANDS.find((b) => b.key === selectedPage.brand_key)
      : null) ?? brand;

  const isBusy = acting !== null || createPending;

  /* ── render ─────────────────────────────────────────────── */

  return (
    <div className="flex -mx-8 -my-8 min-h-[calc(100vh-4rem)]">

      {/* ════════════════════════════════
          LEFT — Brand tree sidebar
      ════════════════════════════════ */}
      <aside className="w-60 flex-shrink-0 bg-ink flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Websites
          </p>
        </div>

        {/* Tree */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Website pages">
          {loading && (
            <p className="text-white/25 text-xs px-5 py-4">Loading…</p>
          )}

          {OS_BRANDS.map((b) => {
            const bPages = byBrand[b.key] ?? [];
            const isOpen = expanded.has(b.key);

            return (
              <div key={b.key}>
                {/* Brand row */}
                <button
                  type="button"
                  onClick={() => toggleBrand(b.key)}
                  className="w-full flex items-center gap-2.5 px-5 py-3 text-left hover:bg-white/5 transition-colors group"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: b.accent }}
                  />
                  <span className="flex-1 text-sm font-bold text-white/80 group-hover:text-white truncate">
                    {b.shortName}
                  </span>
                  {bPages.length > 0 && (
                    <span className="text-[10px] text-white/30 flex-shrink-0 mr-1">
                      {bPages.length}
                    </span>
                  )}
                  <span className="text-white/25 text-xs flex-shrink-0 w-3">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </button>

                {/* Module tabs + page list */}
                {isOpen && (
                  <div className="pb-1">

                    {/* Module navigation tabs */}
                    <div className="flex items-center gap-1 px-5 py-2">
                      {BRAND_MODULES.map((m) => {
                        if (m.soon) {
                          return (
                            <span
                              key={m.key}
                              title="Coming soon"
                              className="text-[10px] font-bold px-2 py-1 rounded-md text-white/20 cursor-default select-none"
                            >
                              {m.label}
                              <span className="ml-1 text-[8px] font-normal opacity-60">soon</span>
                            </span>
                          );
                        }
                        if (m.key === "pages") {
                          return (
                            <span
                              key={m.key}
                              className="text-[10px] font-bold px-2 py-1 rounded-md bg-plum/40 text-white select-none"
                            >
                              {m.label}
                            </span>
                          );
                        }
                        // Active module with navigation (e.g. Media)
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => {
                              setBrandKey(b.key as OsBrand["key"]);
                              router.push(m.href!);
                            }}
                            className="text-[10px] font-bold px-2 py-1 rounded-md text-white/55 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pages list */}
                    {bPages.length === 0 && !loading ? (
                      <p className="text-white/20 text-[11px] px-10 py-1.5 italic">
                        No pages
                      </p>
                    ) : (
                      bPages.map((p) => {
                        const isSelected = selectedPage?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center group/page border-l-2 transition-all ${
                              isSelected
                                ? "border-plum bg-plum/20"
                                : "border-transparent hover:bg-white/5"
                            }`}
                          >
                            {/* Page name — click to preview */}
                            <button
                              type="button"
                              onClick={() => selectPage(p)}
                              className="flex-1 flex items-center gap-2 pl-10 pr-2 py-2 text-left min-w-0"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  STATUS_DOT[p.status] ?? STATUS_DOT.draft
                                }`}
                              />
                              <span
                                className={`text-[13px] truncate ${
                                  isSelected
                                    ? "text-white font-semibold"
                                    : "text-white/55 font-medium"
                                }`}
                              >
                                {p.title}
                              </span>
                            </button>

                            {/* Edit icon — always navigate to editor */}
                            <button
                              type="button"
                              onClick={() => router.push(`/pages/${p.id}`)}
                              title="Open editor"
                              className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white flex-shrink-0 opacity-0 group-hover/page:opacity-100 transition-all mr-2 text-sm"
                            >
                              ✏
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Add page shortcut at bottom */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={openNew}
            className="w-full text-xs font-bold text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-xl py-2.5 hover:bg-white/5 transition-all"
          >
            + Add page
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          RIGHT — Preview panel
      ════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Action bar */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 min-w-0">

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-1.5 min-w-0 overflow-hidden">
            {selectedPage ? (
              <>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedBrand.accent }}
                />
                <span className="text-sm text-gray-400 flex-shrink-0">
                  {selectedBrand.shortName}
                </span>
                <span className="text-gray-300 flex-shrink-0">›</span>
                <span className="text-sm font-bold text-charcoal truncate">
                  {selectedPage.title}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                    STATUS_BADGE[selectedPage.status] ?? STATUS_BADGE.draft
                  }`}
                >
                  {selectedPage.status}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Pages</span>
            )}
          </div>

          {/* Context actions (shown when a page is selected) */}
          {selectedPage && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {selectedPage.status !== "published" && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handlePublish(selectedPage)}
                  className="text-xs font-semibold border border-green-300 text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                >
                  ↑ Publish
                </button>
              )}
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleDuplicate(selectedPage)}
                className="text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                ⧉ Duplicate
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handleDelete(selectedPage)}
                className="text-xs font-semibold border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                🗑 Delete
              </button>
              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => router.push(`/pages/${selectedPage.id}`)}
                className="flex items-center gap-1.5 text-sm font-bold bg-plum text-white px-5 py-2 rounded-xl shadow-md shadow-plum/20 hover:bg-plum/90 active:scale-95 transition-all"
              >
                ✏ Edit
              </button>
            </div>
          )}

          {/* Always-visible ADD PAGE */}
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 text-sm font-bold bg-charcoal text-white px-4 py-2 rounded-xl hover:bg-charcoal/80 transition-all flex-shrink-0"
          >
            + ADD PAGE
          </button>
        </div>

        {/* Preview area */}
        {selectedPage ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Browser chrome — natural height, not overlaid */}
            <div className="flex-shrink-0 bg-gray-100 border-b border-gray-200 px-4 py-1.5 flex items-center gap-2">
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 flex items-center gap-2 border border-gray-200 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedBrand.accent }}
                />
                <span className="text-[11px] text-gray-400 font-mono truncate">
                  {selectedBrand.domain}/{selectedPage.slug}
                </span>
              </div>
              <a
                href={`/pages/${selectedPage.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-gray-400 hover:text-plum flex-shrink-0"
                title="Open full preview"
              >
                ↗
              </a>
            </div>
            {/* iframe fills remaining space below chrome */}
            <div className="flex-1 relative">
              <iframe
                key={`${selectedPage.id}-${previewKey}`}
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pages/${selectedPage.id}/preview?v=${previewKey}`}
                title={`Preview: ${selectedPage.title}`}
                className="absolute inset-0 w-full h-full border-none bg-white"
              />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50">
            <div className="w-20 h-20 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-4xl mb-5">
              🖥
            </div>
            <p className="text-xl font-bold text-charcoal mb-2">
              Select a page to preview
            </p>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Click any page in the left panel. You&apos;ll see the full draft
              content here before publishing.
            </p>
            {globalError && (
              <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {globalError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════
          ADD PAGE modal
      ════════════════════════════════ */}
      {showNew && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeNew}
        >
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-charcoal mb-4">New page</h2>

            {/* Brand selector */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Website
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {OS_BRANDS.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => setNewBrand(b.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      newBrand === b.key
                        ? "text-white border-transparent shadow-sm"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                    }`}
                    style={newBrand === b.key ? { backgroundColor: b.accent } : {}}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: newBrand === b.key ? "#fff" : b.accent }}
                    />
                    {b.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <label className="block mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Page title
              </span>
              <input
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug || newSlug === slugify(newTitle)) {
                    setNewSlug(slugify(e.target.value));
                  }
                }}
                placeholder="About Us"
                autoFocus
                className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum/50"
              />
            </label>

            {/* Slug */}
            <label className="block mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                URL slug
              </span>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="about-us"
                className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-plum/20 focus:border-plum/50"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-mono">
                {OS_BRANDS.find((b) => b.key === newBrand)?.domain}/
                {newSlug || "slug"}
              </p>
            </label>

            {createError && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {createError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createPending || !newTitle.trim() || !newSlug.trim()}
                className="flex-1 bg-plum text-white font-bold text-sm py-3 rounded-xl disabled:opacity-60 hover:bg-plum/90 transition-colors"
              >
                {createPending ? "Creating…" : "Create & open editor"}
              </button>
              <button
                type="button"
                onClick={closeNew}
                className="px-5 text-sm text-gray-500 hover:text-charcoal rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
