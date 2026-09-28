import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/admin/_actions/auth";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { AdminNav } from "./AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = await prisma.contactMessage.count({ where: { isRead: false } });
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin/" aria-label="Dashboard">
            <Image src="/brand/symc-logo-light-horizontal.png" alt="SYMC" width={959} height={240} className="h-7 w-auto" priority />
          </Link>
          <a href="/" target="_blank" rel="noopener" className="text-[11px] text-white/60 hover:text-white">View site ↗</a>
        </div>
        <AdminNav unread={unread} />
        <div className="border-t border-white/10 px-5 py-4 text-[12px] text-white/60">
          <p className="truncate text-white/85">{admin.name}</p>
          <p className="truncate">{admin.email}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/admin/account/" className="hover:text-white">Account</Link>
            <form action={logoutAction}>
              <button type="submit" className="hover:text-white">Sign out</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
