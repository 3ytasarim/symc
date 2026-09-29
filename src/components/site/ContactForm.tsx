"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
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
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-neutral-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "block h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-base text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 aria-[invalid=true]:border-red-500";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const e = state.fieldErrors ?? {};
  if (state.status === "success") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 p-5 text-green-800">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="font-semibold">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="name" label="Name *" error={e.name}>
          <input id="name" name="name" autoComplete="name" required placeholder="Your name" className={inputClass} aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "name-error" : undefined} />
        </Field>
        <Field id="email" label="E-mail *" error={e.email}>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={inputClass} aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "email-error" : undefined} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone" error={e.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone number" className={inputClass} aria-invalid={Boolean(e.phone)} aria-describedby={e.phone ? "phone-error" : undefined} />
        </Field>
        <Field id="subject" label="Subject" error={e.subject}>
          <input id="subject" name="subject" placeholder="Subject" className={inputClass} />
        </Field>
      </div>
      <Field id="message" label="Message *" error={e.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="How can we help?"
          className={`${inputClass} h-auto resize-y py-2.5`}
          aria-invalid={Boolean(e.message)}
          aria-describedby={e.message ? "message-error" : undefined}
        />
      </Field>
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn-solid h-12 w-full" disabled={pending}>
        {pending ? (
          "Sending…"
        ) : (
          <>
            <Send aria-hidden="true" className="h-4 w-4" />
            Send message
          </>
        )}
      </button>
    </form>
  );
}
