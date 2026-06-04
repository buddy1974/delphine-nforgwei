/** Shared types for the Page Builder. Mirrors the `pages` + `sections` tables. */

export const SECTION_TYPES = [
  "row",          // H6B: multi-column row container
  "hero",
  "text",
  "cards",
  "cta",
  "image",
  "event_block",
  "program_card",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

// H6B: column layout specs supported by the row renderer
export const ROW_LAYOUTS = ["1", "2", "3", "70-30", "30-70"] as const;
export type RowLayout = (typeof ROW_LAYOUTS)[number];

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
  // H6B layout fields (null for all legacy sections)
  parent_id: string | null;   // null = top-level; uuid = child of that row
  col: number | null;         // 0-based column index when inside a row
  layout: RowLayout | null;   // column-width spec for type='row' sections
  // Content fields
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  order: number;
}

/**
 * Fields the section editor may patch via autosave.
 * Structural fields (parent_id, col, layout) are intentionally excluded —
 * they are set at creation time, not edited inline.
 */
export type SectionPatch = Partial<
  Pick<
    SectionRow,
    "title" | "subtitle" | "body" | "image_url" | "button_label" | "button_url" | "order"
  >
>;

export const SECTION_TYPE_LABEL: Record<SectionType, string> = {
  row:          "Row Layout",
  hero:         "Hero Section",
  text:         "About Section",
  cards:        "Feature Cards",
  cta:          "Call to Action",
  image:        "Photo",
  event_block:  "Event",
  program_card: "Program",
};

export const SECTION_ICONS: Record<SectionType, string> = {
  row: "⬜",
  hero: "🏠",
  text: "📄",
  cards: "🃏",
  cta: "📢",
  image: "🖼️",
  event_block: "📅",
  program_card: "🎓",
};
