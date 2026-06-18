"use client";

import { useEffect, useState, useTransition } from "react";
import {
  listVersions,
  saveVersion,
  restoreVersion,
  rollbackToVersion,
  type VersionRow,
} from "@/app/(shell)/pages/actions";
import type { SectionRow } from "@/lib/db/pages";

interface VersionHistoryProps {
  pageId: string;
  pageTitle: string;
  pageSlug?: string;
  pageBrand?: string;
  currentSections: SectionRow[];
  publishedVersionId?: string | null;
  onRestored: (sections: SectionRow[]) => void;
  onPublished?: (versionId: string) => void;
  onClose: () => void;
}

export default function VersionHistory({
  pageId,
  pageTitle,
  pageSlug,
  pageBrand,
  currentSections,
  publishedVersionId,
  onRestored,
  onPublished,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [savePending, startSave] = useTransition();
  const [restoring, setRestoring] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const rows = await listVersions(pageId);
    // Filter out auto-generated "Secure preview" sessions — not publishable
    setVersions(rows.filter((v) => v.label !== "Secure preview"));
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [pageId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startSave(async () => {
      await saveVersion(pageId, pageTitle, currentSections, label.trim() || undefined);
      setLabel("");
      await refresh();
    });
  }

  async function handleRestore(versionId: string) {
    if (!confirm("Restore this version as draft? Current sections will be replaced. Published content is NOT changed.")) return;
    setRestoring(versionId);
    const sections = await restoreVersion(versionId, pageId);
    setRestoring(null);
    onRestored(sections);
    onClose();
  }

  async function handlePublishVersion(versionId: string) {
    if (!confirm("Publish this exact version? This will become the live public content immediately.")) return;
    setPublishing(versionId);
    const result = await rollbackToVersion(pageId, versionId);
    setPublishing(null);
    if ("error" in result) {
      alert(`Publish failed: ${result.error}`);
      return;
    }
    onPublished?.(result.publishedVersionId);
    onClose();
  }

  const compareVersion = versions.find((v) => v.id === compareId);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-charcoal">Version History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{pageTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-charcoal text-lg"
          >
            ✕
          </button>
        </div>

        {/* Save snapshot */}
        <form onSubmit={handleSave} className="px-5 py-4 border-b border-gray-100 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Version label (optional)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20"
          />
          <button
            type="submit"
            disabled={savePending}
            className="text-xs font-bold bg-plum text-white px-3 py-2 rounded-lg disabled:opacity-60 hover:bg-plum/90 flex-shrink-0"
          >
            {savePending ? "Saving…" : "Save snapshot"}
          </button>
        </form>

        {/* Compare view */}
        {compareId && compareVersion && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-amber-700">
                Comparing: {compareVersion.label ?? new Date(compareVersion.created_at).toLocaleString()}
              </p>
              <button
                type="button"
                onClick={() => setCompareId(null)}
                className="text-xs text-amber-600 hover:text-amber-800"
              >
                Close compare
              </button>
            </div>
            <p className="text-xs text-amber-600">
              Snapshot has <strong>{(compareVersion.sections as SectionRow[]).length}</strong> sections ·
              Current has <strong>{currentSections.length}</strong> sections
            </p>
            <div className="mt-2 space-y-1">
              {(compareVersion.sections as SectionRow[]).map((s, i) => (
                <div key={i} className="text-[11px] text-amber-700 bg-amber-100 px-2 py-1 rounded flex items-center gap-2">
                  <span className="font-bold">{i + 1}</span>
                  <span>{s.type}</span>
                  {s.title && <span className="text-amber-500 truncate">— {s.title}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="text-gray-400 text-sm text-center py-10">Loading versions…</p>
          )}

          {!loading && versions.length === 0 && (
            <div className="text-center py-12 px-5">
              <div className="text-3xl mb-3">🕐</div>
              <p className="text-sm font-semibold text-charcoal">No snapshots yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Save a snapshot above to record the current state of this page.
              </p>
            </div>
          )}

          {versions.map((v) => {
            const sections = v.sections as SectionRow[];
            const date = new Date(v.created_at);
            const isComparing = compareId === v.id;
            const isLive = v.id === publishedVersionId;
            const isRestoring = restoring === v.id;
            const isPublishing = publishing === v.id;
            return (
              <div
                key={v.id}
                className={`px-5 py-4 border-b border-gray-100 last:border-0 ${
                  isLive
                    ? "bg-green-50 border-l-2 border-l-green-500"
                    : isComparing
                    ? "bg-amber-50"
                    : "hover:bg-gray-50"
                } transition-colors`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-charcoal truncate">
                        {v.label ?? "Snapshot"}
                      </p>
                      {isLive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                    {v.status}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mb-2">
                  {sections.length} section{sections.length !== 1 ? "s" : ""}
                </p>

                <div className="flex gap-1.5 flex-wrap">
                  {/* Compare — always available */}
                  <button
                    type="button"
                    onClick={() => setCompareId(isComparing ? null : v.id)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      isComparing
                        ? "bg-amber-100 border-amber-300 text-amber-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-charcoal"
                    }`}
                  >
                    {isComparing ? "Comparing" : "Compare"}
                  </button>

                  {/* Restore Draft — mutates draft sections, does NOT change live content */}
                  <button
                    type="button"
                    disabled={isRestoring}
                    onClick={() => handleRestore(v.id)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-plum/40 hover:text-plum disabled:opacity-50 transition-all"
                    title="Restore as draft — live content is unchanged"
                  >
                    {isRestoring ? "Restoring…" : "Restore Draft"}
                  </button>

                  {/* Publish Version — moves published_version_id pointer, no draft mutation */}
                  {!isLive && (
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={() => handlePublishVersion(v.id)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all"
                      title="Publish this exact version — becomes live immediately"
                    >
                      {isPublishing ? "Publishing…" : "Publish Version"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
