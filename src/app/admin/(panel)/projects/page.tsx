import type { Metadata } from "next";
import Link from "next/link";
import { moveProjectAction, deleteProjectAction, setProjectFeaturedAction, setProjectPublishAction } from "@/app/admin/_actions/projects";
import { PageHeader, StatusBadge } from "@/components/admin/PageHeader";
import { ActionButton } from "@/components/admin/RowActions";
import { prisma } from "@/lib/db";
import { mediaUrl } from "@/lib/storage/paths";
import { routes } from "@/lib/seo/site";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; category?: string }> }) {
  const sp = await searchParams;
  const status = sp.status === "PUBLISHED" || sp.status === "DRAFT" ? sp.status : undefined;
  const [projects, categories] = await Promise.all([
    prisma.project.findMany({
      where: { ...(status ? { publishStatus: status } : {}), ...(sp.category ? { categoryId: sp.category } : {}) },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { category: true, coverImage: true, _count: { select: { gallery: true } } },
    }),
    prisma.projectCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const filterLink = (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ status, category: sp.category, ...params }).filter(([, v]) => v) as [string, string][]);
    return `/admin/projects/${q.size ? `?${q}` : ""}`;
  };
  return (
    <>
      <PageHeader title="Projects" description="Order here is the order on the website. Only published projects are public." action={{ href: "/admin/projects/new/", label: "New project" }} />
      <div className="mb-4 flex flex-wrap gap-2 text-[13px]">
        {[undefined, "PUBLISHED", "DRAFT"].map((s) => (
          <Link key={s ?? "all"} href={filterLink({ status: s })} className={`admin-btn ${status === s ? "border-ink" : ""}`}>{s ? (s === "PUBLISHED" ? "Published" : "Drafts") : "All"}</Link>
        ))}
        <span className="mx-2 border-l border-[#d5dade]" />
        {categories.map((c) => (
          <Link key={c.id} href={filterLink({ category: sp.category === c.id ? undefined : c.id })} className={`admin-btn ${sp.category === c.id ? "border-ink" : ""}`}>{c.name}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[3px] border border-[#dde2e6] bg-white">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="border-b border-[#e6eaed] text-[11px] uppercase tracking-[0.08em] text-mute">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id} className="border-b border-[#eef1f3] last:border-0">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <ActionButton action={moveProjectAction.bind(null, p.id, "up")} label="↑" ariaLabel={`Move ${p.title} up`} />
                    <ActionButton action={moveProjectAction.bind(null, p.id, "down")} label="↓" ariaLabel={`Move ${p.title} down`} />
                    <span className="sr-only">Position {i + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    {p.coverImage ? <img src={mediaUrl(p.coverImage.storageKey)} alt="" className="h-10 w-14 rounded-[2px] object-cover" /> : <span className="h-10 w-14 rounded-[2px] bg-[#eef1f3]" />}
                    <div>
                      <Link href={`/admin/projects/${p.id}/`} className="font-medium hover:text-sea">{p.title}</Link>
                      <p className="font-mono text-[11px] text-mute">{routes.project(p.slug)} · {p._count.gallery} images</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-mute">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge published={p.publishStatus === "PUBLISHED"} /></td>
                <td className="px-4 py-3">
                  <ActionButton action={setProjectFeaturedAction.bind(null, p.id, !p.featured)} label={p.featured ? "★ Featured" : "☆"} ariaLabel={p.featured ? "Unfeature" : "Feature"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/projects/${p.id}/`} className="admin-btn-xs">Edit</Link>
                    {p.publishStatus === "PUBLISHED" ? <a href={routes.project(p.slug)} target="_blank" rel="noopener" className="admin-btn-xs">View</a> : null}
                    <ActionButton action={setProjectPublishAction.bind(null, p.id, p.publishStatus !== "PUBLISHED")} label={p.publishStatus === "PUBLISHED" ? "Unpublish" : "Publish"} />
                    <ActionButton action={deleteProjectAction.bind(null, p.id)} label="Delete" confirm={`Delete “${p.title}” permanently? Its public URL will return 404.`} className="admin-btn-xs text-signal" />
                  </div>
                </td>
              </tr>
            ))}
            {!projects.length ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-mute">No projects match this filter.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
