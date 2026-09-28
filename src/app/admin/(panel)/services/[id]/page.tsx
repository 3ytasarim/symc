import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { loadServiceForm } from "@/lib/admin/service-form";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const data = await loadServiceForm(id);
  if (!data) notFound();
  return (
    <>
      <PageHeader title={data.title} description="Edit service" />
      <ServiceForm key={id} initial={data} notice={created ? "Service created." : undefined} />
    </>
  );
}
