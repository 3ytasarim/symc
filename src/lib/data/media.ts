import type { Media } from "@/generated/prisma";
import { mediaUrl } from "@/lib/storage/paths";

export type SiteImage = {
  id: string;
  url: string; // site-relative, e.g. /media/projects/x/y.jpg
  width: number;
  height: number;
  mimeType: string;
  alt: string;
  caption: string;
};

export function toSiteImage(media: Media | null | undefined, fallbackAlt = ""): SiteImage | null {
  if (!media) return null;
  return {
    id: media.id,
    url: mediaUrl(media.storageKey),
    width: media.width,
    height: media.height,
    mimeType: media.mimeType,
    alt: media.alt || fallbackAlt,
    caption: media.caption,
  };
}

export function compactImages(list: (SiteImage | null)[]): SiteImage[] {
  return list.filter((x): x is SiteImage => x !== null);
}
