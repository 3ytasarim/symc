/**
 * SEO QA — checks the server-rendered HTML (no JavaScript executed) of
 * representative public URLs.
 *
 *   npm run seo:check -- http://localhost:3300
 *
 * For every URL in the sitemap plus key pages:
 *   HTTP status, <title>, meta description, absolute self-canonical on the
 *   production origin, robots directives, exactly one <h1>, og:image (+ real
 *   width/height/type matching the file), JSON-LD graph (Organization, WebSite,
 *   WebPage, BreadcrumbList, primary ImageObject, CreativeWork/Service/BlogPosting),
 *   primary image present in the HTML, broken internal links and images,
 *   identical HTML for browser / Googlebot / Googlebot-Image user agents.
 * Also: 404 behaviour, legacy redirects, robots.txt and sitemap sanity.
 */
import { readImageMetaFromBuffer } from "../src/lib/seo/image-header";

const BASE = (process.argv[2] ?? "http://localhost:3300").replace(/\/$/, "");
const ORIGIN = "https://www.symc.com.tr";
const UA = {
  browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  googlebotImage: "Googlebot-Image/1.0",
};

type Result = { url: string; errors: string[]; warnings: string[]; info: string[] };
const results: Result[] = [];
const linkTargets = new Set<string>();
const imageTargets = new Set<string>();

function toLocal(url: string) {
  return url.startsWith(ORIGIN) ? BASE + url.slice(ORIGIN.length) : url;
}

async function get(url: string, ua = UA.browser, method = "GET") {
  return fetch(url, { headers: { "user-agent": ua }, redirect: "manual", method });
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function meta(html: string, attr: "name" | "property", key: string): string | null {
  const re = new RegExp(`<meta[^>]*${attr}="${key.replace(/[:.]/g, "\\$&")}"[^>]*content="([^"]*)"`, "i");
  const re2 = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${key.replace(/[:.]/g, "\\$&")}"`, "i");
  const m = html.match(re) ?? html.match(re2);
  return m ? decode(m[1]!) : null;
}

type Node = Record<string, unknown>;

function graphOf(html: string): Node[] {
  const out: Node[] = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]!) as { "@graph"?: Node[] };
    out.push(...(data["@graph"] ?? [data as Node]));
  }
  return out;
}

const hasType = (n: Node, t: string) => (Array.isArray(n["@type"]) ? (n["@type"] as string[]).includes(t) : n["@type"] === t);

async function checkPage(path: string, expect: { kind: "home" | "page" | "service" | "project" | "article" | "listing"; index?: boolean }) {
  const url = BASE + path;
  const r: Result = { url: path, errors: [], warnings: [], info: [] };
  results.push(r);
  const res = await get(url);
  if (res.status !== 200) {
    r.errors.push(`HTTP ${res.status}`);
    return;
  }
  const html = await res.text();
  const head = html.slice(0, html.indexOf("</head>"));

  const title = head.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) r.errors.push("missing <title>");
  else if (title.length > 70) r.warnings.push(`title is ${title.length} chars`);

  const desc = meta(head, "name", "description");
  if (!desc) r.errors.push("missing meta description");
  else if (desc.length < 70 || desc.length > 170) r.warnings.push(`description is ${desc.length} chars`);

  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const expected = ORIGIN + path;
  if (!canonical) r.errors.push("missing canonical");
  else {
    if (!canonical.startsWith(`${ORIGIN}/`)) r.errors.push(`canonical not on production origin: ${canonical}`);
    if (/localhost|127\.0\.0\.1|http:\/\//.test(canonical)) r.errors.push(`canonical leaks non-public host: ${canonical}`);
    if (canonical !== expected) r.errors.push(`canonical ${canonical} ≠ self ${expected}`);
  }

  const robots = meta(head, "name", "robots") ?? "";
  if (expect.index === false) {
    if (!robots.includes("noindex")) r.errors.push(`expected noindex, got "${robots}"`);
  } else {
    for (const d of ["index", "follow", "max-image-preview:large", "max-snippet:-1", "max-video-preview:-1"]) {
      if (!robots.split(/,\s*/).includes(d)) r.errors.push(`robots missing ${d} (got "${robots}")`);
    }
  }

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) r.errors.push(`${h1s} <h1> elements`);

  const ogImage = meta(head, "property", "og:image");
  if (!ogImage) r.errors.push("missing og:image");
  else {
    if (!ogImage.startsWith(`${ORIGIN}/`)) r.errors.push(`og:image not absolute on origin: ${ogImage}`);
    const w = Number(meta(head, "property", "og:image:width"));
    const h = Number(meta(head, "property", "og:image:height"));
    const t = meta(head, "property", "og:image:type");
    const img = await get(toLocal(ogImage));
    if (img.status !== 200) r.errors.push(`og:image HTTP ${img.status}`);
    else {
      const real = readImageMetaFromBuffer(new Uint8Array(await img.arrayBuffer()));
      if (!real) r.errors.push("og:image is not a readable image");
      else if (real.width !== w || real.height !== h || real.mimeType !== t)
        r.errors.push(`og:image meta ${w}x${h} ${t} ≠ real ${real.width}x${real.height} ${real.mimeType}`);
      else r.info.push(`og:image ${w}x${h} ${t} ✓ real`);
    }
  }
  for (const key of ["og:title", "og:description", "og:url", "og:type", "og:site_name"]) if (!meta(head, "property", key)) r.errors.push(`missing ${key}`);
  if (!meta(head, "name", "twitter:card")) r.errors.push("missing twitter:card");

  // JSON-LD graph
  let graph: Node[] = [];
  try {
    graph = graphOf(html);
  } catch (e) {
    r.errors.push(`invalid JSON-LD: ${(e as Error).message}`);
  }
  const ids = new Set(graph.map((n) => n["@id"]).filter(Boolean));
  const org = graph.find((n) => n["@id"] === `${ORIGIN}/#organization`);
  if (!org) r.errors.push("JSON-LD: Organization #organization missing");
  if (!graph.find((n) => n["@id"] === `${ORIGIN}/#website` && hasType(n, "WebSite"))) r.errors.push("JSON-LD: WebSite #website missing");
  const page = graph.find((n) => n["@id"] === `${expected}#webpage`);
  if (!page) r.errors.push("JSON-LD: WebPage #webpage missing");
  const refs = JSON.stringify(graph).match(/"@id":"[^"]+"/g) ?? [];
  for (const ref of refs) {
    const id = ref.slice(7, -1);
    // cross-page service references are allowed (defined on the service pages)
    if (!ids.has(id) && !id.endsWith("#service")) r.errors.push(`JSON-LD: dangling @id reference ${id}`);
  }
  if (expect.kind !== "home") {
    const bc = graph.find((n) => hasType(n, "BreadcrumbList"));
    if (!bc) r.errors.push("JSON-LD: BreadcrumbList missing");
    if (!html.includes('aria-label="Breadcrumb"')) r.errors.push("visible breadcrumb missing");
  }
  const primary = graph.find((n) => n["@id"] === `${expected}#primaryimage`);
  if (expect.kind === "project" || expect.kind === "service" || expect.kind === "home") {
    if (!primary && expect.kind !== "project") r.errors.push("JSON-LD: primary ImageObject missing");
  }
  if (primary) {
    const src = String(primary.contentUrl ?? "");
    const rel = src.replace(ORIGIN, "");
    // Primary image must be server-rendered in the HTML (original URL or its next/image variant).
    if (!html.includes(rel) && !html.includes(encodeURIComponent(rel))) r.errors.push(`primary image ${rel} not present in server HTML`);
    if (ogImage && ogImage !== src && expect.kind === "project") r.warnings.push("og:image differs from primary ImageObject");
    for (const k of ["url", "contentUrl", "width", "height"]) if (!primary[k]) r.errors.push(`ImageObject missing ${k}`);
  }
  if (expect.kind === "project") {
    const work = graph.find((n) => hasType(n, "CreativeWork"));
    if (!work) r.errors.push("JSON-LD: CreativeWork (project) missing");
    if (graph.some((n) => hasType(n, "Product"))) r.errors.push("JSON-LD: Product schema must not be used for projects");
  }
  if (expect.kind === "service" && !graph.find((n) => hasType(n, "Service") && (n.provider as Node | undefined)?.["@id"] === `${ORIGIN}/#organization`))
    r.errors.push("JSON-LD: Service with provider → Organization missing");
  if (expect.kind === "article" && !graph.find((n) => hasType(n, "BlogPosting") || hasType(n, "NewsArticle"))) r.errors.push("JSON-LD: BlogPosting missing");

  // links & images for the crawl check
  for (const m of html.matchAll(/<a[^>]+href="([^"#]+)/g)) {
    const href = decode(m[1]!);
    if (href.startsWith("/") && !href.startsWith("//")) linkTargets.add(href);
  }
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const src = decode(m[1]!);
    if (src.startsWith("/")) imageTargets.add(src);
  }
  const imgNoAlt = [...html.matchAll(/<img(?![^>]*\balt=)[^>]*>/g)].length;
  if (imgNoAlt) r.errors.push(`${imgNoAlt} <img> without alt`);

  // Bot parity: same HTML for browsers and Google crawlers (no cloaking)
  const strip = (s: string) => s.replace(/<script[^>]*>self\.__next_f[\s\S]*?<\/script>/g, "");
  for (const [name, ua] of [["Googlebot", UA.googlebot], ["Googlebot-Image", UA.googlebotImage]] as const) {
    const other = await (await get(url, ua)).text();
    if (strip(other) !== strip(html)) {
      const a = graphOf(other).length === graph.length && other.includes(title ?? "@@") && other.match(/<h1[\s>]/g)?.length === h1s;
      (a ? r.warnings : r.errors).push(`${name} HTML differs from browser HTML${a ? " (same title/H1/JSON-LD)" : ""}`);
    }
  }
}

async function main() {
  const sm = await get(`${BASE}/sitemap.xml`);
  const smXml = await sm.text();
  const childMaps = [...smXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  const sitemapUrls: string[] = [];
  const sitemapImages: string[] = [];
  for (const child of childMaps) {
    const xml = await (await get(toLocal(child))).text();
    for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)) sitemapUrls.push(m[1]!);
    for (const m of xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) sitemapImages.push(m[1]!);
    if (/<lastmod>[^<]+<\/lastmod>/.test(xml) === false) console.log(`✗ ${child} has no lastmod`);
  }
  const kindOf = (p: string) =>
    p === "/" ? "home" : p.startsWith("/completed-projects/") && p !== "/completed-projects/" ? "project" : p.startsWith("/news/") && p !== "/news/" ? "article" : ["/about/", "/contact/", "/services/", "/completed-projects/", "/news/"].includes(p) ? "page" : "service";
  for (const u of sitemapUrls) {
    const path = u.replace(ORIGIN, "");
    await checkPage(path, { kind: kindOf(path) as "home" });
  }
  // /news/ is intentionally noindex (and not in the sitemap) while it has no articles
  if (!sitemapUrls.includes(`${ORIGIN}/news/`)) await checkPage("/news/", { kind: "page", index: false });

  // Special cases
  const special: Result = { url: "(site-wide)", errors: [], warnings: [], info: [] };
  results.push(special);
  for (const p of ["/this-page-does-not-exist/", "/completed-projects/unknown-yacht/", "/news/unknown-article/", "/a/b/c/"]) {
    const res = await get(BASE + p);
    const body = await res.text();
    if (res.status !== 404) special.errors.push(`${p} returned ${res.status}, expected 404`);
    else if (!/noindex/.test(body)) special.errors.push(`${p} 404 page is not noindex`);
    else special.info.push(`${p} → 404 ✓`);
  }
  for (const [from, to] of [
    ["/blocks/footer-about-us/", "/about/"],
    ["/home/", "/"],
    ["/wp-sitemap.xml", "/sitemap.xml"],
    ["/wp-content/uploads/2026/01/m-y-mmm-49-2-m.jpg", "/media/projects/my-mmm-49-2m/my-mmm-49-2m-after-refit-helideck.jpg"],
  ] as const) {
    const res = await get(BASE + from);
    const loc = res.headers.get("location") ?? "";
    if (res.status !== 301 || !loc.endsWith(to)) special.errors.push(`${from} → ${res.status} ${loc} (expected 301 → ${to})`);
    else special.info.push(`${from} → 301 ${to} ✓`);
  }
  const robots = await (await get(`${BASE}/robots.txt`)).text();
  if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) special.errors.push("robots.txt lacks sitemap");
  if (/Disallow: \/(_next|media|brand)/.test(robots)) special.errors.push("robots.txt blocks assets or images");
  const admin = await get(`${BASE}/admin/`);
  if (!/noindex/.test(admin.headers.get("x-robots-tag") ?? "")) special.errors.push("/admin/ lacks X-Robots-Tag noindex");
  if (sitemapUrls.some((u) => /\/admin|\/api|\?/.test(u))) special.errors.push("sitemap contains private or parameter URLs");
  for (const u of sitemapUrls) if (!u.startsWith(`${ORIGIN}/`) || !u.endsWith("/")) special.errors.push(`sitemap URL not canonical: ${u}`);
  special.info.push(`sitemap: ${sitemapUrls.length} URLs, ${sitemapImages.length} images`);

  // Crawl internal links and images
  for (const href of linkTargets) {
    const res = await get(BASE + href, UA.googlebot, "HEAD");
    if (res.status !== 200) special.errors.push(`broken internal link ${href} → ${res.status}`);
  }
  for (const src of new Set([...imageTargets, ...sitemapImages.map((u) => u.replace(ORIGIN, ""))])) {
    const res = await get(BASE + src, UA.googlebotImage);
    const type = res.headers.get("content-type") ?? "";
    if (res.status !== 200 || !type.startsWith("image/")) special.errors.push(`image ${src} → ${res.status} ${type}`);
  }
  special.info.push(`checked ${linkTargets.size} internal links, ${imageTargets.size + sitemapImages.length} image URLs (as Googlebot / Googlebot-Image)`);

  let failed = 0;
  for (const r of results) {
    const mark = r.errors.length ? "✗" : "✓";
    if (r.errors.length) failed++;
    console.log(`${mark} ${r.url}`);
    for (const e of r.errors) console.log(`    ERROR ${e}`);
    for (const w of r.warnings) console.log(`    warn  ${w}`);
    for (const i of r.info) console.log(`    ${i}`);
  }
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
