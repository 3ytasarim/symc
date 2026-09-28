import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * Public pages, CSS/JS (/_next/) and all photography (/media/, /brand/) stay
 * crawlable for Googlebot and Googlebot-Image; only the private admin is disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
