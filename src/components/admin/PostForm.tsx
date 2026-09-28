"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { MediaItem } from "@/app/admin/_actions/media";
import { savePostAction } from "@/app/admin/_actions/posts";
import { MediaPicker } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";
import { SeoFields } from "./SeoFields";
import { Checkbox, Field, FormMessage, Input, Panel, Select, SubmitButton, Textarea, useKeepInputSubmit } from "./ui";

export type PostFormData = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: MediaItem | null;
  categoryId: string;
  authorName: string;
  publishStatus: "DRAFT" | "PUBLISHED";
  publishedAt: string;
  featured: boolean;
  relatedProjectIds: string[];
  relatedServiceIds: string[];
  canonicalUrl: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaItem | null;
  robotsIndex: boolean;
};

export function PostForm({
  initial,
  categories,
  projects,
  services,
  notice,
}: {
  initial: PostFormData;
  categories: { id: string; name: string }[];
  projects: { id: string; title: string }[];
  services: { id: string; title: string }[];
  notice?: string;
}) {
  const [state, action, pending] = useActionState(savePostAction, { ok: Boolean(notice), message: notice });
  const onSubmit = useKeepInputSubmit(action);
  const [title, setTitle] = useState(initial.title);
  const e = state.errors ?? {};
  const folder = `news/${initial.slug || "new"}`;
  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-6">
        <Panel title="Article">
          <Field label="Title *" name="title" error={e.title}>
            <Input name="title" value={title} onChange={(ev) => setTitle(ev.target.value)} required error={e.title} />
          </Field>
          <Field label="URL slug" name="slug" error={e.slug} hint={`/news/${initial.slug || "<generated-from-title>"}/`}>
            <Input name="slug" defaultValue={initial.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" error={e.slug} />
          </Field>
          <Field label="Excerpt" name="excerpt" hint="Shown in listings and as the default meta description.">
            <Textarea name="excerpt" defaultValue={initial.excerpt} rows={3} maxLength={600} />
          </Field>
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3b4650]">Content</p>
            <RichTextEditor name="content" defaultValue={initial.content} />
          </div>
          <MediaPicker name="coverImageId" label="Cover image" initial={initial.coverImage} folder={folder} hint="Primary image, og:image and BlogPosting image." />
        </Panel>
        <Panel title="Internal links" description="Related projects and services are linked from the article.">
          <div className="grid gap-6 md:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em]">Related projects</legend>
              <div className="max-h-64 space-y-1.5 overflow-y-auto">
                {projects.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" name="relatedProjectIds[]" value={p.id} defaultChecked={initial.relatedProjectIds.includes(p.id)} className="accent-[#0073bd]" /> {p.title}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em]">Related services</legend>
              <div className="space-y-1.5">
                {services.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" name="relatedServiceIds[]" value={s.id} defaultChecked={initial.relatedServiceIds.includes(s.id)} className="accent-[#0073bd]" /> {s.title}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Panel>
        <SeoFields seoTitle={initial.seoTitle} seoDescription={initial.seoDescription} ogImage={initial.ogImage} robotsIndex={initial.robotsIndex} errors={e} fallbackTitle={title} urlPath={`/news/${initial.slug || "…"}/`} />
        <Panel title="Advanced">
          <Field label="Canonical URL override" name="canonicalUrl" error={e.canonicalUrl} hint="Only for articles first published elsewhere. Leave empty for a self-referencing canonical.">
            <Input name="canonicalUrl" defaultValue={initial.canonicalUrl} placeholder="https://…" error={e.canonicalUrl} />
          </Field>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Publishing">
          <Field label="Visibility" name="publishStatus">
            <Select name="publishStatus" defaultValue={initial.publishStatus}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </Field>
          <Field label="Publication date" name="publishedAt" error={e.publishedAt} hint="A future date schedules the article.">
            <Input name="publishedAt" type="datetime-local" defaultValue={initial.publishedAt} error={e.publishedAt} />
          </Field>
          <Field label="Category" name="categoryId">
            <Select name="categoryId" defaultValue={initial.categoryId}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Author" name="authorName"><Input name="authorName" defaultValue={initial.authorName} /></Field>
          <Checkbox name="featured" label="Featured article" defaultChecked={initial.featured} />
          <FormMessage state={state} />
          <div className="flex gap-2">
            <SubmitButton pending={pending}>{initial.id ? "Save changes" : "Create article"}</SubmitButton>
            <Link href="/admin/news/" className="admin-btn">Back</Link>
          </div>
        </Panel>
      </div>
    </form>
  );
}
