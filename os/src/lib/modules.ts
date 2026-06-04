/**
 * Module registry — single source of truth for navigation,
 * dashboard cards and placeholder pages. Phase C: all placeholders.
 * Build order per ecosystem plan: blog (D) → events (E) → pages (F)
 * → messages (I) → payments + telegram (G–J) → ai-studio (K).
 */

export type OsModuleStatus = "placeholder" | "beta" | "live";

export interface OsModule {
  key: string;
  title: string;
  href: string;
  glyph: string;
  description: string;
  planned: string[];
  phase: string;
  status: OsModuleStatus;
}

export const OS_MODULES: OsModule[] = [
  {
    key: "pages",
    title: "Pages",
    href: "/pages",
    glyph: "Pg",
    description: "Structured-block page editor for all brand websites.",
    planned: [
      "Page list per brand (slug, status, last edit)",
      "Section editor: hero, text, cards, CTA, image, event block",
      "Draft → review → publish workflow with preview",
    ],
    phase: "Phase F",
    status: "live",
  },
  {
    key: "blog",
    title: "Blog",
    href: "/blog",
    glyph: "Bl",
    description: "Create, review and publish posts to the right brand site.",
    planned: [
      "Post editor: title, slug, excerpt, body, featured image, tags",
      "AI-assisted improvement of raw notes (via AI Studio)",
      "Draft → review → publish; published_at scheduling",
    ],
    phase: "Phase D",
    status: "live",
  },
  {
    key: "events",
    title: "Events",
    href: "/events",
    glyph: "Ev",
    description: "Conferences, cohorts and programs across all brands.",
    planned: [
      "Event editor incl. PayUnit link, WhatsApp CTA, Facebook embed",
      "Registration status (open / closed / waitlist)",
      "Frontends pull published events from the OS",
    ],
    phase: "Phase E",
    status: "live",
  },
  {
    key: "messages",
    title: "Messages",
    href: "/messages",
    glyph: "Ms",
    description: "One inbox: WhatsApp, email, Telegram, web forms.",
    planned: [
      "Conversation list with brand / platform / status filters",
      "Payment-issue and registration-issue flags, resolve flow",
      "Webform ingestion first; Twilio WhatsApp inbound next",
    ],
    phase: "Phase I",
    status: "live",
  },
  {
    key: "payments",
    title: "Payments",
    href: "/payments",
    glyph: "Pay",
    description: "PayUnit links, claims and human verification.",
    planned: [
      "Program → PayUnit link registry (existing links unchanged)",
      "Claim → pending → confirmed workflow with verifier audit",
      "Telegram alert on every status change",
    ],
    phase: "Phases G–J",
    status: "live",
  },
  {
    key: "media",
    title: "Media",
    href: "/media",
    glyph: "Md",
    description: "Shared image library across brands.",
    planned: [
      "Upload to Supabase Storage / reference R2 and public folders",
      "Attach to posts, events and page sections",
      "Reuse + alt-text management",
    ],
    phase: "Phase F+",
    status: "live",
  },
  {
    key: "ai-studio",
    title: "AI Studio",
    href: "/ai-studio",
    glyph: "AI",
    description: "Raw notes & voice → reviewed drafts. Never auto-publishes.",
    planned: [
      "Paste/upload notes, images, voice notes (Whisper transcription)",
      "Generate blog drafts, event copy, captions, broadcasts",
      "Mandatory review gate: draft → review → approve → publish",
    ],
    phase: "Phase K",
    status: "live",
  },
  {
    key: "settings",
    title: "Settings",
    href: "/settings",
    glyph: "St",
    description: "Brands, team, channels and operational config.",
    planned: [
      "Brand registry (mirrors `brands` table)",
      "Team users & roles (admin / editor / reviewer)",
      "Notification channels: Telegram, Resend, Twilio",
    ],
    phase: "Ongoing",
    status: "live",
  },
];

export function getOsModule(key: string): OsModule | undefined {
  return OS_MODULES.find((m) => m.key === key);
}
