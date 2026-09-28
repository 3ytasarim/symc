import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { emptyProjectForm, projectFormOptions } from "@/lib/admin/project-form";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { categories, services } = await projectFormOptions();
  return (
    <>
      <PageHeader title="New project" description="Only verified information — every technical field is optional and hidden when empty." />
      <ProjectForm initial={emptyProjectForm} categories={categories} services={services} />
    </>
  );
}
