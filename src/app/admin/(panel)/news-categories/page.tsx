import type { Metadata } from "next";
import { deleteBlogCategoryAction, saveBlogCategoryAction } from "@/app/admin/_actions/taxonomy";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "News categories" };

export default async function BlogCategoriesPage() {
  const rows = await prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { posts: true } } } });
  const categories = rows.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, sortOrder: c.sortOrder, count: c._count.posts }));
  return (
    <>
      <PageHeader title="News categories" />
      <CategoryManager categories={categories} save={saveBlogCategoryAction} removers={Object.fromEntries(rows.map((c) => [c.id, deleteBlogCategoryAction.bind(null, c.id)]))} />
    </>
  );
}
