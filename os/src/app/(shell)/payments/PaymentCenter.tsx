"use client";

import { useEffect, useState, useTransition } from "react";
import { useBrand } from "@/components/BrandProvider";
import { listClaims, createClaim, setClaimStatus } from "./actions";
import {
  CLAIM_STATUSES,
  CLAIM_STATUS_LABEL,
  type PaymentClaimRow,
  type ClaimStatus,
} from "@/lib/db/payments";

const STATUS_STYLE: Record<ClaimStatus, string> = {
  claimed: "bg-blue-100 text-blue-700",
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function PaymentCenter() {
  const { brand } = useBrand();
  const [claims, setClaims] = useState<PaymentClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ program: "", amount: "", name: "", phone: "", email: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setClaims(await listClaims(brand.key));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.key]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createClaim({
        brandKey: brand.key,
        programName: form.program,
        amountXaf: form.amount ? Number(form.amount) : null,
        claimantName: form.name,
        claimantPhone: form.phone,
        claimantEmail: form.email,
      });
      if ("error" in res) { setError(res.error); return; }
      setForm({ program: "", amount: "", name: "", phone: "", email: "" });
      setShowNew(false);
      await refresh();
    });
  }

  async function changeStatus(id: string, status: ClaimStatus) {
    await setClaimStatus(id, status);
    await refresh();
  }

  const confirmed = claims.filter((c) => c.status === "confirmed").length;
  const pendingCount = claims.filter((c) => c.status === "claimed" || c.status === "pending_confirmation").length;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-charcoal">Payments</h1>
        <button onClick={() => setShowNew((v) => !v)}
          className="text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90">
          + Log a payment claim
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Payment claims for <span className="font-semibold" style={{ color: brand.accent }}>{brand.name}</span>.
        PayUnit links are unchanged; this tracks who paid and verification.
      </p>

      <div className="flex gap-4 mb-6">
        <Stat label="Confirmed" value={confirmed} color="text-green-600" />
        <Stat label="Awaiting verification" value={pendingCount} color="text-amber-600" />
        <Stat label="Total" value={claims.length} color="text-plum" />
      </div>

      {showNew && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-2 gap-3">
          <Input label="Program" value={form.program} onChange={(v) => setForm({ ...form, program: v })} placeholder="SMCC Cohort I" required />
          <Input label="Amount (XAF)" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} placeholder="50000" />
          <Input label="Payer name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div className="col-span-2 flex items-center gap-2">
            <button type="submit" disabled={pending || !form.program.trim()}
              className="text-xs font-semibold bg-plum text-white px-4 py-2 rounded-lg hover:bg-plum/90 disabled:opacity-60">
              {pending ? "Saving…" : "Save claim"}
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="text-xs text-gray-500 px-3 py-2">Cancel</button>
            {error && <span className="text-red-600 text-xs">{error}</span>}
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : claims.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-2xl">
          No payment claims yet.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Program", "Amount", "Payer", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-charcoal">{c.program_name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.amount_xaf ? `${c.amount_xaf.toLocaleString()} XAF` : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.claimant_name ?? "—"}
                    {c.claimant_phone && <span className="block text-[11px] text-gray-400">{c.claimant_phone}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                      {CLAIM_STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value as ClaimStatus)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
                      {CLAIM_STATUSES.map((s) => <option key={s} value={s}>{CLAIM_STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-center min-w-[120px]">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, required,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum/20" />
    </label>
  );
}
