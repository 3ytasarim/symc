import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { canonicalPath } from "@/lib/seo/site";

export type ActionResult = { ok: boolean; message?: string; errors?: Record<string, string>; id?: string };

/** Content changes can affect many pages (home, listings, nav, sitemaps) — purge the whole ISR cache. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

type SlugModel = "project" | "service" | "blogPost" | "projectCategory" | "blogCategory";

export async function slugTaken(model: SlugModel, slug: string, excludeId?: string | null): Promise<boolean> {
  const where = { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) };
  switch (model) {
    case "project":
      return (await prisma.project.count({ where })) > 0;
    case "service":
      return (await prisma.service.count({ where })) > 0;
    case "blogPost":
      return (await prisma.blogPost.count({ where })) > 0;
    case "projectCategory":
      return (await prisma.projectCategory.count({ where })) > 0;
    case "blogCategory":
      return (await prisma.blogCategory.count({ where })) > 0;
  }
}

/** Reserved root-level paths a service slug must never shadow. */
export const RESERVED_ROOT_SLUGS = new Set([
  "about", "services", "completed-projects", "news", "contact", "admin", "media", "brand", "fonts",
  "feed", "sitemaps", "home", "blocks", "wp-admin", "wp-content", "wp-includes", "api", "_next",
]);

/**
 * When the URL of published content changes, keep the old URL working with a
 * 301 and re-point existing redirects to the new target (no redirect chains).
 */
export async function recordSlugRedirect(oldPath: string, newPath: string) {
  const from = canonicalPath(oldPath);
  const to = canonicalPath(newPath);
  if (from === to) return;
  await prisma.$transaction([
    prisma.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } }),
    prisma.redirect.deleteMany({ where: { fromPath: to } }),
    prisma.redirect.upsert({
      where: { fromPath: from },
      create: { fromPath: from, toPath: to, statusCode: 301, source: "SLUG_CHANGE" },
      update: { toPath: to, statusCode: 301, source: "SLUG_CHANGE" },
    }),
  ]);
}

export function fdString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}
