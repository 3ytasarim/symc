"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { recordSlugRedirect, revalidateSite, slugTaken, type ActionResult } from "@/lib/admin/common";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { slugify } from "@/lib/content/slug";
import { routes } from "@/lib/seo/site";
import { formToObject, postSchema, zodErrors } from "@/lib/validation/admin";

export async function savePostAction(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = typeof fd.get("id") === "string" && fd.get("id") ? String(fd.get("id")) : null;
  const parsed = postSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: zodErrors(parsed.error) };
  const d = parsed.data;
  const slug = d.slug || slugify(d.title);
  if (!slug) return { ok: false, errors: { slug: "A slug is required" } };
  if (await slugTaken("blogPost", slug, id)) return { ok: false, errors: { slug: "This slug is already used by another article" } };
  const existing = id ? await prisma.blogPost.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "Article not found." };

  const publishedAt = d.publishedAt ?? existing?.publishedAt ?? (d.publishStatus === "PUBLISHED" ? new Date() : null);
  const data = {
    title: d.title,
    slug,
    excerpt: d.excerpt,
    content: sanitizeRichText(d.content),
    coverImageId: d.coverImageId,
    categoryId: d.categoryId,
    authorName: d.authorName,
    publishStatus: d.publishStatus,
    publishedAt,
    featured: d.featured,
    canonicalUrl: d.canonicalUrl,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    ogImageId: d.ogImageId,
    robotsIndex: d.robotsIndex,
  };
  let savedId: string;
  if (existing) {
    await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        ...data,
        relatedProjects: { set: d.relatedProjectIds.map((x) => ({ id: x })) },
        relatedServices: { set: d.relatedServiceIds.map((x) => ({ id: x })) },
      },
    });
    savedId = existing.id;
    if (existing.slug !== slug && existing.publishStatus === "PUBLISHED") {
      await recordSlugRedirect(routes.post(existing.slug), routes.post(slug));
    }
  } else {
    const created = await prisma.blogPost.create({
      data: {
        ...data,
        relatedProjects: { connect: d.relatedProjectIds.map((x) => ({ id: x })) },
        relatedServices: { connect: d.relatedServiceIds.map((x) => ({ id: x })) },
      },
    });
    savedId = created.id;
  }
  revalidateSite();
  if (!existing) redirect(`/admin/news/${savedId}/?created=1`);
  return { ok: true, message: "Article saved.", id: savedId };
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const p = await prisma.blogPost.delete({ where: { id } }).catch(() => null);
  if (!p) return { ok: false, message: "Article not found." };
  await prisma.redirect.deleteMany({ where: { toPath: routes.post(p.slug) } });
  revalidateSite();
  return { ok: true, message: `Deleted “${p.title}”.` };
}

export async function setPostPublishAction(id: string, publish: boolean): Promise<ActionResult> {
  await requireAdmin();
  const p = await prisma.blogPost.findUnique({ where: { id } });
  if (!p) return { ok: false, message: "Article not found." };
  await prisma.blogPost.update({
    where: { id },
    data: { publishStatus: publish ? "PUBLISHED" : "DRAFT", publishedAt: publish ? (p.publishedAt ?? new Date()) : p.publishedAt },
  });
  revalidateSite();
  return { ok: true };
}

export async function setPostFeaturedAction(id: string, featured: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.blogPost.update({ where: { id }, data: { featured } });
  revalidateSite();
  return { ok: true };
}
