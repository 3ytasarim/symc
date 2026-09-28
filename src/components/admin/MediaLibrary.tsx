"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails */
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { deleteMediaAction, updateMediaAction, uploadMediaAction, type MediaItem, type UploadResult } from "@/app/admin/_actions/media";

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [upload, uploadAction, uploading] = useActionState<UploadResult, FormData>(async (prev, fd) => {
    const r = await uploadMediaAction(prev, fd);
    router.refresh();
    return r;
  }, { ok: false });
  return (
    <div className="space-y-6">
      <form action={uploadAction} className="flex flex-wrap items-end gap-4 rounded-[3px] border border-[#dde2e6] bg-white p-4">
        <label className="text-[12px] font-semibold uppercase tracking-[0.06em]">
          Images (JPEG, PNG, WebP, AVIF · max 15 MB)
          <input name="files" type="file" multiple required accept="image/jpeg,image/png,image/webp,image/avif" className="mt-1 block text-[13px] font-normal normal-case" />
        </label>
        <label className="min-w-[260px] flex-1 text-[12px] font-semibold uppercase tracking-[0.06em]">
          Alt text · becomes the file name
          <input name="alt" required minLength={5} placeholder="e.g. M/Y Example 45m under way after refit" className="mt-1 block w-full rounded-[2px] border border-[#cfd5db] px-3 py-1.5 text-[14px] font-normal normal-case" />
        </label>
        <label className="text-[12px] font-semibold uppercase tracking-[0.06em]">
          Folder
          <input name="folder" placeholder="e.g. projects/my-example-45m" className="mt-1 block w-60 rounded-[2px] border border-[#cfd5db] px-3 py-1.5 text-[14px] font-normal normal-case" />
        </label>
        <button type="submit" disabled={uploading} className="admin-btn-primary">{uploading ? "Uploading…" : "Upload"}</button>
        {upload.message ? <p role="status" className="basis-full text-[13px] text-mute">{upload.message}</p> : null}
      </form>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((m) => (
          <MediaCard key={m.id} item={m} />
        ))}
      </ul>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const dirty = alt !== item.alt || caption !== item.caption;
  return (
    <li className="overflow-hidden rounded-[3px] border border-[#dde2e6] bg-white">
      <a href={item.url} target="_blank" rel="noopener" className="block aspect-[4/3] bg-[#eef1f3]">
        <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
      </a>
      <div className="space-y-2 p-3">
        <p className="truncate font-mono text-[11px] text-mute" title={item.url}>{item.url}</p>
        <p className="font-mono text-[11px] text-mute">{item.width}×{item.height} · {item.mimeType.replace("image/", "")} · {Math.round(item.sizeBytes / 1024)} KB</p>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.06em]">
          Alt text
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={`mt-1 block w-full rounded-[2px] border px-2 py-1 text-[13px] font-normal normal-case ${alt ? "border-[#cfd5db]" : "border-signal"}`} />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.06em]">
          Caption
          <input value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1 block w-full rounded-[2px] border border-[#cfd5db] px-2 py-1 text-[13px] font-normal normal-case" />
        </label>
        <div className="flex items-center gap-2">
          <button type="button" disabled={!dirty || pending} className="admin-btn-xs" onClick={() => start(async () => {
            const r = await updateMediaAction(item.id, { alt, caption });
            setMsg(r.ok ? "Saved" : "Error");
            router.refresh();
          })}>Save</button>
          <button type="button" disabled={pending} className="admin-btn-xs text-signal" onClick={() => {
            if (!window.confirm("Delete this image permanently?")) return;
            start(async () => {
              const r = await deleteMediaAction(item.id);
              setMsg(r.message ?? "");
              if (r.ok) router.refresh();
            });
          }}>Delete</button>
          {msg ? <span role="status" className="text-[12px] text-mute">{msg}</span> : null}
        </div>
      </div>
    </li>
  );
}
