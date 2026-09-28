"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ActionResult } from "@/lib/admin/common";

/** Small action button for list rows (publish, feature, reorder, delete). */
export function ActionButton({
  action,
  label,
  confirm,
  className = "admin-btn-xs",
  ariaLabel,
}: {
  action: () => Promise<ActionResult>;
  label: React.ReactNode;
  confirm?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const r = await action();
          if (!r.ok && r.message) window.alert(r.message);
          router.refresh();
        });
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}
