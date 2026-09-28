import { renderUrlset, SITEMAPS, xmlHeaders } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const key = name.replace(/\.xml$/, "") as keyof typeof SITEMAPS;
  if (!name.endsWith(".xml") || !(key in SITEMAPS)) return new Response("Not found", { status: 404 });
  const urls = await SITEMAPS[key]();
  if (!urls.length) return new Response("Not found", { status: 404 });
  return new Response(renderUrlset(urls), { headers: xmlHeaders });
}
