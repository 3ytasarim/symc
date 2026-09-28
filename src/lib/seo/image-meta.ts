import "server-only";
import { open, stat } from "node:fs/promises";
import path from "node:path";
import { readImageMetaFromBuffer } from "./image-header";

/**
 * Real image metadata (width, height, MIME) read from the file header.
 * Images are never decoded or re-encoded: we read the leading bytes and parse
 * the container header. Results are cached per file (keyed by mtime + size).
 */
export { sniffMime, readImageMetaFromBuffer } from "./image-header";
export type ImageMeta = { width: number; height: number; mimeType: string; sizeBytes: number };

type CacheEntry = { key: string; meta: ImageMeta };
const cache = new Map<string, CacheEntry>();
const MAX_CACHE = 500;
const HEADER_CHUNKS = [64 * 1024, 512 * 1024];

/** Reads metadata for a file on disk, reading only as many header bytes as needed. */
export async function readImageMetaFromFile(filePath: string): Promise<ImageMeta | null> {
  const abs = path.resolve(filePath);
  let info;
  try {
    info = await stat(abs);
  } catch {
    return null;
  }
  const key = `${info.mtimeMs}:${info.size}`;
  const hit = cache.get(abs);
  if (hit && hit.key === key) return hit.meta;

  const handle = await open(abs, "r");
  try {
    for (const chunk of [...HEADER_CHUNKS, info.size]) {
      const length = Math.min(chunk, info.size);
      const buf = new Uint8Array(length);
      await handle.read(buf, 0, length, 0);
      const parsed = readImageMetaFromBuffer(buf);
      if (parsed) {
        const meta = { ...parsed, sizeBytes: info.size };
        if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
        cache.set(abs, { key, meta });
        return meta;
      }
      if (length >= info.size) break;
    }
    return null;
  } finally {
    await handle.close();
  }
}

/** Metadata for a file under /public (e.g. "/brand/symc-logo.png"). */
export function readPublicImageMeta(publicPath: string): Promise<ImageMeta | null> {
  return readImageMetaFromFile(path.join(process.cwd(), "public", publicPath.replace(/^\/+/, "")));
}
