import "server-only";
import { prisma } from "@/lib/db";
import type { PostFormData } from "@/components/admin/PostForm";
import { toMediaItem } from "./media-items";

/** datetime-local value in Europe/Istanbul (UTC+3, no DST). */
function toLocalInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d.getTime() + 3 * 3600_000).toISOString().slice(0, 16);
}

export async function postFormOptions() {
  const [categories, projects, services] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
    prisma.service.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
  ]);
  return { categories, projects, services };
}

export async function loadPostForm(id: string): Promise<PostFormData | null> {
  const p = await prisma.blogPost.findUnique({
    where: { id },
    include: { coverImage: true, ogImage: true, relatedProjects: { select: { id: true } }, relatedServices: { select: { id: true } } },
  });
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: toMediaItem(p.coverImage),
    categoryId: p.categoryId ?? "",
    authorName: p.authorName ?? "",
    publishStatus: p.publishStatus,
    publishedAt: toLocalInput(p.publishedAt),
    featured: p.featured,
    relatedProjectIds: p.relatedProjects.map((x) => x.id),
    relatedServiceIds: p.relatedServices.map((x) => x.id),
    canonicalUrl: p.canonicalUrl ?? "",
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    ogImage: toMediaItem(p.ogImage),
    robotsIndex: p.robotsIndex,
  };
}

export const emptyPostForm: PostFormData = {
  id: null, title: "", slug: "", excerpt: "", content: "", coverImage: null, categoryId: "", authorName: "", publishStatus: "DRAFT",
  publishedAt: "", featured: false, relatedProjectIds: [], relatedServiceIds: [], canonicalUrl: "", seoTitle: "", seoDescription: "",
  ogImage: null, robotsIndex: true,
};
