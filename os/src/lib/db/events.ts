/** Shared types for the Events Manager. Mirrors the `os_events` table. */

import type { PageStatus } from "./pages";

export const REGISTRATION_STATUSES = ["open", "closed", "waitlist"] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export interface EventRow {
  id: string;
  brand_key: string;
  slug: string;
  title: string;
  description: string | null;
  event_date: string | null; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  location: string | null;
  price_xaf: number | null;
  payunit_url: string | null;
  whatsapp_cta: string | null;
  facebook_embed_url: string | null;
  featured_image_url: string | null;
  registration_status: RegistrationStatus;
  status: PageStatus;
  updated_at: string;
}

/** Fields the editor may patch (autosave). */
export type EventPatch = Partial<
  Pick<
    EventRow,
    | "title"
    | "description"
    | "event_date"
    | "start_time"
    | "location"
    | "price_xaf"
    | "payunit_url"
    | "whatsapp_cta"
    | "facebook_embed_url"
    | "featured_image_url"
    | "registration_status"
  >
>;
