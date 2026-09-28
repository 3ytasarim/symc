import "server-only";
import { prisma } from "@/lib/db";
import type { ServiceFormData } from "@/components/admin/ServiceForm";
import { toMediaItem, toMediaItems } from "./media-items";

export async function loadServiceForm(id: string): Promise<ServiceFormData | null> {
  const s = await prisma.service.findUnique({
    where: { id },
    include: { heroImage: true, ogImage: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });
  if (!s) return null;
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription,
    content: s.content,
    highlights: s.highlights.join("\n"),
    heroImage: toMediaItem(s.heroImage),
    gallery: toMediaItems(s.gallery.map((g) => g.media)),
    featured: s.featured,
    publishStatus: s.publishStatus,
    seoTitle: s.seoTitle ?? "",
    seoDescription: s.seoDescription ?? "",
    ogImage: toMediaItem(s.ogImage),
    robotsIndex: s.robotsIndex,
  };
}

export const emptyServiceForm: ServiceFormData = {
  id: null, title: "", slug: "", shortDescription: "", content: "", highlights: "", heroImage: null, gallery: [],
  featured: false, publishStatus: "DRAFT", seoTitle: "", seoDescription: "", ogImage: null, robotsIndex: true,
};
