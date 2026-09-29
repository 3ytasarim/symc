import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteImage as SiteImageData } from "@/lib/data/media";
import { SailMark } from "./Icons";
import { SiteImage } from "./SiteImage";

type HeadingLevel = "h2" | "h3";

/** Service card (Norm Yacht pattern): tall image, title, two-line summary, "View details" link. */
export function ServiceCard({
  href,
  title,
  summary,
  image,
  as: H = "h3",
  imageClass = "h-72",
  sizes = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw",
}: {
  href: string;
  title: string;
  summary: string;
  image: SiteImageData | null;
  as?: HeadingLevel;
  imageClass?: string;
  sizes?: string;
}) {
  return (
    <Link href={href} className="card-hover group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-sm">
      <div className={`relative w-full overflow-hidden bg-deep ${imageClass}`}>
        {image ? (
          <SiteImage image={image} fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div aria-hidden="true" className="flex h-full items-center justify-center bg-gradient-to-br from-deep to-deep-2">
            <SailMark className="h-14 w-14" />
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <H className="mb-2 text-lg font-bold text-neutral-900 transition-colors group-hover:text-gold-ink">{title}</H>
        {summary ? <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">{summary}</p> : null}
        <span className="mt-auto flex items-center pt-4 text-sm font-semibold text-gold-ink">
          View details
          <ArrowRight aria-hidden="true" className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** News card (Norm Yacht pattern): image, date + category chip, title, excerpt, "Read more". */
export function NewsCard({
  href,
  title,
  excerpt,
  image,
  date,
  category,
  as: H = "h3",
}: {
  href: string;
  title: string;
  excerpt?: string | null;
  image: SiteImageData | null;
  date: Date;
  category?: string | null;
  as?: HeadingLevel;
}) {
  return (
    <Link href={href} className="card-hover group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-sm">
      <div className="relative h-48 overflow-hidden bg-deep">
        {image ? (
          <SiteImage image={image} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div aria-hidden="true" className="h-full bg-gradient-to-br from-deep to-deep-2" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <time dateTime={date.toISOString()} className="text-xs text-neutral-500">
            {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </time>
          {category ? <span className="rounded-md bg-gold-50 px-2 py-0.5 text-xs font-semibold text-gold-ink">{category}</span> : null}
        </div>
        <H className="mb-2 line-clamp-2 text-base font-bold text-neutral-900 transition-colors group-hover:text-gold-ink">{title}</H>
        {excerpt ? <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">{excerpt}</p> : null}
        <span className="mt-auto flex items-center pt-4 text-sm font-semibold text-gold-ink">
          Read more
          <ArrowRight aria-hidden="true" className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** "View all" outline button under a section. */
export function ViewAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 text-center">
      <Link href={href} className="btn-ghost group">
        {children}
        <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
