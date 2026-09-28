import { absoluteUrl } from "@/lib/seo/site";
import { renderIndex, SITEMAPS, xmlHeaders } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";

/** Sitemap index — child sitemaps are only listed when they contain URLs. */
export async function GET() {
  const entries = await Promise.all(
    Object.entries(SITEMAPS).map(async ([name, load]) => {
      const urls = await load();
      if (!urls.length) return null;
      const lastmod = new Date(Math.max(...urls.map((u) => u.lastmod.getTime())));
      return { loc: absoluteUrl(`/sitemaps/${name}.xml`), lastmod };
    }),
  );
  return new Response(renderIndex(entries.filter((e): e is { loc: string; lastmod: Date } => e !== null)), { headers: xmlHeaders });
}
