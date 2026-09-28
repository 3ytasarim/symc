import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { toSiteImage, type SiteImage } from "./media";

/** Picks a media-library image by storage key (for static corporate pages). */
export const getImageByKey = cache(async (storageKey: string): Promise<SiteImage | null> => {
  const m = await prisma.media.findUnique({ where: { storageKey } });
  return toSiteImage(m);
});
