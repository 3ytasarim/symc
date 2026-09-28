"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/_actions/auth";
import { Field, FormMessage, Input, SubmitButton, useKeepInputSubmit } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { ok: false });
  const onSubmit = useKeepInputSubmit(action);
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="E-mail" name="email">
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password" name="password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pending={pending}>Sign in</SubmitButton>
    </form>
  );
}
