"use server";

import path from "node:path";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { revalidateSite, type ActionResult } from "@/lib/admin/common";
import { slugify } from "@/lib/content/slug";
import { readImageMetaFromBuffer } from "@/lib/seo/image-meta";
import { deleteFromStorage, saveToStorage, storageExists } from "@/lib/storage";
import { mediaUrl } from "@/lib/storage/paths";
import { mediaUpdateSchema, zodErrors } from "@/lib/validation/admin";

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 12000;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
// SVG is intentionally not accepted (script injection risk); GIF is not needed for photography.

export type MediaItem = {
  id: string;
  url: string;
  storageKey: string;
  filename: string;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
  alt: string;
  caption: string;
  createdAt: string;
};

function toItem(m: {
  id: string; storageKey: string; filename: string; width: number; height: number; mimeType: string; sizeBytes: number; alt: string; caption: string; createdAt: Date;
}): MediaItem {
  return { ...m, url: mediaUrl(m.storageKey), createdAt: m.createdAt.toISOString() };
}

function sanitizeFolder(folder: string): string {
  const parts = folder
    .split("/")
    .map((p) => slugify(p, 60))
    .filter(Boolean)
    .slice(0, 3);
  return parts.length ? parts.join("/") : `uploads/${new Date().getFullYear()}`;
}

async function uniqueKey(folder: string, base: string, ext: string): Promise<string> {
  for (let i = 1; i < 500; i++) {
    const key = `${folder}/${base}${i === 1 ? "" : `-${i}`}.${ext}`;
    const [inDb, onDisk] = await Promise.all([prisma.media.count({ where: { storageKey: key } }), storageExists(key)]);
    if (!inDb && !onDisk) return key;
  }
  throw new Error("Could not allocate a unique file name");
}

export type UploadResult = ActionResult & { items?: MediaItem[] };

/**
 * Validates and stores uploaded images. The file type is determined from the
 * file's magic bytes (never the client-supplied type or extension); width,
 * height and MIME are read from the header and stored with the record.
 * Descriptive file names are derived from the alt text (image SEO).
 */
export async function uploadMediaAction(_prev: UploadResult, fd: FormData): Promise<UploadResult> {
  await requireAdmin();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, message: "Choose at least one image." };
  if (files.length > 20) return { ok: false, message: "Upload at most 20 images at a time." };
  const folder = sanitizeFolder(String(fd.get("folder") ?? ""));
  const altBase = String(fd.get("alt") ?? "").trim().slice(0, 250);

  const items: MediaItem[] = [];
  const errors: string[] = [];
  for (const [index, file] of files.entries()) {
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: larger than 15 MB`);
      continue;
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    const meta = readImageMetaFromBuffer(buf);
    const ext = meta ? EXT_BY_MIME[meta.mimeType] : undefined;
    if (!meta || !ext) {
      errors.push(`${file.name}: not a JPEG, PNG, WebP or AVIF image`);
      continue;
    }
    if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
      errors.push(`${file.name}: dimensions exceed ${MAX_DIMENSION}px`);
      continue;
    }
    const alt = altBase;
    const nameSource = altBase || path.parse(file.name).name;
    let base = slugify(nameSource, 70) || "image";
    if (/^(img|dsc|image|photo|whatsapp)[-_\d]*$/i.test(base)) base = `${folder.split("/").pop()}-${base}`;
    if (files.length > 1 && altBase) base = `${base}-${index + 1}`;
    const key = await uniqueKey(folder, base, ext);
    await saveToStorage(key, buf);
    const media = await prisma.media.create({
      data: {
        storageKey: key,
        filename: path.basename(key),
        mimeType: meta.mimeType,
        width: meta.width,
        height: meta.height,
        sizeBytes: buf.byteLength,
        alt,
      },
    });
    items.push(toItem(media));
  }
  if (items.length) revalidateSite();
  return {
    ok: items.length > 0,
    items,
    message: errors.length ? `Uploaded ${items.length}. Skipped: ${errors.join("; ")}` : `Uploaded ${items.length} image${items.length === 1 ? "" : "s"}.`,
  };
}

export async function updateMediaAction(id: string, input: { alt: string; caption: string }): Promise<ActionResult> {
  await requireAdmin();
  const parsed = mediaUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: zodErrors(parsed.error) };
  await prisma.media.update({ where: { id }, data: parsed.data });
  revalidateSite();
  return { ok: true, message: "Saved." };
}

export async function mediaUsage(id: string): Promise<string[]> {
  await requireAdmin();
  const m = await prisma.media.findUnique({
    where: { id },
    include: {
      projectCovers: { select: { title: true } },
      projectHeroes: { select: { title: true } },
      projectOg: { select: { title: true } },
      projectImages: { select: { project: { select: { title: true } } } },
      serviceHeroes: { select: { title: true } },
      serviceOg: { select: { title: true } },
      serviceImages: { select: { service: { select: { title: true } } } },
      postCovers: { select: { title: true } },
      postOg: { select: { title: true } },
      settingsLogo: { select: { id: true } },
      settingsLight: { select: { id: true } },
      settingsDark: { select: { id: true } },
      settingsOg: { select: { id: true } },
      settingsHero: { select: { id: true } },
    },
  });
  if (!m) return [];
  const uses = [
    ...m.projectCovers.map((x) => `Project cover: ${x.title}`),
    ...m.projectHeroes.map((x) => `Project hero: ${x.title}`),
    ...m.projectOg.map((x) => `Project OG image: ${x.title}`),
    ...m.projectImages.map((x) => `Project gallery: ${x.project.title}`),
    ...m.serviceHeroes.map((x) => `Service hero: ${x.title}`),
    ...m.serviceOg.map((x) => `Service OG image: ${x.title}`),
    ...m.serviceImages.map((x) => `Service gallery: ${x.service.title}`),
    ...m.postCovers.map((x) => `Article cover: ${x.title}`),
    ...m.postOg.map((x) => `Article OG image: ${x.title}`),
    ...(m.settingsLogo.length || m.settingsLight.length || m.settingsDark.length ? ["Site settings: logo"] : []),
    ...(m.settingsOg.length ? ["Site settings: default share image"] : []),
    ...(m.settingsHero.length ? ["Site settings: homepage hero"] : []),
  ];
  return [...new Set(uses)];
}

/** Deletes a file only when nothing references it (prevents broken pages). */
export async function deleteMediaAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const uses = await mediaUsage(id);
  if (uses.length) return { ok: false, message: `This image is in use — ${uses.join(", ")}. Remove it there first.` };
  const m = await prisma.media.delete({ where: { id } }).catch(() => null);
  if (!m) return { ok: false, message: "Image not found." };
  await deleteFromStorage(m.storageKey);
  revalidateSite();
  return { ok: true, message: "Image deleted." };
}

/** Media library listing for pickers (admin only). */
export async function listMediaAction(query: string, page = 0): Promise<{ items: MediaItem[]; hasMore: boolean }> {
  await requireAdmin();
  const q = query.trim().slice(0, 100);
  const take = 48;
  const rows = await prisma.media.findMany({
    where: q
      ? { OR: [{ alt: { contains: q, mode: "insensitive" } }, { storageKey: { contains: q.toLowerCase() } }, { caption: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    skip: Math.max(0, page) * take,
    take: take + 1,
  });
  return { items: rows.slice(0, take).map(toItem), hasMore: rows.length > take };
}

export async function getMediaByIdsAction(idList: string[]): Promise<MediaItem[]> {
  await requireAdmin();
  const rows = await prisma.media.findMany({ where: { id: { in: idList.slice(0, 200) } } });
  const map = new Map(rows.map((r) => [r.id, toItem(r)]));
  return idList.map((id) => map.get(id)).filter((x): x is MediaItem => Boolean(x));
}
