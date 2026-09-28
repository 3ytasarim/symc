"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/(site)/contact/actions";
import type { ContactFormState } from "@/lib/validation/contact";

const initial: ContactFormState = { status: "idle" };

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-mute">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[13px] text-signal">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "mt-3 block w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3 text-[16px] text-ink placeholder:text-mute/60 focus:border-sea focus:outline-none focus:ring-0 aria-[invalid=true]:border-signal";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const e = state.fieldErrors ?? {};
  if (state.status === "success") {
    return (
      <div role="status" className="border-t border-ink pt-8">
        <p className="font-display text-[2rem] leading-tight">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="name" label="Name *" error={e.name}>
          <input id="name" name="name" autoComplete="name" required className={inputClass} aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "name-error" : undefined} />
        </Field>
        <Field id="email" label="E-mail *" error={e.email}>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "email-error" : undefined} />
        </Field>
        <Field id="phone" label="Phone" error={e.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} aria-invalid={Boolean(e.phone)} aria-describedby={e.phone ? "phone-error" : undefined} />
        </Field>
        <Field id="subject" label="Subject" error={e.subject}>
          <input id="subject" name="subject" className={inputClass} />
        </Field>
      </div>
      <Field id="message" label="Message *" error={e.message}>
        <textarea id="message" name="message" rows={6} required className={`${inputClass} resize-y`} aria-invalid={Boolean(e.message)} aria-describedby={e.message ? "message-error" : undefined} />
      </Field>
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-[14px] text-signal">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn-solid" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
