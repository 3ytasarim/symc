"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { recordSlugRedirect, revalidateSite, slugTaken, type ActionResult } from "@/lib/admin/common";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { slugify } from "@/lib/content/slug";
import { routes } from "@/lib/seo/site";
import { formToObject, projectSchema, zodErrors } from "@/lib/validation/admin";

export async function saveProjectAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = typeof fd.get("id") === "string" && fd.get("id") ? String(fd.get("id")) : null;
  const parsed = projectSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: zodErrors(parsed.error) };
  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  if (!slug) return { ok: false, errors: { slug: "A slug is required" } };
  if (await slugTaken("project", slug, id)) return { ok: false, errors: { slug: "This slug is already used by another project" } };

  const existing = id ? await prisma.project.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "Project not found." };

  const data = {
    title: d.title,
    slug,
    categoryId: d.categoryId,
    status: d.status,
    publishStatus: d.publishStatus,
    shortDescription: d.shortDescription,
    content: sanitizeRichText(d.content),
    coverImageId: d.coverImageId,
    heroImageId: d.heroImageId,
    projectYear: d.projectYear,
    completionDate: d.completionDate,
    yachtName: d.yachtName,
    yachtType: d.yachtType,
    shipyard: d.shipyard,
    location: d.location,
    length: d.length,
    beam: d.beam,
    draft: d.draft,
    grossTonnage: d.grossTonnage,
    scopeItems: d.scopeItems,
    technicalSpecs: d.technicalSpecs,
    featured: d.featured,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    ogImageId: d.ogImageId,
    robotsIndex: d.robotsIndex,
    publishedAt: d.publishStatus === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
    services: { set: d.serviceIds.map((sid) => ({ id: sid })) },
  };

  let savedId: string;
  if (existing) {
    await prisma.$transaction([
      prisma.projectImage.deleteMany({ where: { projectId: existing.id } }),
      prisma.project.update({
        where: { id: existing.id },
        data: { ...data, gallery: { create: d.gallery.map((mediaId, i) => ({ mediaId, sortOrder: i })) } },
      }),
    ]);
    savedId = existing.id;
    if (existing.slug !== slug && existing.publishStatus === "PUBLISHED") {
      await recordSlugRedirect(routes.project(existing.slug), routes.project(slug));
    }
  } else {
    const maxOrder = await prisma.project.aggregate({ _max: { sortOrder: true } });
    const created = await prisma.project.create({
      data: {
        ...data,
        services: { connect: d.serviceIds.map((sid) => ({ id: sid })) },
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        gallery: { create: d.gallery.map((mediaId, i) => ({ mediaId, sortOrder: i })) },
      },
    });
    savedId = created.id;
  }
  revalidateSite();
  if (!existing) redirect(`/admin/projects/${savedId}/?created=1`);
  return { ok: true, message: "Project saved.", id: savedId };
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const p = await prisma.project.delete({ where: { id } }).catch(() => null);
  if (!p) return { ok: false, message: "Project not found." };
  // Remove redirects that pointed to the deleted page so they 404 instead of chaining.
  await prisma.redirect.deleteMany({ where: { toPath: routes.project(p.slug) } });
  revalidateSite();
  return { ok: true, message: `Deleted “${p.title}”.` };
}

export async function setProjectPublishAction(id: string, publish: boolean): Promise<ActionResult> {
  await requireAdmin();
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) return { ok: false, message: "Project not found." };
  await prisma.project.update({
    where: { id },
    data: { publishStatus: publish ? "PUBLISHED" : "DRAFT", publishedAt: publish ? (p.publishedAt ?? new Date()) : p.publishedAt },
  });
  revalidateSite();
  return { ok: true };
}

export async function setProjectFeaturedAction(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { featured } });
  revalidateSite();
  return { ok: true };
}

/** Moves a project one position up/down in the public order (normalises sortOrder first). */
export async function moveProjectAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const all = await prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { id: true } });
  const i = all.findIndex((p) => p.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= all.length) return { ok: false };
  [all[i], all[j]] = [all[j]!, all[i]!];
  await prisma.$transaction(all.map((p, index) => prisma.project.update({ where: { id: p.id }, data: { sortOrder: index + 1 } })));
  revalidateSite();
  return { ok: true };
}
