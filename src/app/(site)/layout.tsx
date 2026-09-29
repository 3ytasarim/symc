import { FloatingCta } from "@/components/site/FloatingCta";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-ink">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <FloatingCta />
    </>
  );
}
