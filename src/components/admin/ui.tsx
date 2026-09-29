"use client";

import { useTransition } from "react";
import { useFormStatus } from "react-dom";

export const inputCls =
  "block w-full rounded-[2px] border border-[#cfd5db] bg-white px-3 py-2 text-[14px] text-ink shadow-none outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 aria-[invalid=true]:border-signal";

export function Field({
  label,
  name,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#3b4650]">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-[12px] text-mute">{hint}</p> : null}
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1 text-[12px] font-medium text-signal">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { name: string; error?: string };
export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      id={props.name}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${props.name}-error` : undefined}
      className={`${inputCls} ${className}`}
      {...props}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { name: string; error?: string };
export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      id={props.name}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${props.name}-error` : undefined}
      className={`${inputCls} min-h-[96px] ${className}`}
      {...props}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { name: string; error?: string };
export function Select({ error, className = "", children, ...props }: SelectProps) {
  return (
    <select id={props.name} aria-invalid={Boolean(error)} className={`${inputCls} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label htmlFor={name} className="flex cursor-pointer items-start gap-3 text-[14px]">
      <input id={name} name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-[#0073bd]" />
      <span>
        <span className="font-medium">{label}</span>
        {hint ? <span className="block text-[12px] text-mute">{hint}</span> : null}
      </span>
    </label>
  );
}

export function SubmitButton({ children = "Save", className = "", pending: pendingProp }: { children?: React.ReactNode; className?: string; pending?: boolean }) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;
  return (
    <button type="submit" disabled={pending} className={`admin-btn-primary ${className}`}>
      {pending ? "Saving…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message?: string } | undefined }) {
  if (!state?.message) return null;
  return (
    <p role="status" className={`rounded-[2px] border px-3 py-2 text-[13px] ${state.ok ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-300 bg-red-50 text-red-900"}`}>
      {state.message}
    </p>
  );
}

/**
 * Submits a form to a server action WITHOUT React 19's automatic form reset,
 * so user input survives validation errors and failed attempts.
 */
export function useKeepInputSubmit(dispatch: (fd: FormData) => void) {
  const [, startTransition] = useTransition();
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
}

export function Panel({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return (
    <section className="rounded-[3px] border border-[#dde2e6] bg-white">
      <header className="border-b border-[#e6eaed] px-5 py-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2b3640]">{title}</h2>
        {description ? <p className="mt-0.5 text-[12px] text-mute">{description}</p> : null}
      </header>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}
