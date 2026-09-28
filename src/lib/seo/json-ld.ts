import "server-only";
import type { SiteImage } from "@/lib/data/media";
import type { SiteSettings } from "@/lib/data/settings";
import { absoluteUrl, canonicalPath, SITE_LANGUAGE, SITE_NAME, SITE_ORIGIN } from "./site";
import { resolveLogo } from "./images";

/**
 * Connected schema.org graph with stable @id references:
 *   Organization  <origin>/#organization
 *   Logo          <origin>/#logo
 *   WebSite       <origin>/#website
 *   WebPage       <page>#webpage
 *   Breadcrumb    <page>#breadcrumb
 *   Primary image <page>#primaryimage
 *   Main entity   <page>#project | #service | #article
 * Only verified, non-empty values are emitted.
 */
type Node = Record<string, unknown>;
type Ref = { "@id": string };

export const ids = {
  organization: `${SITE_ORIGIN}/#organization`,
  logo: `${SITE_ORIGIN}/#logo`,
  website: `${SITE_ORIGIN}/#website`,
  webpage: (url: string) => `${url}#webpage`,
  breadcrumb: (url: string) => `${url}#breadcrumb`,
  primaryImage: (url: string) => `${url}#primaryimage`,
  entity: (url: string, kind: "project" | "service" | "article" | "itemlist") => `${url}#${kind}`,
};

const ref = (id: string): Ref => ({ "@id": id });

/** Removes undefined / null / "" / [] values so no empty property is ever emitted. */
function clean<T extends Node>(node: T): T {
  const out: Node = {};
  for (const [k, v] of Object.entries(node)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

export function imageObject(id: string | undefined, image: SiteImage, caption?: string): Node {
  const url = absoluteUrl(image.url);
  return clean({
    "@type": "ImageObject",
    "@id": id,
    url,
    contentUrl: url,
    width: image.width,
    height: image.height,
    encodingFormat: image.mimeType,
    caption: caption || image.caption || image.alt,
    name: image.alt,
    inLanguage: SITE_LANGUAGE,
  });
}

function openingHours(spec: string): Node[] {
  // "Mo-Fr 08:00-18:00" → OpeningHoursSpecification
  const m = spec.match(/^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (!m) return [];
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const start = days.indexOf(m[1]!);
  const end = m[2] ? days.indexOf(m[2]) : start;
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: names.slice(start, end + 1).map((d) => `https://schema.org/${d}`),
      opens: m[3],
      closes: m[4],
    },
  ];
}

export async function organizationNode(s: SiteSettings): Promise<Node[]> {
  const logo = await resolveLogo(s);
  const hasAddress = Boolean(s.streetAddress && s.addressLocality);
  const sameAs = [s.instagramUrl, s.linkedinUrl, s.youtubeUrl].filter(Boolean);
  const org = clean({
    // LocalBusiness (a subtype of Organization) because SYMC has a verified
    // street address and opening hours; the node keeps the organisation @id.
    "@type": hasAddress ? ["Organization", "LocalBusiness"] : "Organization",
    "@id": ids.organization,
    name: s.companyName,
    alternateName: s.alternateName ? s.alternateName.split("|").map((x) => x.trim()).filter(Boolean) : undefined,
    url: `${SITE_ORIGIN}/`,
    description: s.description,
    foundingDate: s.foundingYear ? String(s.foundingYear) : undefined,
    logo: logo ? ref(ids.logo) : undefined,
    image: logo ? ref(ids.logo) : undefined,
    email: s.email,
    telephone: s.phone,
    address: hasAddress
      ? clean({
          "@type": "PostalAddress",
          streetAddress: s.streetAddress,
          addressLocality: s.addressLocality,
          addressRegion: s.addressRegion,
          postalCode: s.postalCode,
          addressCountry: s.addressCountry,
        })
      : undefined,
    openingHoursSpecification: hasAddress ? openingHours(s.openingHoursSpec) : undefined,
    hasMap: s.googleMapsUrl,
    sameAs,
  });
  return logo ? [org, imageObject(ids.logo, logo, `${s.companyName} logo`)] : [org];
}

export function websiteNode(s: SiteSettings): Node {
  return clean({
    "@type": "WebSite",
    "@id": ids.website,
    url: `${SITE_ORIGIN}/`,
    name: SITE_NAME,
    alternateName: s.companyName !== SITE_NAME ? s.companyName : undefined,
    description: s.description,
    publisher: ref(ids.organization),
    inLanguage: SITE_LANGUAGE,
    // No SearchAction: the public site has no search feature.
  });
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(url: string, crumbs: Crumb[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": ids.breadcrumb(url),
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export type PageGraphInput = {
  path: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage";
  name: string;
  description: string;
  crumbs?: Crumb[];
  primaryImage?: SiteImage | null;
  primaryImageCaption?: string;
  aboutOrganization?: boolean;
  datePublished?: Date | null;
  dateModified?: Date | null;
  /** Main entity node(s) for this page (Service, CreativeWork, BlogPosting, ItemList…). */
  entities?: Node[];
  mainEntityId?: string;
};

/** Full @graph for a page: Organization + WebSite + WebPage (+ breadcrumb, image, entities). */
export async function pageGraph(settings: SiteSettings, input: PageGraphInput): Promise<Node> {
  const url = absoluteUrl(canonicalPath(input.path));
  const hasCrumbs = Boolean(input.crumbs && input.crumbs.length > 1);
  const graph: Node[] = [
    ...(await organizationNode(settings)),
    websiteNode(settings),
    clean({
      "@type": input.type ?? "WebPage",
      "@id": ids.webpage(url),
      url,
      name: input.name,
      description: input.description,
      isPartOf: ref(ids.website),
      about: input.aboutOrganization ? ref(ids.organization) : undefined,
      breadcrumb: hasCrumbs ? ref(ids.breadcrumb(url)) : undefined,
      primaryImageOfPage: input.primaryImage ? ref(ids.primaryImage(url)) : undefined,
      image: input.primaryImage ? ref(ids.primaryImage(url)) : undefined,
      mainEntity: input.mainEntityId ? ref(input.mainEntityId) : undefined,
      datePublished: input.datePublished?.toISOString(),
      dateModified: input.dateModified?.toISOString(),
      inLanguage: SITE_LANGUAGE,
    }),
  ];
  if (hasCrumbs) graph.push(breadcrumbNode(url, input.crumbs!));
  if (input.primaryImage) graph.push(imageObject(ids.primaryImage(url), input.primaryImage, input.primaryImageCaption));
  if (input.entities) graph.push(...input.entities);
  return { "@context": "https://schema.org", "@graph": graph };
}

/** Yacht project case study → CreativeWork (not Product: nothing is sold). */
export function projectEntity(args: {
  path: string;
  name: string;
  description: string;
  category?: string | null;
  year?: number | null;
  location?: string | null;
  primaryImage?: SiteImage | null;
  gallery: SiteImage[];
  dateModified: Date;
  datePublished?: Date | null;
  serviceUrls: string[];
}): Node {
  const url = absoluteUrl(canonicalPath(args.path));
  const images: unknown[] = [];
  if (args.primaryImage) images.push(ref(ids.primaryImage(url)));
  for (const g of args.gallery) if (g.id !== args.primaryImage?.id) images.push(imageObject(undefined, g));
  return clean({
    "@type": "CreativeWork",
    "@id": ids.entity(url, "project"),
    name: args.name,
    headline: args.name,
    description: args.description,
    url,
    mainEntityOfPage: ref(ids.webpage(url)),
    isPartOf: ref(ids.website),
    creator: ref(ids.organization),
    publisher: ref(ids.organization),
    image: images,
    genre: args.category ?? undefined,
    temporalCoverage: args.year ? String(args.year) : undefined,
    locationCreated: args.location ? { "@type": "Place", name: args.location } : undefined,
    about: args.serviceUrls.map((u) => ref(`${u}#service`)),
    datePublished: args.datePublished?.toISOString(),
    dateModified: args.dateModified.toISOString(),
    inLanguage: SITE_LANGUAGE,
  });
}

export function serviceEntity(args: {
  path: string;
  name: string;
  description: string;
  primaryImage?: SiteImage | null;
  highlights: string[];
}): Node {
  const url = absoluteUrl(canonicalPath(args.path));
  return clean({
    "@type": "Service",
    "@id": ids.entity(url, "service"),
    name: args.name,
    serviceType: args.name,
    description: args.description,
    url,
    provider: ref(ids.organization),
    mainEntityOfPage: ref(ids.webpage(url)),
    image: args.primaryImage ? ref(ids.primaryImage(url)) : undefined,
    hasOfferCatalog: args.highlights.length
      ? {
          "@type": "OfferCatalog",
          name: args.name,
          itemListElement: args.highlights.map((h) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: h } })),
        }
      : undefined,
  });
}

export function blogPostingEntity(args: {
  path: string;
  headline: string;
  description: string;
  primaryImage?: SiteImage | null;
  datePublished: Date;
  dateModified: Date;
  authorName?: string | null;
  section?: string | null;
}): Node {
  const url = absoluteUrl(canonicalPath(args.path));
  return clean({
    "@type": "BlogPosting",
    "@id": ids.entity(url, "article"),
    headline: args.headline.slice(0, 110),
    description: args.description,
    image: args.primaryImage ? ref(ids.primaryImage(url)) : undefined,
    datePublished: args.datePublished.toISOString(),
    dateModified: args.dateModified.toISOString(),
    author: args.authorName ? { "@type": "Person", name: args.authorName } : ref(ids.organization),
    publisher: ref(ids.organization),
    mainEntityOfPage: ref(ids.webpage(url)),
    isPartOf: ref(ids.website),
    articleSection: args.section ?? undefined,
    inLanguage: SITE_LANGUAGE,
  });
}

export function itemListEntity(path: string, items: { name: string; path: string }[]): Node {
  const url = absoluteUrl(canonicalPath(path));
  return {
    "@type": "ItemList",
    "@id": ids.entity(url, "itemlist"),
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
  };
}

/** Safe serialisation for <script type="application/ld+json">. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
