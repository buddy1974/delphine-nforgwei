/**
 * Brand registry — Phase C static mirror of the `brands` DB table
 * (seeded by supabase/migrations/0001). From Phase D the switcher
 * reads the table; keep keys in sync: delphine | smcc | ewoman | drimp.
 */

export interface OsBrand {
  key: "delphine" | "smcc" | "ewoman" | "drimp";
  name: string;
  shortName: string;
  domain: string;
  accent: string;
  active: boolean;
}

export const OS_BRANDS: OsBrand[] = [
  {
    key: "delphine",
    name: "Delphine Nforgwei",
    shortName: "Delphine",
    domain: "delphine-nforgwei.com",
    accent: "#C9A227",
    active: true,
  },
  {
    key: "smcc",
    name: "SMCC — School of Marriage Counseling & Coaching",
    shortName: "SMCC",
    domain: "smcc.solutions",
    accent: "#5B1A5D",
    active: true,
  },
  {
    key: "ewoman",
    name: "E-Woman Conference",
    shortName: "E-Woman",
    domain: "e-womanconference.online",
    accent: "#8A3B5C",
    active: true,
  },
  {
    key: "drimp",
    name: "DRIMP Foundation",
    shortName: "DRIMP",
    domain: "drimpfoundation.org",
    accent: "#2A6041",
    active: true,
  },
];

export const DEFAULT_BRAND_KEY: OsBrand["key"] = "delphine";
