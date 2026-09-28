import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { loadProjectForm, projectFormOptions } from "@/lib/admin/project-form";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const [data, { categories, services }] = await Promise.all([loadProjectForm(id), projectFormOptions()]);
  if (!data) notFound();
  return (
    <>
      <PageHeader title={data.title} description="Edit project" />
      <ProjectForm key={id} initial={data} categories={categories} services={services} notice={created ? "Project created." : undefined} />
    </>
  );
}
