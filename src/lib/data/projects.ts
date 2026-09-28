import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { compactImages, toSiteImage, type SiteImage } from "./media";

export const projectCardInclude = {
  category: true,
  coverImage: true,
} satisfies Prisma.ProjectInclude;

type ProjectCardRow = Prisma.ProjectGetPayload<{ include: typeof projectCardInclude }>;

export type ProjectCard = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  status: "COMPLETED" | "IN_PROGRESS";
  category: { name: string; slug: string } | null;
  coverImage: SiteImage | null;
  projectYear: number | null;
  length: string | null;
  featured: boolean;
  updatedAt: Date;
};

export function toProjectCard(p: ProjectCardRow): ProjectCard {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    status: p.status,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    coverImage: toSiteImage(p.coverImage, p.title),
    projectYear: p.projectYear,
    length: p.length,
    featured: p.featured,
    updatedAt: p.updatedAt,
  };
}

export type SpecRow = { label: string; value: string };

export type ProjectDetail = ProjectCard & {
  content: string;
  heroImage: SiteImage | null;
  ogImage: SiteImage | null;
  gallery: SiteImage[];
  specs: SpecRow[];
  scopeItems: string[];
  yachtName: string | null;
  location: string | null;
  completionDate: Date | null;
  services: { title: string; slug: string; shortDescription: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  robotsIndex: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

const published = { publishStatus: "PUBLISHED" } as const;
const order: Prisma.ProjectOrderByWithRelationInput[] = [{ sortOrder: "asc" }, { title: "asc" }];

export const getPublishedProjects = cache(async (): Promise<ProjectCard[]> => {
  const rows = await prisma.project.findMany({ where: published, orderBy: order, include: projectCardInclude });
  return rows.map(toProjectCard);
});

export const getProjectCategories = cache(async () => {
  return prisma.projectCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
});

function isSpecValue(v: string | null | undefined): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseExtraSpecs(json: Prisma.JsonValue | null): SpecRow[] {
  if (!Array.isArray(json)) return [];
  return json.flatMap((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const label = typeof row.label === "string" ? row.label.trim() : "";
      const value = typeof row.value === "string" ? row.value.trim() : "";
      return label && value ? [{ label, value }] : [];
    }
    return [];
  });
}

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectDetail | null> => {
  const p = await prisma.project.findFirst({
    where: { slug, ...published },
    include: {
      ...projectCardInclude,
      heroImage: true,
      ogImage: true,
      gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } },
      services: { where: published, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!p) return null;

  // Only real, non-empty values ever reach the page.
  const candidates: [string, string | null | undefined][] = [
    ["Yacht", p.yachtName],
    ["Type", p.yachtType],
    ["Length", p.length],
    ["Beam", p.beam],
    ["Draft", p.draft],
    ["Gross tonnage", p.grossTonnage],
    ["Shipyard", p.shipyard],
    ["Location", p.location],
    ["Year", p.projectYear ? String(p.projectYear) : null],
    ["Completed", p.completionDate ? p.completionDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : null],
  ];
  const specs: SpecRow[] = [
    ...candidates.filter((c): c is [string, string] => isSpecValue(c[1])).map(([label, value]) => ({ label, value: value.trim() })),
    ...parseExtraSpecs(p.technicalSpecs),
  ];

  return {
    ...toProjectCard(p),
    content: p.content,
    heroImage: toSiteImage(p.heroImage, p.title),
    ogImage: toSiteImage(p.ogImage, p.title),
    gallery: compactImages(p.gallery.map((g) => toSiteImage(g.media, p.title))),
    specs,
    scopeItems: p.scopeItems.filter((s) => s.trim().length > 0),
    yachtName: p.yachtName,
    location: p.location,
    completionDate: p.completionDate,
    services: p.services.map((s) => ({ title: s.title, slug: s.slug, shortDescription: s.shortDescription })),
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    robotsIndex: p.robotsIndex,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
  };
});

/** Same category first, then other projects — never the project itself. */
export async function getRelatedProjects(project: Pick<ProjectCard, "id" | "category">, limit = 3): Promise<ProjectCard[]> {
  const all = await getPublishedProjects();
  const others = all.filter((p) => p.id !== project.id);
  const same = others.filter((p) => p.category?.slug && p.category.slug === project.category?.slug);
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, limit);
}
