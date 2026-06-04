"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/components/BrandProvider";
import { generateDraft, listDrafts, sendBlogDraftToBlog, type AiKind, type AiDraftRow } from "./actions";

const KINDS: { key: AiKind; label: string }[] = [
  { key: "blog", label: "Blog article" },
  { key: "event", label: "Event description" },
  { key: "caption", label: "Social caption" },
  { key: "broadcast", label: "WhatsApp broadcast" },
];

export default function AiStudio() {
  const { brand } = useBrand();
  const router = useRouter();
  const [kind, setKind] = useState<AiKind>("blog");
  const [raw, setRaw] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<AiDraftRow[]>([]);
  const [title, setTitle] = useState("");
  const [lastDraftId, setLastDraftId] = useState<string | null>(null);

  async function refresh() {
    setDrafts(await listDrafts(brand.key));
  }
  useEffect(() => {
    setOutput(""); setRaw(""); setLastDraftId(null);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.key]);

  function handleGenerate() {
    setError(""); setOutput("");
    startTransition(async () => {
      const res = await generateDraft(brand.key, kind, raw);
      if ("error" in res) { setError(res.error); return; }
      setOutput(res.output);
      setLastDraftId(res.id);
      await refresh();
    });
  }

  function handleSendToBlog() {
    if (!lastDraftId) return;
    setError("");
    startTransition(async () => {
      const res = await sendBlogDraftToBlog(lastDraftId, title || raw.slice(0, 60));
      if ("error" in res) { setError(res.error); return; }
      router.push(`/blog/${res.postId}`);
    });
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-charcoal mb-1">AI Content Studio</h1>
      <p className="text-sm text-gray-500 mb-5">
        Notes in, polished draft out for{" "}
        <span className="font-semibold" style={{ color: brand.accent }}>{brand.name}</span>.
        AI never publishes — you always review first.
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button key={k.key} onClick={() => setKind(k.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                kind === k.key ? "bg-plum text-white border-plum" : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}>
              {k.label}
            </button>
          ))}
        </div>

        <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={5}
          placeholder="Paste your raw notes, bullet points, or a rough idea here…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-plum/20" />

        <button onClick={handleGenerate} disabled={pending || !raw.trim()}
          className="text-sm font-semibold bg-plum text-white px-5 py-2.5 rounded-lg hover:bg-plum/90 disabled:opacity-60">
          {pending ? "Generating…" : "Generate draft"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {output && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Draft for review</p>
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-4">{output}</div>
          {kind === "blog" && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-2 items-end">
                <label className="flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Post title</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title for the blog post"
                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20" />
                </label>
                <button onClick={handleSendToBlog} disabled={pending}
                  className="text-xs font-semibold bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 whitespace-nowrap">
                  Send to Blog as draft
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Creates a draft post — you then publish it from the Blog module.</p>
            </div>
          )}
        </div>
      )}

      {drafts.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Recent drafts</p>
          <div className="space-y-2">
            {drafts.map((d) => (
              <div key={d.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{d.kind}</span>
                  <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-600 rounded px-1.5 py-0.5">{d.status}</span>
                  <span className="text-[11px] text-gray-400 ml-auto">{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{d.output}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
