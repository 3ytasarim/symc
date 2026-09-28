"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/admin/common";
import { ActionButton } from "./RowActions";
import { Field, FormMessage, Input, SubmitButton, Textarea, useKeepInputSubmit } from "./ui";

type Category = { id: string; name: string; slug: string; description: string; sortOrder: number; count: number };

function CategoryRow({
  category,
  save,
  remove,
}: {
  category: Category | null;
  save: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  remove?: () => Promise<ActionResult>;
}) {
  const [state, action, pending] = useActionState(save, { ok: false });
  const onSubmit = useKeepInputSubmit(action);
  const e = state.errors ?? {};
  const pre = category?.id ?? "new";
  return (
    <form onSubmit={onSubmit} className="grid gap-3 border-b border-[#eef1f3] p-4 last:border-0 md:grid-cols-[1fr_1fr_2fr_90px_auto] md:items-end">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <Field label="Name" name={`${pre}-name`} error={e.name}>
        <Input name="name" id={`${pre}-name`} defaultValue={category?.name} required />
      </Field>
      <Field label="Slug" name={`${pre}-slug`} error={e.slug}>
        <Input name="slug" id={`${pre}-slug`} defaultValue={category?.slug} placeholder="auto" />
      </Field>
      <Field label="Description" name={`${pre}-description`}>
        <Textarea name="description" id={`${pre}-description`} defaultValue={category?.description} rows={1} className="min-h-[38px]" />
      </Field>
      <Field label="Order" name={`${pre}-sortOrder`} error={e.sortOrder}>
        <Input name="sortOrder" id={`${pre}-sortOrder`} type="number" min={0} defaultValue={category?.sortOrder ?? 0} />
      </Field>
      <div className="flex items-center gap-2">
        <SubmitButton pending={pending}>{category ? "Save" : "Add"}</SubmitButton>
        {category && remove ? (
          <ActionButton action={remove} label="Delete" confirm={`Delete “${category.name}”?`} className="admin-btn text-signal" />
        ) : null}
      </div>
      {category ? <p className="text-[12px] text-mute md:col-span-5">{category.count} item(s)</p> : null}
      <div className="md:col-span-5"><FormMessage state={state} /></div>
    </form>
  );
}

export function CategoryManager({
  categories,
  save,
  removers,
}: {
  categories: Category[];
  save: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  removers: Record<string, () => Promise<ActionResult>>;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[3px] border border-[#dde2e6] bg-white">
        {categories.map((c) => (
          <CategoryRow key={`${c.id}-${c.name}-${c.slug}`} category={c} save={save} remove={removers[c.id]} />
        ))}
        {!categories.length ? <p className="p-6 text-[13px] text-mute">No categories yet.</p> : null}
      </section>
      <section className="rounded-[3px] border border-[#dde2e6] bg-white">
        <h2 className="border-b border-[#e6eaed] px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.08em]">Add category</h2>
        <CategoryRow category={null} save={save} />
      </section>
    </div>
  );
}
