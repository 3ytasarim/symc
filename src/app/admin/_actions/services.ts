"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { recordSlugRedirect, RESERVED_ROOT_SLUGS, revalidateSite, slugTaken, type ActionResult } from "@/lib/admin/common";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { slugify } from "@/lib/content/slug";
import { routes } from "@/lib/seo/site";
import { formToObject, serviceSchema, zodErrors } from "@/lib/validation/admin";

export async function saveServiceAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = typeof fd.get("id") === "string" && fd.get("id") ? String(fd.get("id")) : null;
  const parsed = serviceSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: zodErrors(parsed.error) };
  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  if (!slug) return { ok: false, errors: { slug: "A slug is required" } };
  // Services are served at the site root, so they must not collide with other top-level pages.
  if (RESERVED_ROOT_SLUGS.has(slug)) return { ok: false, errors: { slug: "This slug is reserved by another page" } };
  if (await slugTaken("service", slug, id)) return { ok: false, errors: { slug: "This slug is already used by another service" } };

  const existing = id ? await prisma.service.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "Service not found." };
  const data = {
    title: d.title,
    slug,
    shortDescription: d.shortDescription,
    content: sanitizeRichText(d.content),
    highlights: d.highlights,
    heroImageId: d.heroImageId,
    featured: d.featured,
    publishStatus: d.publishStatus,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    ogImageId: d.ogImageId,
    robotsIndex: d.robotsIndex,
  };
  let savedId: string;
  if (existing) {
    await prisma.$transaction([
      prisma.serviceImage.deleteMany({ where: { serviceId: existing.id } }),
      prisma.service.update({ where: { id: existing.id }, data: { ...data, gallery: { create: d.gallery.map((mediaId, i) => ({ mediaId, sortOrder: i })) } } }),
    ]);
    savedId = existing.id;
    if (existing.slug !== slug && existing.publishStatus === "PUBLISHED") {
      await recordSlugRedirect(routes.service(existing.slug), routes.service(slug));
    }
  } else {
    const maxOrder = await prisma.service.aggregate({ _max: { sortOrder: true } });
    const created = await prisma.service.create({
      data: { ...data, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1, gallery: { create: d.gallery.map((mediaId, i) => ({ mediaId, sortOrder: i })) } },
    });
    savedId = created.id;
  }
  revalidateSite();
  if (!existing) redirect(`/admin/services/${savedId}/?created=1`);
  return { ok: true, message: "Service saved.", id: savedId };
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const s = await prisma.service.delete({ where: { id } }).catch(() => null);
  if (!s) return { ok: false, message: "Service not found." };
  await prisma.redirect.deleteMany({ where: { toPath: routes.service(s.slug) } });
  revalidateSite();
  return { ok: true, message: `Deleted “${s.title}”.` };
}

export async function setServicePublishAction(id: string, publish: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.service.update({ where: { id }, data: { publishStatus: publish ? "PUBLISHED" : "DRAFT" } });
  revalidateSite();
  return { ok: true };
}

export async function moveServiceAction(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  const all = await prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], select: { id: true } });
  const i = all.findIndex((p) => p.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= all.length) return { ok: false };
  [all[i], all[j]] = [all[j]!, all[i]!];
  await prisma.$transaction(all.map((p, index) => prisma.service.update({ where: { id: p.id }, data: { sortOrder: index + 1 } })));
  revalidateSite();
  return { ok: true };
}
