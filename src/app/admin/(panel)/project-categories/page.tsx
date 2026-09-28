import type { Metadata } from "next";
import { deleteProjectCategoryAction, saveProjectCategoryAction } from "@/app/admin/_actions/taxonomy";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Project categories" };

export default async function ProjectCategoriesPage() {
  const rows = await prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { projects: true } } } });
  const categories = rows.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, sortOrder: c.sortOrder, count: c._count.projects }));
  return (
    <>
      <PageHeader title="Project categories" description="Categories group projects on /completed-projects/ (description shown under the heading)." />
      <CategoryManager categories={categories} save={saveProjectCategoryAction} removers={Object.fromEntries(rows.map((c) => [c.id, deleteProjectCategoryAction.bind(null, c.id)]))} />
    </>
  );
}
