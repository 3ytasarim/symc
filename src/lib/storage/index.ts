import "server-only";
import { mkdir, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";

/**
 * Media storage (local filesystem driver).
 *
 * Files live OUTSIDE the database, under MEDIA_STORAGE_DIR, and are served by
 * the /media/[...path] route with long-lived caching. The storage key is the
 * public path segment, so URLs are stable and descriptive:
 *   storageKey "projects/my-mmm-49-2m/my-mmm-49-2m-helideck.jpg"
 *   → https://www.symc.com.tr/media/projects/my-mmm-49-2m/my-mmm-49-2m-helideck.jpg
 *
 * To move to S3/R2 later, re-implement these four functions; nothing else
 * in the app touches the filesystem for media.
 */
import { resolveStoragePath } from "./paths";

export { storageRoot, isSafeStorageKey, resolveStoragePath, mediaUrl } from "./paths";

export async function storageExists(key: string): Promise<boolean> {
  const abs = resolveStoragePath(key);
  if (!abs) return false;
  try {
    await access(abs);
    return true;
  } catch {
    return false;
  }
}

export async function saveToStorage(key: string, data: Uint8Array): Promise<void> {
  const abs = resolveStoragePath(key);
  if (!abs) throw new Error(`Unsafe storage key: ${key}`);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, data, { flag: "wx" }); // never overwrite an existing file
}

export async function deleteFromStorage(key: string): Promise<void> {
  const abs = resolveStoragePath(key);
  if (!abs) return;
  await rm(abs, { force: true });
}
