import path from "node:path";

export function storageRoot(): string {
  return path.resolve(process.cwd(), process.env.MEDIA_STORAGE_DIR || "./storage/media");
}

const SAFE_KEY = /^[a-z0-9][a-z0-9\-/]*\.(jpg|png|webp|avif|gif)$/;

export function isSafeStorageKey(key: string): boolean {
  return SAFE_KEY.test(key) && !key.includes("..") && !key.includes("//");
}

/** Resolves a storage key to an absolute path, refusing anything outside the storage root. */
export function resolveStoragePath(key: string): string | null {
  if (!isSafeStorageKey(key)) return null;
  const root = storageRoot();
  const abs = path.resolve(root, key);
  if (!abs.startsWith(root + path.sep)) return null;
  return abs;
}

export function mediaUrl(storageKey: string): string {
  return `/media/${storageKey}`;
}
