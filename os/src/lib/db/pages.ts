/** Shared types for the Page Builder. Mirrors the `pages` + `sections` tables. */

export const SECTION_TYPES = [
  "hero",
  "text",
  "cards",
  "cta",
  "image",
  "event_block",
  "program_card",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const PAGE_STATUSES = ["draft", "review", "published"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export interface PageRow {
  id: string;
  brand_key: string;
  slug: string;
  title: string;
  status: PageStatus;
  updated_at: string;
}

export interface SectionRow {
  id: string;
  page_id: string;
  type: SectionType;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  order: number;
}

/** Fields a section editor may patch (autosave). */
export type SectionPatch = Partial<
  Pick<
    SectionRow,
    "title" | "subtitle" | "body" | "image_url" | "button_label" | "button_url" | "order"
  >
>;

export const SECTION_TYPE_LABEL: Record<SectionType, string> = {
  hero: "Banner",
  text: "Content",
  cards: "Cards",
  cta: "Call to Action",
  image: "Photo",
  event_block: "Event",
  program_card: "Program",
};

export const SECTION_ICONS: Record<SectionType, string> = {
  hero: "🏠",
  text: "📄",
  cards: "🃏",
  cta: "📢",
  image: "🖼️",
  event_block: "📅",
  program_card: "🎓",
};
