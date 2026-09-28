"use client";

import { useActionState } from "react";
import { saveRedirectAction } from "@/app/admin/_actions/site";
import { Field, FormMessage, Input, Select, SubmitButton, useKeepInputSubmit } from "./ui";

export function RedirectForm() {
  const [state, action, pending] = useActionState(saveRedirectAction, { ok: false });
  const onSubmit = useKeepInputSubmit(action);
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-[3px] border border-[#dde2e6] bg-white p-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
      <Field label="From path" name="fromPath" error={e.fromPath}><Input name="fromPath" placeholder="/old-page/" required error={e.fromPath} /></Field>
      <Field label="To (path or URL)" name="toPath" error={e.toPath}><Input name="toPath" placeholder="/new-page/" required error={e.toPath} /></Field>
      <Field label="Type" name="statusCode">
        <Select name="statusCode" defaultValue="301">
          <option value="301">301</option>
          <option value="308">308</option>
          <option value="302">302 (temporary)</option>
        </Select>
      </Field>
      <SubmitButton pending={pending}>Add redirect</SubmitButton>
      <div className="md:col-span-4"><FormMessage state={state} /></div>
    </form>
  );
}
