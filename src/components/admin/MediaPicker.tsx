"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails of our own /media files */
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { listMediaAction, uploadMediaAction, type MediaItem, type UploadResult } from "@/app/admin/_actions/media";

export function MediaPickerDialog({
  onSelect,
  onClose,
  folder = "",
}: {
  onSelect: (m: MediaItem) => void;
  onClose: () => void;
  folder?: string;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [pending, start] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [upload, uploadAction, uploading] = useActionState<UploadResult, FormData>(uploadMediaAction, { ok: false });

  useEffect(() => {
    const t = setTimeout(() => start(async () => setItems((await listMediaAction(query)).items)), 200);
    return () => clearTimeout(t);
  }, [query, upload]);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Media library" className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-[3px] bg-white outline-none">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#e6eaed] p-4">
          <h2 className="mr-auto text-[15px] font-semibold">Media library</h2>
          <input
            type="search"
            placeholder="Search alt text or file name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded-[2px] border border-[#cfd5db] px-3 py-1.5 text-[14px]"
            aria-label="Search media"
          />
          <button type="button" onClick={onClose} className="admin-btn">Close</button>
        </div>
        <form action={uploadAction} className="flex flex-wrap items-end gap-3 border-b border-[#e6eaed] bg-[#f7f8f9] p-4">
          <label className="text-[12px] font-semibold">
            Upload new
            <input name="files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required className="mt-1 block text-[13px]" />
          </label>
          <label className="min-w-[260px] flex-1 text-[12px] font-semibold">
            Alt text (also used for the file name)
            <input name="alt" required minLength={5} placeholder="e.g. M/Y Example 45m aft deck after refit" className="mt-1 block w-full rounded-[2px] border border-[#cfd5db] px-3 py-1.5 text-[14px] font-normal" />
          </label>
          <input type="hidden" name="folder" value={folder} />
          <button type="submit" disabled={uploading} className="admin-btn-primary">{uploading ? "Uploading…" : "Upload"}</button>
          {upload.message ? <p className="basis-full text-[12px] text-mute">{upload.message}</p> : null}
        </form>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {pending && !items.length ? <p className="text-[13px] text-mute">Loading…</p> : null}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => onSelect(m)} className="group block w-full text-left">
                  <span className="block aspect-square overflow-hidden rounded-[2px] bg-[#eef1f3] ring-sea group-hover:ring-2 group-focus-visible:ring-2">
                    <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-[#3b4650]">{m.alt || m.filename}</span>
                  <span className="block font-mono text-[10px] text-mute">{m.width}×{m.height}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Single-image field: stores the Media id in a hidden input. */
export function MediaPicker({
  name,
  label,
  initial,
  hint,
  folder,
  onChange,
}: {
  name: string;
  label: string;
  initial: MediaItem | null;
  hint?: string;
  folder?: string;
  onChange?: (m: MediaItem | null) => void;
}) {
  const [value, setValue] = useState<MediaItem | null>(initial);
  const [open, setOpen] = useState(false);
  const set = (m: MediaItem | null) => {
    setValue(m);
    onChange?.(m);
  };
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3b4650]">{label}</p>
      <div className="flex items-start gap-4">
        <div className="h-24 w-36 shrink-0 overflow-hidden rounded-[2px] border border-[#dde2e6] bg-[#f3f5f6]">
          {value ? <img src={value.url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-[11px] text-mute">No image</span>}
        </div>
        <div className="min-w-0 space-y-2">
          {value ? <p className="line-clamp-2 text-[12px] text-[#3b4650]">{value.alt || <em className="text-signal">Missing alt text</em>}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="admin-btn" onClick={() => setOpen(true)}>{value ? "Change" : "Choose image"}</button>
            {value ? <button type="button" className="admin-btn" onClick={() => set(null)}>Remove</button> : null}
          </div>
          {hint ? <p className="text-[12px] text-mute">{hint}</p> : null}
        </div>
      </div>
      <input type="hidden" name={name} value={value?.id ?? ""} />
      {open ? (
        <MediaPickerDialog
          folder={folder}
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            set(m);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
