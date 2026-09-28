import { prisma } from "@/lib/db";
import { htmlToText } from "@/lib/content/sanitize";
import { mediaUrl } from "@/lib/storage/paths";
import { absoluteUrl, routes, SITE_NAME } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of published news (keeps the legacy WordPress /feed/ URL alive). */
export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { publishStatus: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { coverImage: true },
  });
  const items = posts
    .map((p) => {
      const url = absoluteUrl(routes.post(p.slug));
      const enclosure = p.coverImage
        ? `\n      <enclosure url="${esc(absoluteUrl(mediaUrl(p.coverImage.storageKey)))}" length="${p.coverImage.sizeBytes}" type="${p.coverImage.mimeType}" />`
        : "";
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || htmlToText(p.content).slice(0, 300))}</description>${enclosure}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — News</title>
    <link>${esc(absoluteUrl(routes.news))}</link>
    <description>News from SYMC — Superyacht Management &amp; Consultancy</description>
    <language>en</language>
    <atom:link href="${esc(absoluteUrl("/feed/"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
