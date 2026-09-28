import type { Metadata } from "next";
import Link from "next/link";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/PageHeader";
import { prisma } from "@/lib/db";
import { toMediaItems } from "@/lib/admin/media-items";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; missingAlt?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const rows = await prisma.media.findMany({
    where: {
      ...(sp.missingAlt ? { alt: "" } : {}),
      ...(q ? { OR: [{ alt: { contains: q, mode: "insensitive" } }, { storageKey: { contains: q.toLowerCase() } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <>
      <PageHeader title="Media library" description="Files are stored outside the database with stable, descriptive URLs. Real width, height and type are read from each file on upload." />
      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search alt text or path…" aria-label="Search media" className="w-72 rounded-[2px] border border-[#cfd5db] bg-white px-3 py-1.5 text-[14px]" />
        <button type="submit" className="admin-btn">Search</button>
        <Link href="/admin/media/?missingAlt=1" className={`admin-btn ${sp.missingAlt ? "border-ink" : ""}`}>Missing alt text</Link>
        {q || sp.missingAlt ? <Link href="/admin/media/" className="admin-btn">Clear</Link> : null}
      </form>
      <MediaLibrary items={toMediaItems(rows)} />
    </>
  );
}
