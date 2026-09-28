import "server-only";
import type { Media } from "@/generated/prisma";
import type { MediaItem } from "@/app/admin/_actions/media";
import { mediaUrl } from "@/lib/storage/paths";

export function toMediaItem(m: Media | null | undefined): MediaItem | null {
  if (!m) return null;
  return {
    id: m.id,
    url: mediaUrl(m.storageKey),
    storageKey: m.storageKey,
    filename: m.filename,
    width: m.width,
    height: m.height,
    mimeType: m.mimeType,
    sizeBytes: m.sizeBytes,
    alt: m.alt,
    caption: m.caption,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toMediaItems(list: (Media | null | undefined)[]): MediaItem[] {
  return list.map(toMediaItem).filter((x): x is MediaItem => x !== null);
}
