/**
 * Legacy symc.com.tr (WordPress / Flatsome) URL inventory → new URLs.
 *
 * Inventory sources (audited 2026-09-28):
 *  - https://www.symc.com.tr/wp-sitemap.xml (+ page & blocks sub-sitemaps)
 *  - WordPress REST API (pages, posts = 0, media library = 132 files)
 *  - Wayback Machine CDX for symc.com.tr/*
 *
 * KEEP (served 1:1 by the new app, identical path incl. trailing slash):
 *   /, /about/, /contact/, /news/, /completed-projects/, /new-construction/,
 *   /project-management-and-consultancy/, /retrofit-refit-services/,
 *   /yacht-management-service/, /feed/ (now a real RSS feed of news articles)
 *
 * Only URLs with a genuine equivalent are redirected. Unknown legacy URLs
 * (e.g. /wp-admin/, /xmlrpc.php, /comments/feed/, unused uploads) return a
 * real 404 instead of being funnelled to the homepage.
 */
import manifest from "../../../scripts/asset-prep/manifest.json";

export type LegacyRedirect = { source: string; destination: string };

export const legacyPageRedirects: LegacyRedirect[] = [
  // Flatsome "UX block" that WordPress exposed in its sitemap; its content was the footer "about" text.
  { source: "/blocks/footer-about-us/", destination: "/about/" },
  // WordPress page slug of the front page.
  { source: "/home/", destination: "/" },
  // WordPress core sitemaps → new sitemap index.
  { source: "/wp-sitemap.xml", destination: "/sitemap.xml" },
  { source: "/wp-sitemap-posts-page-1.xml", destination: "/sitemap.xml" },
  { source: "/wp-sitemap-posts-blocks-1.xml", destination: "/sitemap.xml" },
  { source: "/wp-sitemap-index.xsl", destination: "/sitemap.xml" },
];

const LOGO_UPLOADS = [
  "2026/01/SYMC_Logo_New-1.png",
  "2026/01/SYMC_Logo_New-1-956x800.png",
  "2026/01/SYMC_Logo_New.png",
];

/** Old /wp-content/uploads/* image URLs (incl. WP resized variants seen in live HTML) → new semantic media URLs. */
export const legacyImageRedirects: LegacyRedirect[] = [
  ...manifest.images.flatMap((image) =>
    image.old.map((old) => ({
      source: `/wp-content/uploads/${old}`,
      destination: `/media/${image.dest}`,
    })),
  ),
  ...LOGO_UPLOADS.map((old) => ({
    source: `/wp-content/uploads/${old}`,
    destination: "/brand/symc-logo.png",
  })),
];

export const legacyRedirects: LegacyRedirect[] = [...legacyPageRedirects, ...legacyImageRedirects];
