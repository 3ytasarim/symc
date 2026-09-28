import Link from "next/link";
import type { Crumb } from "@/lib/seo/json-ld";

/** Visible breadcrumb trail — mirrors the BreadcrumbList in the page's JSON-LD. */
export function Breadcrumbs({ crumbs, tone = "light" }: { crumbs: Crumb[]; tone?: "light" | "dark" }) {
  const base = tone === "light" ? "text-white/70" : "text-mute";
  const current = tone === "light" ? "text-white" : "text-ink";
  return (
    <nav aria-label="Breadcrumb" className={`eyebrow ${base}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={`${current} line-clamp-1`}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="hover:underline underline-offset-4">
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
