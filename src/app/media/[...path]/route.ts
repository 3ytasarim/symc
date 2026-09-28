import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { resolveStoragePath } from "@/lib/storage/paths";

/**
 * Serves uploaded media from storage with stable, crawlable URLs.
 * Files are immutable (uploads never overwrite), so they are cached for a year.
 * Content-Type comes from a strict extension whitelist (keys are validated).
 */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

async function serve(request: Request, params: Promise<{ path: string[] }>, headOnly: boolean) {
  const { path } = await params;
  const key = path.map((p) => decodeURIComponent(p)).join("/");
  const abs = resolveStoragePath(key);
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  if (!abs || !TYPES[ext]) return new Response("Not found", { status: 404 });

  let info;
  try {
    info = await stat(abs);
    if (!info.isFile()) throw new Error("not a file");
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const etag = `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  const headers = new Headers({
    "Content-Type": TYPES[ext],
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": info.mtime.toUTCString(),
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
  });
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  if (headOnly) return new Response(null, { status: 200, headers });
  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream<Uint8Array>;
  return new Response(stream, { status: 200, headers });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return serve(request, params, false);
}

export async function HEAD(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return serve(request, params, true);
}
