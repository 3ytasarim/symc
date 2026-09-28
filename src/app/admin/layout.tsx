import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: { default: "SYMC Admin", template: "%s · SYMC Admin" },
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f3f5f6] text-ink">{children}</div>;
}
