"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { MediaItem } from "@/app/admin/_actions/media";
import { saveServiceAction } from "@/app/admin/_actions/services";
import { GalleryField } from "./GalleryField";
import { MediaPicker } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";
import { SeoFields } from "./SeoFields";
import { Checkbox, Field, FormMessage, Input, Panel, Select, SubmitButton, Textarea, useKeepInputSubmit } from "./ui";

export type ServiceFormData = {
  id: string | null;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  highlights: string;
  heroImage: MediaItem | null;
  gallery: MediaItem[];
  featured: boolean;
  publishStatus: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaItem | null;
  robotsIndex: boolean;
};

export function ServiceForm({ initial, notice }: { initial: ServiceFormData; notice?: string }) {
  const [state, action, pending] = useActionState(saveServiceAction, { ok: Boolean(notice), message: notice });
  const onSubmit = useKeepInputSubmit(action);
  const [title, setTitle] = useState(initial.title);
  const e = state.errors ?? {};
  const folder = `services/${initial.slug || "new"}`;
  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-6">
        <Panel title="Service">
          <Field label="Title *" name="title" error={e.title}>
            <Input name="title" value={title} onChange={(ev) => setTitle(ev.target.value)} required error={e.title} />
          </Field>
          <Field label="URL slug" name="slug" error={e.slug} hint={`Served at the site root: /${initial.slug || "<slug>"}/ (keeps the original symc.com.tr URLs). Changing it adds a 301.`}>
            <Input name="slug" defaultValue={initial.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" error={e.slug} />
          </Field>
          <Field label="Short description" name="shortDescription" hint="Hero intro, cards and default meta description.">
            <Textarea name="shortDescription" defaultValue={initial.shortDescription} rows={3} maxLength={600} />
          </Field>
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3b4650]">Full content</p>
            <RichTextEditor name="content" defaultValue={initial.content} />
          </div>
          <Field label="Included items (one per line)" name="highlights" hint="Shown as a numbered list beside the content.">
            <Textarea name="highlights" defaultValue={initial.highlights} rows={6} />
          </Field>
        </Panel>
        <Panel title="Images">
          <MediaPicker name="heroImageId" label="Hero image" initial={initial.heroImage} folder={folder} hint="Primary image of the page, og:image and ImageObject." />
          <GalleryField name="gallery" initial={initial.gallery} folder={folder} />
        </Panel>
        <SeoFields seoTitle={initial.seoTitle} seoDescription={initial.seoDescription} ogImage={initial.ogImage} robotsIndex={initial.robotsIndex} errors={e} fallbackTitle={title} urlPath={`/${initial.slug || "…"}/`} />
      </div>
      <div className="space-y-6">
        <Panel title="Publishing">
          <Field label="Visibility" name="publishStatus">
            <Select name="publishStatus" defaultValue={initial.publishStatus}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </Field>
          <Checkbox name="featured" label="Featured" defaultChecked={initial.featured} />
          <FormMessage state={state} />
          <div className="flex gap-2">
            <SubmitButton pending={pending}>{initial.id ? "Save changes" : "Create service"}</SubmitButton>
            <Link href="/admin/services/" className="admin-btn">Back</Link>
          </div>
        </Panel>
      </div>
    </form>
  );
}
