/** Shared types for the Blog Manager. Mirrors the `posts` table. */

import type { PageStatus } from "./pages";

export interface PostRow {
  id: string;
  brand_key: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  featured_image_url: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  status: PageStatus; // draft | review | published
  published_at: string | null;
  updated_at: string;
}

/** Fields the editor may patch (autosave). */
export type PostPatch = Partial<
  Pick<
    PostRow,
    | "title"
    | "excerpt"
    | "body"
    | "featured_image_url"
    | "author"
    | "category"
    | "tags"
  >
>;
