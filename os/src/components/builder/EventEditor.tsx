"use client";

import { useState } from "react";
import Link from "next/link";
import AutoField from "./AutoField";
import type { EventRow, EventPatch, RegistrationStatus } from "@/lib/db/events";
import { REGISTRATION_STATUSES } from "@/lib/db/events";
import { PAGE_STATUSES, type PageStatus } from "@/lib/db/pages";
import { runSave } from "@/lib/save-result";
import { updateEvent, setEventStatus } from "@/app/(shell)/events/actions";

export default function EventEditor({ event }: { event: EventRow }) {
  const [status, setStatus] = useState<PageStatus>(event.status);
  const [reg, setReg] = useState<RegistrationStatus>(event.registration_status);
  const [image, setImage] = useState(event.featured_image_url ?? "");

  // P1D.6: runSave normalizes all server/network errors — strict ok===true detection
  async function save(patch: EventPatch) {
    return await runSave(() => updateEvent(event.id, patch));
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <Link href="/events" className="text-xs text-gray-500 hover:text-charcoal">← All events</Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Status</span>
          <select
            value={status}
            onChange={async (e) => { const v = e.target.value as PageStatus; setStatus(v); await setEventStatus(event.id, v); }}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
          >
            {PAGE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {status === "published" && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-full px-2.5 py-1">Live</span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 px-2 mb-4">
        /events/{event.slug} · {event.brand_key} · changes save automatically
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <AutoField label="Event title" value={event.title} big onSave={(v) => save({ title: v })} />
        <AutoField label="Description" value={event.description ?? ""} multiline
          placeholder="What is this event about?" onSave={(v) => save({ description: v })} />

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</span>
            <input type="date" defaultValue={event.event_date ?? ""}
              onChange={(e) => save({ event_date: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Start time</span>
            <input type="time" defaultValue={event.start_time?.slice(0, 5) ?? ""}
              onChange={(e) => save({ start_time: e.target.value })}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </label>
          <AutoField label="Price (XAF, 0 = free)" value={event.price_xaf?.toString() ?? ""}
            placeholder="50000" onSave={(v) => save({ price_xaf: Number(v) || 0 })} />
        </div>

        <AutoField label="Location" value={event.location ?? ""} placeholder="Yaoundé, Cameroon or Online"
          onSave={(v) => save({ location: v })} />

        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <AutoField label="Featured image URL" value={image} placeholder="https://… or /images/event.jpg"
              onSave={async (v) => { setImage(v); return await save({ featured_image_url: v }); }} />
          </div>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-300 flex-shrink-0">no image</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AutoField label="PayUnit payment link" value={event.payunit_url ?? ""}
            placeholder="https://lk.payunit.net/pay/…" onSave={(v) => save({ payunit_url: v })} />
          <AutoField label="WhatsApp number (digits)" value={event.whatsapp_cta ?? ""}
            placeholder="237683493220" onSave={(v) => save({ whatsapp_cta: v })} />
        </div>

        <AutoField label="Facebook event embed URL (optional)" value={event.facebook_embed_url ?? ""}
          placeholder="https://www.facebook.com/events/…" onSave={(v) => save({ facebook_embed_url: v })} />

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Registration</span>
          <select
            value={reg}
            onChange={async (e) => { const v = e.target.value as RegistrationStatus; setReg(v); await save({ registration_status: v }); }}
            className="block mt-1 text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            {REGISTRATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        Set status to <strong>published</strong> and the event appears on the {event.brand_key} website
        at <code>/events/{event.slug}</code> within ~30 seconds.
      </p>
    </div>
  );
}
