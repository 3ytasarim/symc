import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = { title: "Page not found – SYMC YACHT", robots: NOINDEX_ROBOTS };

/** Unmatched URLs anywhere on the site: real HTTP 404 with the branded page. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
