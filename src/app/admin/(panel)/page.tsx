import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

/** Real database counts only — no invented analytics. */
export default async function Dashboard() {
  const [projects, publishedProjects, posts, publishedPosts, services, media, missingAlt, unread, recentProjects, recentPosts] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { publishStatus: "PUBLISHED" } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { publishStatus: "PUBLISHED" } }),
    prisma.service.count({ where: { publishStatus: "PUBLISHED" } }),
    prisma.media.count(),
    prisma.media.count({ where: { alt: "" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, publishStatus: true, updatedAt: true } }),
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, publishStatus: true, updatedAt: true } }),
  ]);
  const stats = [
    { label: "Total projects", value: projects, href: "/admin/projects/" },
    { label: "Published projects", value: publishedProjects, href: "/admin/projects/?status=PUBLISHED" },
    { label: "Draft projects", value: projects - publishedProjects, href: "/admin/projects/?status=DRAFT" },
    { label: "Articles", value: posts, href: "/admin/news/" },
    { label: "Published articles", value: publishedPosts, href: "/admin/news/?status=PUBLISHED" },
    { label: "Published services", value: services, href: "/admin/services/" },
    { label: "Media files", value: media, href: "/admin/media/" },
    { label: "Unread messages", value: unread, href: "/admin/messages/" },
  ];
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <>
      <PageHeader title="Dashboard" description="Overview of the website content." />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded-[3px] border border-[#dde2e6] bg-white p-4 hover:border-ink">
              <span className="block text-[28px] font-semibold tabular-nums">{s.value}</span>
              <span className="text-[12px] uppercase tracking-[0.06em] text-mute">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {missingAlt > 0 ? (
        <p className="mt-4 rounded-[2px] border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          {missingAlt} image{missingAlt === 1 ? " has" : "s have"} no alt text. <Link href="/admin/media/?missingAlt=1" className="underline">Fix in the media library</Link> — alt text matters for accessibility and Google Images.
        </p>
      ) : null}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[
          { title: "Recently updated projects", rows: recentProjects, base: "/admin/projects/" },
          { title: "Recently updated articles", rows: recentPosts, base: "/admin/news/" },
        ].map((block) => (
          <section key={block.title} className="rounded-[3px] border border-[#dde2e6] bg-white">
            <h2 className="border-b border-[#e6eaed] px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.08em]">{block.title}</h2>
            {block.rows.length ? (
              <ul>
                {block.rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 border-b border-[#eef1f3] px-5 py-3 last:border-0">
                    <Link href={`${block.base}${r.id}/`} className="truncate text-[14px] hover:text-sea">{r.title}</Link>
                    <span className="flex shrink-0 items-center gap-3 text-[12px] text-mute">
                      <StatusBadge published={r.publishStatus === "PUBLISHED"} /> {fmt(r.updatedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-[13px] text-mute">Nothing yet.</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
