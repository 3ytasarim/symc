import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: "Page not found – SYMC YACHT", robots: NOINDEX_ROBOTS };

export default function NotFound() {
  return <NotFoundContent />;
}
