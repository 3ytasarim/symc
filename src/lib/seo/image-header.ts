import { imageSize } from "image-size";

/** Pure header parsing helpers (no Node/Next dependencies) shared by the app, seed and QA scripts. */
const MIME_BY_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  heif: "image/heif",
};

/** MIME type from magic bytes (never trusts file extension or client-sent type). */
export function sniffMime(buf: Uint8Array): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length >= 12 && ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP") return "image/webp";
  if (buf.length >= 12 && ascii(buf, 4, 8) === "ftyp") {
    const brand = ascii(buf, 8, 12);
    if (brand === "avif" || brand === "avis") return "image/avif";
  }
  if (buf.length >= 6 && (ascii(buf, 0, 6) === "GIF87a" || ascii(buf, 0, 6) === "GIF89a")) return "image/gif";
  return null;
}

function ascii(buf: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...buf.subarray(start, end));
}

/** Parses dimensions + MIME from an in-memory buffer (used for uploads). */
export function readImageMetaFromBuffer(buf: Uint8Array): { width: number; height: number; mimeType: string } | null {
  const sniffed = sniffMime(buf);
  if (!sniffed) return null;
  try {
    const result = imageSize(buf);
    if (!result.width || !result.height) return null;
    // EXIF orientations 5–8 rotate the image by 90°: report the displayed size.
    const rotated = result.orientation !== undefined && result.orientation >= 5;
    return {
      width: rotated ? result.height : result.width,
      height: rotated ? result.width : result.height,
      mimeType: (result.type && MIME_BY_TYPE[result.type]) || sniffed,
    };
  } catch {
    return null;
  }
}

