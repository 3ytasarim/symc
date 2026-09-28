"use client";

import { useState } from "react";
import type { MediaItem } from "@/app/admin/_actions/media";
import { MediaPicker } from "./MediaPicker";
import { Checkbox, Field, Input, Panel, Textarea } from "./ui";

/** Shared SEO panel with live length counters and a search-result preview. */
export function SeoFields({
  seoTitle,
  seoDescription,
  ogImage,
  robotsIndex,
  errors,
  fallbackTitle,
  urlPath,
}: {
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaItem | null;
  robotsIndex: boolean;
  errors: Record<string, string>;
  fallbackTitle: string;
  urlPath: string;
}) {
  const [title, setTitle] = useState(seoTitle);
  const [desc, setDesc] = useState(seoDescription);
  const shown = `${title || fallbackTitle} – SYMC YACHT`;
  return (
    <Panel title="SEO" description="Leave empty to use the title and short description.">
      <Field label={`SEO title (${title.length}/60)`} name="seoTitle" error={errors.seoTitle}>
        <Input name="seoTitle" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} />
      </Field>
      <Field label={`Meta description (${desc.length}/160)`} name="seoDescription" error={errors.seoDescription}>
        <Textarea name="seoDescription" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={170} rows={3} />
      </Field>
      <div className="rounded-[2px] border border-[#e6eaed] bg-[#fafbfb] p-3">
        <p className="text-[11px] uppercase tracking-[0.08em] text-mute">Search preview</p>
        <p className="mt-1 truncate text-[16px] text-[#1a0dab]">{shown}</p>
        <p className="truncate text-[12px] text-[#006621]">https://www.symc.com.tr{urlPath}</p>
        <p className="line-clamp-2 text-[13px] text-[#545454]">{desc || "(uses the short description)"}</p>
      </div>
      <MediaPicker name="ogImageId" label="Social share image (optional)" initial={ogImage} hint="Defaults to the primary image. 1200×630 or larger works best." />
      <Checkbox name="robotsIndex" label="Allow search engines to index this page" defaultChecked={robotsIndex} hint="Unticking adds noindex and removes the page from the sitemap." />
    </Panel>
  );
}
