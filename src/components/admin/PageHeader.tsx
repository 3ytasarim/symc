import Link from "next/link";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-[14px] text-mute">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="admin-btn-primary">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${published ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
      {published ? "Published" : "Draft"}
    </span>
  );
}
