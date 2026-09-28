/**
 * Idempotent, non-destructive seed.
 *  - Media: copies seed assets into media storage (never overwrites) and upserts
 *    metadata with REAL dimensions/MIME read from the file header.
 *  - Content (settings, categories, services, projects): CREATE-ONLY. Existing
 *    rows are left untouched, so re-running the seed never overwrites edits
 *    made in the admin panel and never deletes anything.
 *  - Admin user: created only when ADMIN_EMAIL + ADMIN_PASSWORD are provided.
 */
import "dotenv/config";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma";
import { readImageMetaFromBuffer } from "../src/lib/seo/image-header";
import { resolveStoragePath } from "../src/lib/storage/paths";
import manifest from "../scripts/asset-prep/manifest.json";
import { HOME_HERO_KEY, projectCategories, projects, services, settings } from "./seed-content";

const prisma = new PrismaClient();
const ASSETS = path.join(__dirname, "seed-assets");

async function exists(p: string) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function seedMedia(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const item of manifest.images) {
    const key = item.dest;
    const src = path.join(ASSETS, key);
    const dest = resolveStoragePath(key);
    if (!dest) throw new Error(`Unsafe storage key in manifest: ${key}`);
    if (!(await exists(dest))) {
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(src, dest);
    }
    const buf = await readFile(dest);
    const meta = readImageMetaFromBuffer(buf);
    if (!meta) throw new Error(`Could not read image header: ${key}`);
    const media = await prisma.media.upsert({
      where: { storageKey: key },
      create: {
        storageKey: key,
        filename: path.basename(key),
        mimeType: meta.mimeType,
        width: meta.width,
        height: meta.height,
        sizeBytes: buf.byteLength,
        alt: item.alt,
        caption: item.caption,
      },
      // keep admin-edited alt/caption; only refresh the technical metadata
      update: { mimeType: meta.mimeType, width: meta.width, height: meta.height, sizeBytes: buf.byteLength },
    });
    ids.set(key, media.id);
  }
  console.log(`media: ${ids.size} files`);
  return ids;
}

function need(ids: Map<string, string>, key: string | null): string | null {
  if (!key) return null;
  const id = ids.get(key);
  if (!id) throw new Error(`Missing media for ${key}`);
  return id;
}

async function main() {
  const media = await seedMedia();

  const hero = need(media, HOME_HERO_KEY);
  await prisma.siteSetting.upsert({
    where: { id: "site" },
    create: { id: "site", ...settings, homeHeroImageId: hero, defaultOgImageId: hero },
    update: {},
  });

  const categoryIds = new Map<string, string>();
  for (const c of projectCategories) {
    const row = await prisma.projectCategory.upsert({ where: { slug: c.slug }, create: c, update: {} });
    categoryIds.set(c.slug, row.id);
  }

  await prisma.blogCategory.upsert({
    where: { slug: "company-news" },
    create: { slug: "company-news", name: "Company News", sortOrder: 1 },
    update: {},
  });

  for (const s of services) {
    const existing = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (existing) continue;
    await prisma.service.create({
      data: {
        slug: s.slug,
        title: s.title,
        sortOrder: s.sortOrder,
        featured: s.featured,
        publishStatus: "PUBLISHED",
        shortDescription: s.shortDescription,
        content: s.content,
        highlights: s.highlights,
        seoTitle: s.seoTitle,
        seoDescription: s.seoDescription,
        heroImageId: need(media, s.heroKey),
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        gallery: { create: s.galleryKeys.map((k, i) => ({ mediaId: need(media, k)!, sortOrder: i })) },
      },
    });
  }

  // Project content was last modified on the live site on 2026-01-16 (WP lastmod of /completed-projects/).
  const projectsLastModified = new Date("2026-01-16T19:48:43+03:00");
  for (const p of projects) {
    const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    const coverId = need(media, p.coverKey);
    await prisma.project.create({
      data: {
        slug: p.slug,
        title: p.title,
        categoryId: categoryIds.get(p.category) ?? null,
        status: p.status,
        publishStatus: "PUBLISHED",
        featured: p.featured,
        sortOrder: p.sortOrder,
        yachtName: p.yachtName,
        yachtType: p.yachtType,
        length: p.length,
        location: p.location,
        projectYear: p.projectYear,
        shortDescription: p.shortDescription,
        content: p.content,
        scopeItems: p.scopeItems,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        coverImageId: coverId,
        heroImageId: coverId,
        publishedAt: new Date("2024-09-11T13:59:28+03:00"), // WP date of the Completed Projects page
        createdAt: new Date("2024-09-11T13:59:28+03:00"),
        updatedAt: projectsLastModified,
        services: { connect: p.services.map((slug) => ({ slug })) },
        gallery: {
          create: [p.coverKey, ...p.galleryKeys]
            .filter((k): k is string => Boolean(k))
            .map((k, i) => ({ mediaId: need(media, k)!, sortOrder: i })),
        },
      },
    });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (!existing) {
      await prisma.adminUser.create({
        data: { email, name: process.env.ADMIN_NAME || "Administrator", passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
      });
      console.log(`admin user created: ${email}`);
    }
  } else {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set — no admin user created (use npm run admin:create).");
  }

  const counts = await Promise.all([prisma.service.count(), prisma.project.count(), prisma.media.count()]);
  console.log(`services: ${counts[0]}, projects: ${counts[1]}, media: ${counts[2]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
