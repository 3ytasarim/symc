"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: { title?: string; items: { href: string; label: string }[] }[] = [
  { items: [{ href: "/admin/", label: "Dashboard" }] },
  {
    title: "Content",
    items: [
      { href: "/admin/projects/", label: "Projects" },
      { href: "/admin/project-categories/", label: "Project categories" },
      { href: "/admin/services/", label: "Services" },
      { href: "/admin/news/", label: "News" },
      { href: "/admin/news-categories/", label: "News categories" },
      { href: "/admin/media/", label: "Media" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/messages/", label: "Messages" },
      { href: "/admin/settings/", label: "Site settings" },
      { href: "/admin/redirects/", label: "Redirects & SEO" },
    ],
  },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="px-3 pb-6">
      {groups.map((g, gi) => (
        <div key={gi} className="mt-4">
          {g.title ? <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">{g.title}</p> : null}
          <ul>
            {g.items.map((item) => {
              const active = item.href === "/admin/" ? pathname === "/admin/" || pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-[2px] px-2 py-1.5 text-[14px] ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    {item.label}
                    {item.href === "/admin/messages/" && unread > 0 ? (
                      <span className="rounded-full bg-signal px-1.5 text-[11px] font-semibold text-white">{unread}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
