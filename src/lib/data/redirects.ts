import "server-only";
import { prisma } from "@/lib/db";
import { canonicalPath } from "@/lib/seo/site";

/** DB-managed redirects (slug changes, manual entries). Checked before a detail page 404s. */
export async function findRedirect(path: string): Promise<{ toPath: string; statusCode: number } | null> {
  const r = await prisma.redirect.findUnique({ where: { fromPath: canonicalPath(path) } });
  return r ? { toPath: r.toPath, statusCode: r.statusCode } : null;
}
