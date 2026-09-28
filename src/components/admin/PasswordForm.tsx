"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/app/admin/_actions/auth";
import { Field, FormMessage, Input, SubmitButton, useKeepInputSubmit } from "./ui";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, { ok: false });
  const onSubmit = useKeepInputSubmit(action);
  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-[3px] border border-[#dde2e6] bg-white p-5">
      <Field label="Current password" name="current"><Input name="current" type="password" autoComplete="current-password" required /></Field>
      <Field label="New password (min. 12 characters)" name="next"><Input name="next" type="password" autoComplete="new-password" minLength={12} required /></Field>
      <Field label="Confirm new password" name="confirm"><Input name="confirm" type="password" autoComplete="new-password" required /></Field>
      <FormMessage state={state} />
      <SubmitButton pending={pending}>Change password</SubmitButton>
    </form>
  );
}
