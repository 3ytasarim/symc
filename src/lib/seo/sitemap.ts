import "server-only";
import { prisma } from "@/lib/db";
import { mediaUrl } from "@/lib/storage/paths";
import { absoluteUrl, routes } from "./site";
import { STATIC_PAGE_UPDATED } from "./static-pages";

/**
 * Sitemap data. Only published, indexable, self-canonical URLs that return
 * HTTP 200 are listed, with their real last-modified dates and their
 * important images (image sitemap extension).
 */
export type SitemapUrl = { loc: string; lastmod: Date; images: string[] };

const max = (...dates: (Date | null | undefined)[]) =>
  new Date(Math.max(...dates.filter((d): d is Date => d instanceof Date).map((d) => d.getTime()), 0));

export async function serviceUrls(): Promise<SitemapUrl[]> {
  const rows = await prisma.service.findMany({
    where: { publishStatus: "PUBLISHED", robotsIndex: true },
    orderBy: { sortOrder: "asc" },
    include: { heroImage: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });
  return rows.map((s) => ({
    loc: absoluteUrl(routes.service(s.slug)),
    lastmod: s.updatedAt,
    images: unique([s.heroImage?.storageKey, ...s.gallery.map((g) => g.media.storageKey)]),
  }));
}

export async function projectUrls(): Promise<SitemapUrl[]> {
  const rows = await prisma.project.findMany({
    where: { publishStatus: "PUBLISHED", robotsIndex: true },
    orderBy: { sortOrder: "asc" },
    include: { coverImage: true, heroImage: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });
  return rows.map((p) => ({
    loc: absoluteUrl(routes.project(p.slug)),
    lastmod: p.updatedAt,
    images: unique([p.heroImage?.storageKey, p.coverImage?.storageKey, ...p.gallery.map((g) => g.media.storageKey)]),
  }));
}

export async function postUrls(): Promise<SitemapUrl[]> {
  const rows = await prisma.blogPost.findMany({
    where: { publishStatus: "PUBLISHED", publishedAt: { lte: new Date() }, robotsIndex: true, canonicalUrl: null },
    orderBy: { publishedAt: "desc" },
    include: { coverImage: true },
  });
  return rows.map((p) => ({
    loc: absoluteUrl(routes.post(p.slug)),
    lastmod: p.updatedAt,
    images: unique([p.coverImage?.storageKey]),
  }));
}

export async function pageUrls(): Promise<SitemapUrl[]> {
  const [settings, services, projects, posts] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: "site" }, include: { homeHeroImage: true } }),
    prisma.service.aggregate({ where: { publishStatus: "PUBLISHED" }, _max: { updatedAt: true } }),
    prisma.project.aggregate({ where: { publishStatus: "PUBLISHED" }, _max: { updatedAt: true } }),
    prisma.blogPost.aggregate({
      where: { publishStatus: "PUBLISHED", publishedAt: { lte: new Date() }, robotsIndex: true },
      _max: { updatedAt: true },
      _count: true,
    }),
  ]);
  const d = (key: keyof typeof STATIC_PAGE_UPDATED) => new Date(`${STATIC_PAGE_UPDATED[key]}T00:00:00Z`);
  const urls: SitemapUrl[] = [
    {
      loc: absoluteUrl(routes.home),
      lastmod: max(settings?.updatedAt, services._max.updatedAt, projects._max.updatedAt, posts._max.updatedAt),
      images: unique([settings?.homeHeroImage?.storageKey]),
    },
    { loc: absoluteUrl(routes.about), lastmod: d("about"), images: [] },
    { loc: absoluteUrl(routes.services), lastmod: max(d("services"), services._max.updatedAt), images: [] },
    { loc: absoluteUrl(routes.projects), lastmod: max(d("projects"), projects._max.updatedAt), images: [] },
    { loc: absoluteUrl(routes.contact), lastmod: max(d("contact"), settings?.updatedAt), images: [] },
  ];
  // The news listing is noindex while empty, so it is only listed once articles exist.
  if (posts._count > 0) urls.push({ loc: absoluteUrl(routes.news), lastmod: max(d("news"), posts._max.updatedAt), images: [] });
  return urls;
}

function unique(keys: (string | null | undefined)[]): string[] {
  return [...new Set(keys.filter((k): k is string => Boolean(k)))].map((k) => absoluteUrl(mediaUrl(k)));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderUrlset(urls: SitemapUrl[]): string {
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${u.lastmod.toISOString()}</lastmod>\n` +
        u.images.map((img) => `    <image:image>\n      <image:loc>${esc(img)}</image:loc>\n    </image:image>\n`).join("") +
        `  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

export function renderIndex(entries: { loc: string; lastmod: Date }[]): string {
  const body = entries
    .map((e) => `  <sitemap>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod.toISOString()}</lastmod>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export const xmlHeaders = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
};

export const SITEMAPS = {
  pages: pageUrls,
  services: serviceUrls,
  projects: projectUrls,
  news: postUrls,
} as const;
