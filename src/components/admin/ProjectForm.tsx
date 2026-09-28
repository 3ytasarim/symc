"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { MediaItem } from "@/app/admin/_actions/media";
import { saveProjectAction } from "@/app/admin/_actions/projects";
import { GalleryField } from "./GalleryField";
import { MediaPicker } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";
import { SeoFields } from "./SeoFields";
import { Checkbox, Field, FormMessage, Input, Panel, Select, SubmitButton, Textarea, useKeepInputSubmit } from "./ui";

export type ProjectFormData = {
  id: string | null;
  title: string;
  slug: string;
  categoryId: string;
  status: "COMPLETED" | "IN_PROGRESS";
  publishStatus: "DRAFT" | "PUBLISHED";
  shortDescription: string;
  content: string;
  coverImage: MediaItem | null;
  heroImage: MediaItem | null;
  gallery: MediaItem[];
  projectYear: string;
  completionDate: string;
  yachtName: string;
  yachtType: string;
  shipyard: string;
  location: string;
  length: string;
  beam: string;
  draft: string;
  grossTonnage: string;
  scopeItems: string;
  technicalSpecs: string;
  serviceIds: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImage: MediaItem | null;
  robotsIndex: boolean;
};

export function ProjectForm({
  initial,
  categories,
  services,
  notice,
}: {
  initial: ProjectFormData;
  categories: { id: string; name: string }[];
  services: { id: string; title: string }[];
  notice?: string;
}) {
  const [state, action, pending] = useActionState(saveProjectAction, { ok: Boolean(notice), message: notice });
  const onSubmit = useKeepInputSubmit(action);
  const [cover, setCover] = useState<MediaItem | null>(initial.coverImage);
  const [coverKey, setCoverKey] = useState(0);
  const [title, setTitle] = useState(initial.title);
  const e = state.errors ?? {};
  const folder = `projects/${initial.slug || "new"}`;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="space-y-6">
        <Panel title="Project">
          <Field label="Title *" name="title" error={e.title}>
            <Input name="title" value={title} onChange={(ev) => setTitle(ev.target.value)} required maxLength={160} error={e.title} />
          </Field>
          <Field label="URL slug" name="slug" error={e.slug} hint={`Public URL: /completed-projects/${initial.slug || "<generated-from-title>"}/ — changing it on a published project adds a 301 redirect automatically.`}>
            <Input name="slug" defaultValue={initial.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" error={e.slug} />
          </Field>
          <Field label="Short description" name="shortDescription" error={e.shortDescription} hint="Shown as the project summary and used as the default meta description.">
            <Textarea name="shortDescription" defaultValue={initial.shortDescription} maxLength={600} rows={3} />
          </Field>
          <div>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3b4650]">Full description</p>
            <RichTextEditor name="content" defaultValue={initial.content} />
          </div>
        </Panel>

        <Panel title="Images" description="Photography leads the project page. Every image needs descriptive alt text.">
          <div className="grid gap-6 md:grid-cols-2">
            <MediaPicker key={coverKey} name="coverImageId" label="Cover image (cards & listings)" initial={cover} folder={folder} onChange={setCover} />
            <MediaPicker name="heroImageId" label="Hero image (top of the page)" initial={initial.heroImage} folder={folder} hint="Also used as og:image and the page’s primary image. Defaults to the cover." />
          </div>
          <GalleryField
            name="gallery"
            initial={initial.gallery}
            folder={folder}
            onSetCover={(m) => {
              setCover(m);
              setCoverKey((k) => k + 1);
            }}
          />
        </Panel>

        <Panel title="Scope & specifications" description="All fields are optional — empty values are never shown on the website.">
          <Field label="Scope of work (one item per line)" name="scopeItems" error={e.scopeItems}>
            <Textarea name="scopeItems" defaultValue={initial.scopeItems} rows={8} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Yacht name" name="yachtName"><Input name="yachtName" defaultValue={initial.yachtName} /></Field>
            <Field label="Yacht type" name="yachtType"><Input name="yachtType" defaultValue={initial.yachtType} /></Field>
            <Field label="Shipyard" name="shipyard"><Input name="shipyard" defaultValue={initial.shipyard} /></Field>
            <Field label="Location" name="location"><Input name="location" defaultValue={initial.location} /></Field>
            <Field label="Length" name="length" hint="e.g. 49.2 m"><Input name="length" defaultValue={initial.length} /></Field>
            <Field label="Beam" name="beam"><Input name="beam" defaultValue={initial.beam} /></Field>
            <Field label="Draft" name="draft"><Input name="draft" defaultValue={initial.draft} /></Field>
            <Field label="Gross tonnage" name="grossTonnage"><Input name="grossTonnage" defaultValue={initial.grossTonnage} /></Field>
            <Field label="Project year" name="projectYear" error={e.projectYear}><Input name="projectYear" defaultValue={initial.projectYear} inputMode="numeric" error={e.projectYear} /></Field>
            <Field label="Completion date" name="completionDate" error={e.completionDate}><Input name="completionDate" type="date" defaultValue={initial.completionDate} /></Field>
          </div>
          <Field label="Additional specifications (Label: Value per line)" name="technicalSpecs" hint="e.g. Hull material: Steel">
            <Textarea name="technicalSpecs" defaultValue={initial.technicalSpecs} rows={4} />
          </Field>
        </Panel>

        <SeoFields
          seoTitle={initial.seoTitle}
          seoDescription={initial.seoDescription}
          ogImage={initial.ogImage}
          robotsIndex={initial.robotsIndex}
          errors={e}
          fallbackTitle={title}
          urlPath={`/completed-projects/${initial.slug || "…"}/`}
        />
      </div>

      <div className="space-y-6">
        <Panel title="Publishing">
          <Field label="Visibility" name="publishStatus">
            <Select name="publishStatus" defaultValue={initial.publishStatus}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          </Field>
          <Field label="Project status" name="status">
            <Select name="status" defaultValue={initial.status}>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In progress</option>
            </Select>
          </Field>
          <Field label="Category" name="categoryId">
            <Select name="categoryId" defaultValue={initial.categoryId}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Checkbox name="featured" label="Featured on the homepage" defaultChecked={initial.featured} />
          <FormMessage state={state} />
          <div className="flex gap-2">
            <SubmitButton pending={pending}>{initial.id ? "Save changes" : "Create project"}</SubmitButton>
            <Link href="/admin/projects/" className="admin-btn">Back</Link>
          </div>
        </Panel>
        <Panel title="Services performed" description="Links the project and service pages to each other.">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-3 text-[14px]">
              <input type="checkbox" name="serviceIds[]" value={s.id} defaultChecked={initial.serviceIds.includes(s.id)} className="h-4 w-4 accent-[#0073bd]" />
              {s.title}
            </label>
          ))}
        </Panel>
      </div>
    </form>
  );
}
