/**
 * Single source of truth for the canonical production origin.
 *
 * Verified against the live production setup (2026-09-28):
 *   https://symc.com.tr/  → 301 → https://www.symc.com.tr/
 *   https://www.symc.com.tr/ → 200, <link rel=canonical href="https://www.symc.com.tr/">
 * so the canonical origin is https://www.symc.com.tr and all URLs end with "/".
 *
 * SITE_URL may override it for a staging deployment, but values that would
 * leak a non-public host (localhost, IPs, internal names, plain http) are
 * rejected so a canonical/sitemap can never point at them.
 */
export const PRODUCTION_ORIGIN = "https://www.symc.com.tr";

function isPublicHttpsOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname;
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return false; // IPv4 / IPv6
    return host.includes(".");
  } catch {
    return false;
  }
}

function resolveOrigin(): string {
  const override = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (override && isPublicHttpsOrigin(override)) return override;
  if (override) {
    console.warn(`[seo] Ignoring SITE_URL="${override}" (not a public https origin); using ${PRODUCTION_ORIGIN}`);
  }
  return PRODUCTION_ORIGIN;
}

export const SITE_ORIGIN = resolveOrigin();

export const SITE_NAME = "SYMC YACHT";
export const SITE_LOCALE = "en_US";
export const SITE_LANGUAGE = "en";

/** Normalises an app path to the canonical trailing-slash form ("/about" → "/about/"). */
export function canonicalPath(path: string): string {
  const [pathname = "/"] = path.split(/[?#]/);
  if (pathname === "" || pathname === "/") return "/";
  const withLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // file-like paths (e.g. /sitemap.xml, /media/x.jpg) keep their exact form
  if (/\.[a-z0-9]{2,5}$/i.test(withLeading)) return withLeading;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/** Absolute URL on the canonical origin. Absolute http(s) inputs are returned unchanged. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${canonicalPath(path)}`;
}

export const routes = {
  home: "/",
  about: "/about/",
  services: "/services/",
  service: (slug: string) => `/${slug}/`,
  projects: "/completed-projects/",
  project: (slug: string) => `/completed-projects/${slug}/`,
  news: "/news/",
  post: (slug: string) => `/news/${slug}/`,
  contact: "/contact/",
} as const;
