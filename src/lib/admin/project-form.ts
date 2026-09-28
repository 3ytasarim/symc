import "server-only";
import { prisma } from "@/lib/db";
import type { ProjectFormData } from "@/components/admin/ProjectForm";
import { toMediaItem, toMediaItems } from "./media-items";

export async function projectFormOptions() {
  const [categories, services] = await Promise.all([
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.service.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
  ]);
  return { categories, services };
}

export async function loadProjectForm(id: string): Promise<ProjectFormData | null> {
  const p = await prisma.project.findUnique({
    where: { id },
    include: { coverImage: true, heroImage: true, ogImage: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } }, services: { select: { id: true } } },
  });
  if (!p) return null;
  const specs = Array.isArray(p.technicalSpecs)
    ? p.technicalSpecs
        .map((r) => (r && typeof r === "object" && !Array.isArray(r) ? `${String(r.label ?? "")}: ${String(r.value ?? "")}` : ""))
        .filter((x) => x.length > 2)
        .join("\n")
    : "";
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    categoryId: p.categoryId ?? "",
    status: p.status,
    publishStatus: p.publishStatus,
    shortDescription: p.shortDescription,
    content: p.content,
    coverImage: toMediaItem(p.coverImage),
    heroImage: toMediaItem(p.heroImage),
    gallery: toMediaItems(p.gallery.map((g) => g.media)),
    projectYear: p.projectYear ? String(p.projectYear) : "",
    completionDate: p.completionDate ? p.completionDate.toISOString().slice(0, 10) : "",
    yachtName: p.yachtName ?? "",
    yachtType: p.yachtType ?? "",
    shipyard: p.shipyard ?? "",
    location: p.location ?? "",
    length: p.length ?? "",
    beam: p.beam ?? "",
    draft: p.draft ?? "",
    grossTonnage: p.grossTonnage ?? "",
    scopeItems: p.scopeItems.join("\n"),
    technicalSpecs: specs,
    serviceIds: p.services.map((s) => s.id),
    featured: p.featured,
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    ogImage: toMediaItem(p.ogImage),
    robotsIndex: p.robotsIndex,
  };
}

export const emptyProjectForm: ProjectFormData = {
  id: null, title: "", slug: "", categoryId: "", status: "COMPLETED", publishStatus: "DRAFT", shortDescription: "", content: "",
  coverImage: null, heroImage: null, gallery: [], projectYear: "", completionDate: "", yachtName: "", yachtType: "", shipyard: "",
  location: "", length: "", beam: "", draft: "", grossTonnage: "", scopeItems: "", technicalSpecs: "", serviceIds: [], featured: false,
  seoTitle: "", seoDescription: "", ogImage: null, robotsIndex: true,
};
