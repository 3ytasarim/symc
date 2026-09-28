import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { compactImages, toSiteImage, type SiteImage } from "./media";
import { projectCardInclude, toProjectCard, type ProjectCard } from "./projects";

export type ServiceSummary = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  heroImage: SiteImage | null;
  featured: boolean;
  updatedAt: Date;
};

export type ServiceDetail = ServiceSummary & {
  content: string;
  highlights: string[];
  gallery: SiteImage[];
  ogImage: SiteImage | null;
  projects: ProjectCard[];
  seoTitle: string | null;
  seoDescription: string | null;
  robotsIndex: boolean;
  createdAt: Date;
};

export const getPublishedServices = cache(async (): Promise<ServiceSummary[]> => {
  const rows = await prisma.service.findMany({
    where: { publishStatus: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { heroImage: true },
  });
  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription,
    heroImage: toSiteImage(s.heroImage, s.title),
    featured: s.featured,
    updatedAt: s.updatedAt,
  }));
});

export const getServiceBySlug = cache(async (slug: string): Promise<ServiceDetail | null> => {
  const s = await prisma.service.findFirst({
    where: { slug, publishStatus: "PUBLISHED" },
    include: {
      heroImage: true,
      ogImage: true,
      gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } },
      projects: {
        where: { publishStatus: "PUBLISHED" },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: projectCardInclude,
      },
    },
  });
  if (!s) return null;
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    shortDescription: s.shortDescription,
    content: s.content,
    highlights: s.highlights,
    heroImage: toSiteImage(s.heroImage, s.title),
    ogImage: toSiteImage(s.ogImage, s.title),
    gallery: compactImages(s.gallery.map((g) => toSiteImage(g.media, s.title))),
    projects: s.projects.map(toProjectCard),
    featured: s.featured,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    robotsIndex: s.robotsIndex,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
});
