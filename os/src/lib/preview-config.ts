/**
 * P1E — Server-only resolution of a brand's public-site origin for the
 * secure preview plane. Imported only by server code (server actions and
 * the preview API route). Preserves the exact pre-P1E Delphine behaviour:
 * configured env → dev localhost fallback → throw in production.
 */
import { PREVIEW_SITE_URL_ENV, type OsBrand } from "./brands";

const DEV_FALLBACK_SITE_URL = "http://localhost:5173";

export function getBrandPublicSiteUrl(brandKey: OsBrand["key"]): string {
  const envName = PREVIEW_SITE_URL_ENV[brandKey];
  const configured = envName ? process.env[envName] : undefined;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK_SITE_URL;
  throw new Error(`${envName} must be set in production.`);
}
