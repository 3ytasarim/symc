import type { Metadata } from "next";
import Link from "next/link";
import { deletePostAction, setPostFeaturedAction, setPostPublishAction } from "@/app/admin/_actions/posts";
import { PageHeader, StatusBadge } from "@/components/admin/PageHeader";
import { ActionButton } from "@/components/admin/RowActions";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/seo/site";

export const metadata: Metadata = { title: "News" };

export default async function NewsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = sp.status === "PUBLISHED" || sp.status === "DRAFT" ? sp.status : undefined;
  const posts = await prisma.blogPost.findMany({
    where: status ? { publishStatus: status } : undefined,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    include: { category: true },
  });
  const now = new Date();
  return (
    <>
      <PageHeader title="News" description="Articles appear on /news/ once published. The news section stays out of the navigation and the index until the first article is live." action={{ href: "/admin/news/new/", label: "New article" }} />
      <div className="mb-4 flex gap-2">
        {[undefined, "PUBLISHED", "DRAFT"].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/news/?status=${s}` : "/admin/news/"} className={`admin-btn ${status === s ? "border-ink" : ""}`}>{s ? (s === "PUBLISHED" ? "Published" : "Drafts") : "All"}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[3px] border border-[#dde2e6] bg-white">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="border-b border-[#e6eaed] text-[11px] uppercase tracking-[0.08em] text-mute">
            <tr><th className="px-4 py-3">Article</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Featured</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {posts.map((p) => {
              const live = p.publishStatus === "PUBLISHED" && p.publishedAt !== null && p.publishedAt <= now;
              return (
                <tr key={p.id} className="border-b border-[#eef1f3] last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/news/${p.id}/`} className="font-medium hover:text-sea">{p.title}</Link>
                    <p className="font-mono text-[11px] text-mute">{routes.post(p.slug)}</p>
                  </td>
                  <td className="px-4 py-3 text-mute">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-mute">{p.publishedAt ? p.publishedAt.toLocaleDateString("en-GB") : "—"}{p.publishStatus === "PUBLISHED" && !live ? " (scheduled)" : ""}</td>
                  <td className="px-4 py-3"><StatusBadge published={p.publishStatus === "PUBLISHED"} /></td>
                  <td className="px-4 py-3"><ActionButton action={setPostFeaturedAction.bind(null, p.id, !p.featured)} label={p.featured ? "★ Featured" : "☆"} /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1.5">
                    <Link href={`/admin/news/${p.id}/`} className="admin-btn-xs">Edit</Link>
                    {live ? <a href={routes.post(p.slug)} target="_blank" rel="noopener" className="admin-btn-xs">View</a> : null}
                    <ActionButton action={setPostPublishAction.bind(null, p.id, p.publishStatus !== "PUBLISHED")} label={p.publishStatus === "PUBLISHED" ? "Unpublish" : "Publish"} />
                    <ActionButton action={deletePostAction.bind(null, p.id)} label="Delete" confirm={`Delete “${p.title}” permanently?`} className="admin-btn-xs text-signal" />
                  </div></td>
                </tr>
              );
            })}
            {!posts.length ? <tr><td colSpan={6} className="px-4 py-10 text-center text-mute">No articles yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
