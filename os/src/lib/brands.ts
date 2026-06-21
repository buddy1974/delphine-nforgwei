/**
 * Brand registry — Phase C static mirror of the `brands` DB table
 * (seeded by supabase/migrations/0001). From Phase D the switcher
 * reads the table; keep keys in sync: delphine | smcc | ewoman | drimp.
 *
 * P1E: each brand declares a `previewMode`:
 *   - "secure"  → edit-the-website secure preview plane (Delphine; H8 target)
 *   - "generic" → OS-internal generic block preview (current default)
 * Only Delphine is "secure". Other brands stay "generic" until H8 activates them.
 */

export interface OsBrand {
  key: "delphine" | "smcc" | "ewoman" | "drimp";
  name: string;
  shortName: string;
  domain: string;
  accent: string;
  active: boolean;
  previewMode: "secure" | "generic";
}

export const OS_BRANDS: OsBrand[] = [
  {
    key: "delphine",
    name: "Delphine Nforgwei",
    shortName: "Delphine",
    domain: "delphine-nforgwei.com",
    accent: "#C9A227",
    active: true,
    previewMode: "secure",
  },
  {
    key: "smcc",
    name: "SMCC — School of Marriage Counseling & Coaching",
    shortName: "SMCC",
    domain: "smcc.solutions",
    accent: "#5B1A5D",
    active: true,
    previewMode: "generic",
  },
  {
    key: "ewoman",
    name: "E-Woman Conference",
    shortName: "E-Woman",
    domain: "e-womanconference.online",
    accent: "#8A3B5C",
    active: true,
    previewMode: "generic",
  },
  {
    key: "drimp",
    name: "DRIMP Foundation",
    shortName: "DRIMP",
    domain: "drimpfoundation.org",
    accent: "#2A6041",
    active: true,
    previewMode: "generic",
  },
];

export const DEFAULT_BRAND_KEY: OsBrand["key"] = "delphine";

/**
 * P1E: env var NAME that holds each brand's public-site origin used by the
 * secure preview plane. These are names only (client-safe); the values are
 * read server-side in lib/preview-config.ts. Other-brand vars are prepared
 * for H8 but inert until that brand's previewMode is "secure".
 */
export const PREVIEW_SITE_URL_ENV: Record<OsBrand["key"], string> = {
  delphine: "DELPHINE_PUBLIC_SITE_URL",
  smcc: "SMCC_PUBLIC_SITE_URL",
  ewoman: "EWOMAN_PUBLIC_SITE_URL",
  drimp: "DRIMP_PUBLIC_SITE_URL",
};

export function getOsBrand(key: string): OsBrand | undefined {
  return OS_BRANDS.find((b) => b.key === key);
}
