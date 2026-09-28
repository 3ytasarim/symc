"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite, slugTaken, type ActionResult } from "@/lib/admin/common";
import { slugify } from "@/lib/content/slug";
import { categorySchema, formToObject, zodErrors } from "@/lib/validation/admin";

type Kind = "project" | "blog";

async function save(kind: Kind, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = typeof fd.get("id") === "string" && fd.get("id") ? String(fd.get("id")) : null;
  const parsed = categorySchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error), message: "Please correct the highlighted fields." };
  const d = parsed.data;
  const slug = d.slug || slugify(d.name);
  const model = kind === "project" ? "projectCategory" : "blogCategory";
  if (await slugTaken(model, slug, id)) return { ok: false, errors: { slug: "Slug already in use" } };
  const data = { name: d.name, slug, description: d.description, sortOrder: d.sortOrder };
  if (kind === "project") {
    if (id) await prisma.projectCategory.update({ where: { id }, data });
    else await prisma.projectCategory.create({ data });
  } else {
    if (id) await prisma.blogCategory.update({ where: { id }, data });
    else await prisma.blogCategory.create({ data });
  }
  revalidateSite();
  return { ok: true, message: id ? "Category updated." : "Category created." };
}

export async function saveProjectCategoryAction(_prev: ActionResult, fd: FormData) {
  return save("project", fd);
}

export async function saveBlogCategoryAction(_prev: ActionResult, fd: FormData) {
  return save("blog", fd);
}

export async function deleteProjectCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.project.count({ where: { categoryId: id } });
  if (count) return { ok: false, message: `This category is used by ${count} project(s). Move them to another category first.` };
  await prisma.projectCategory.delete({ where: { id } });
  revalidateSite();
  return { ok: true, message: "Category deleted." };
}

export async function deleteBlogCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.blogPost.count({ where: { categoryId: id } });
  if (count) return { ok: false, message: `This category is used by ${count} article(s). Move them first.` };
  await prisma.blogCategory.delete({ where: { id } });
  revalidateSite();
  return { ok: true, message: "Category deleted." };
}
