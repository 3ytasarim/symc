import type { Metadata } from "next";
import Link from "next/link";
import { deleteServiceAction, moveServiceAction, setServicePublishAction } from "@/app/admin/_actions/services";
import { PageHeader, StatusBadge } from "@/components/admin/PageHeader";
import { ActionButton } from "@/components/admin/RowActions";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/seo/site";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesAdmin() {
  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }], include: { _count: { select: { projects: true } } } });
  return (
    <>
      <PageHeader title="Services" description="Service pages are served at the site root to preserve the original URLs." action={{ href: "/admin/services/new/", label: "New service" }} />
      <div className="overflow-x-auto rounded-[3px] border border-[#dde2e6] bg-white">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="border-b border-[#e6eaed] text-[11px] uppercase tracking-[0.08em] text-mute">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Projects</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-[#eef1f3] last:border-0">
                <td className="px-4 py-3"><div className="flex gap-1">
                  <ActionButton action={moveServiceAction.bind(null, s.id, "up")} label="↑" ariaLabel={`Move ${s.title} up`} />
                  <ActionButton action={moveServiceAction.bind(null, s.id, "down")} label="↓" ariaLabel={`Move ${s.title} down`} />
                </div></td>
                <td className="px-4 py-3">
                  <Link href={`/admin/services/${s.id}/`} className="font-medium hover:text-gold-ink">{s.title}</Link>
                  <p className="font-mono text-[11px] text-mute">{routes.service(s.slug)}</p>
                </td>
                <td className="px-4 py-3 text-mute">{s._count.projects}</td>
                <td className="px-4 py-3"><StatusBadge published={s.publishStatus === "PUBLISHED"} /></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1.5">
                  <Link href={`/admin/services/${s.id}/`} className="admin-btn-xs">Edit</Link>
                  <ActionButton action={setServicePublishAction.bind(null, s.id, s.publishStatus !== "PUBLISHED")} label={s.publishStatus === "PUBLISHED" ? "Unpublish" : "Publish"} />
                  <ActionButton action={deleteServiceAction.bind(null, s.id)} label="Delete" confirm={`Delete “${s.title}”? Its URL will return 404 — consider adding a redirect.`} className="admin-btn-xs text-signal" />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
