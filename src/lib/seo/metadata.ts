import "server-only";
import type { Metadata } from "next";
import type { SiteImage } from "@/lib/data/media";
import { getSiteSettings } from "@/lib/data/settings";
import { truncate } from "@/lib/content/sanitize";
import { absoluteUrl, canonicalPath, SITE_LOCALE, SITE_NAME } from "./site";
import { resolveDefaultShareImage } from "./images";

/** Robots directives for public, indexable pages. */
export const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  "max-image-preview": "large",
  "max-snippet": -1,
  "max-video-preview": -1,
};

/** Private / internal / thin pages. */
export const NOINDEX_ROBOTS: Metadata["robots"] = { index: false, follow: false, nocache: true };

export type PageSeo = {
  /** Page-specific title. Branded with " – SYMC YACHT" unless absoluteTitle is set. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** App path of the page; becomes the absolute, self-referencing canonical. */
  path: string;
  /** Primary image of the page — used for og:image/twitter:image (same image as the visible hero). */
  image?: SiteImage | null;
  type?: "website" | "article";
  index?: boolean;
  /** Absolute canonical override (blog syndication only). */
  canonicalOverride?: string | null;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authors?: string[];
  section?: string | null;
};

export function brandedTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} – ${SITE_NAME}`;
}

function ogImage(image: SiteImage) {
  return {
    url: absoluteUrl(image.url),
    width: image.width,
    height: image.height,
    type: image.mimeType,
    alt: image.alt,
  };
}

export async function buildMetadata(seo: PageSeo): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = seo.absoluteTitle ? seo.title : brandedTitle(seo.title);
  const description = truncate(seo.description.replace(/\s+/g, " ").trim(), 160);
  const canonical = seo.canonicalOverride || absoluteUrl(canonicalPath(seo.path));
  const image = seo.image ?? (await resolveDefaultShareImage(settings));
  const images = image ? [ogImage(image)] : undefined;
  const indexable = seo.index !== false;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: indexable ? INDEX_ROBOTS : NOINDEX_ROBOTS,
    openGraph: {
      type: seo.type ?? "website",
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title,
      description,
      images,
      ...(seo.type === "article"
        ? {
            publishedTime: seo.publishedTime?.toISOString(),
            modifiedTime: seo.modifiedTime?.toISOString(),
            authors: seo.authors,
            section: seo.section ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => ({ url: i.url, alt: i.alt, width: i.width, height: i.height })),
    },
  };
}
