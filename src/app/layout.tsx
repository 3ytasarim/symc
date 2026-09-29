import type { Metadata, Viewport } from "next";
import { Lato } from "next/font/google";
import { SITE_ORIGIN } from "@/lib/seo/site";
import "./globals.css";

// Lato — the typeface of the original symc.com.tr site.
const lato = Lato({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-lato",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: "SYMC YACHT",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#cbaa5c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lato.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
