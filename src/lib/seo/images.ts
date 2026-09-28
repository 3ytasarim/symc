import "server-only";
import type { SiteImage } from "@/lib/data/media";
import type { SiteSettings } from "@/lib/data/settings";
import { readPublicImageMeta } from "./image-meta";

/**
 * Resolves the brand logo with REAL dimensions/MIME: the CMS logo when one is
 * set (dimensions stored at upload), otherwise the bundled /brand asset whose
 * header is read from disk (cached).
 */
export const BRAND_LOGO_PATH = "/brand/symc-logo.png";
export const BRAND_LOGO_LIGHT_PATH = "/brand/symc-logo-light-horizontal.png";
export const BRAND_LOGO_DARK_PATH = "/brand/symc-logo-horizontal.png";

export async function publicImage(path: string, alt: string): Promise<SiteImage | null> {
  const meta = await readPublicImageMeta(path);
  if (!meta) return null;
  return { id: path, url: path, width: meta.width, height: meta.height, mimeType: meta.mimeType, alt, caption: "" };
}

export async function resolveLogo(settings: SiteSettings): Promise<SiteImage | null> {
  return settings.logo ?? (await publicImage(BRAND_LOGO_PATH, `${settings.companyName} logo`));
}

/** Social-share fallback: CMS default OG image → home hero → logo. */
export async function resolveDefaultShareImage(settings: SiteSettings): Promise<SiteImage | null> {
  return settings.defaultOgImage ?? settings.homeHeroImage ?? (await resolveLogo(settings));
}
