import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { emptyServiceForm } from "@/lib/admin/service-form";

export const metadata: Metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <>
      <PageHeader title="New service" />
      <ServiceForm initial={emptyServiceForm} />
    </>
  );
}
