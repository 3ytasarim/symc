import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/lib/seo/json-ld";

/** Visible breadcrumb trail — mirrors the BreadcrumbList in the page's JSON-LD. */
export function Breadcrumbs({ crumbs, tone = "light" }: { crumbs: Crumb[]; tone?: "light" | "dark" }) {
  const base = tone === "light" ? "text-neutral-400" : "text-neutral-500";
  const current = tone === "light" ? "text-neutral-200" : "text-neutral-900";
  const hover = tone === "light" ? "hover:text-gold" : "hover:text-gold-ink";
  return (
    <nav aria-label="Breadcrumb" className={`text-sm font-semibold ${base}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={`${current} line-clamp-1`}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className={`transition-colors ${hover}`}>
                    {c.name}
                  </Link>
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
