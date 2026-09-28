"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails */
import { useState, useTransition } from "react";
import { updateMediaAction, type MediaItem } from "@/app/admin/_actions/media";
import { MediaPickerDialog } from "./MediaPicker";

/**
 * Ordered gallery editor: add from library/upload, reorder, remove, edit alt
 * text & caption inline, and optionally promote an image to cover.
 * Order is submitted as repeated hidden inputs `${name}[]`.
 */
export function GalleryField({
  name,
  initial,
  folder,
  onSetCover,
}: {
  name: string;
  initial: MediaItem[];
  folder?: string;
  onSetCover?: (m: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>(initial);
  const [open, setOpen] = useState(false);
  const [saving, start] = useTransition();
  const [notice, setNotice] = useState("");

  const move = (i: number, d: -1 | 1) =>
    setItems((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const saveMeta = (m: MediaItem, alt: string, caption: string) =>
    start(async () => {
      const r = await updateMediaAction(m.id, { alt, caption });
      setNotice(r.ok ? `Saved alt text for ${m.filename}` : "Could not save alt text");
      if (r.ok) setItems((list) => list.map((x) => (x.id === m.id ? { ...x, alt, caption } : x)));
    });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3b4650]">Gallery ({items.length})</p>
        <button type="button" className="admin-btn" onClick={() => setOpen(true)}>Add images</button>
      </div>
      {items.length === 0 ? <p className="rounded-[2px] border border-dashed border-[#cfd5db] p-6 text-center text-[13px] text-mute">No gallery images yet.</p> : null}
      <ol className="space-y-2">
        {items.map((m, i) => (
          <li key={m.id} className="flex gap-3 rounded-[2px] border border-[#e1e5e8] bg-white p-2">
            <input type="hidden" name={`${name}[]`} value={m.id} />
            <img src={m.url} alt="" className="h-20 w-28 shrink-0 rounded-[2px] object-cover" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="truncate font-mono text-[11px] text-mute">{i + 1}. {m.filename} · {m.width}×{m.height}</p>
              <MetaEditor item={m} onSave={saveMeta} disabled={saving} />
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" className="admin-btn-xs" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} up`}>↑</button>
              <button type="button" className="admin-btn-xs" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move image ${i + 1} down`}>↓</button>
              {onSetCover ? <button type="button" className="admin-btn-xs" onClick={() => onSetCover(m)}>Cover</button> : null}
              <button type="button" className="admin-btn-xs text-signal" onClick={() => setItems((l) => l.filter((x) => x.id !== m.id))} aria-label={`Remove image ${i + 1} from gallery`}>✕</button>
            </div>
          </li>
        ))}
      </ol>
      {notice ? <p role="status" className="mt-2 text-[12px] text-mute">{notice}</p> : null}
      {open ? (
        <MediaPickerDialog
          folder={folder}
          onClose={() => setOpen(false)}
          onSelect={(m) => {
            setItems((l) => (l.some((x) => x.id === m.id) ? l : [...l, m]));
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function MetaEditor({ item, onSave, disabled }: { item: MediaItem; onSave: (m: MediaItem, alt: string, caption: string) => void; disabled: boolean }) {
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption);
  const dirty = alt !== item.alt || caption !== item.caption;
  return (
    <div className="flex flex-wrap gap-2">
      <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (required for SEO & accessibility)" aria-label="Alt text" className={`min-w-[200px] flex-1 rounded-[2px] border px-2 py-1 text-[13px] ${alt ? "border-[#cfd5db]" : "border-signal"}`} />
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" aria-label="Caption" className="min-w-[160px] flex-1 rounded-[2px] border border-[#cfd5db] px-2 py-1 text-[13px]" />
      {dirty ? <button type="button" disabled={disabled} className="admin-btn-xs" onClick={() => onSave(item, alt, caption)}>Save</button> : null}
    </div>
  );
}
