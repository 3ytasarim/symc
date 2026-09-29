import Link from "next/link";
import { ArrowRight, Calendar, Ruler, Tag } from "lucide-react";
import type { ProjectCard } from "@/lib/data/projects";
import { routes } from "@/lib/seo/site";
import { SailMark } from "./Icons";
import { SiteImage } from "./SiteImage";

export function projectMeta(p: Pick<ProjectCard, "category" | "projectYear" | "length" | "status">): string[] {
  return [
    p.category?.name,
    p.projectYear ? String(p.projectYear) : p.status === "IN_PROGRESS" ? "In progress" : null,
    p.length,
  ].filter((x): x is string => Boolean(x));
}

export function statusBadge(status: ProjectCard["status"]) {
  return status === "COMPLETED"
    ? { label: "Completed", tone: "success" as const, className: "bg-green-700 text-white" }
    : { label: "In progress", tone: "accent" as const, className: "bg-gold text-ink" };
}

type HeadingLevel = "h2" | "h3";

/**
 * Image-led project card (bento pattern): the cover photograph fills the
 * card, status badge on top, compact caption (meta, title, summary) over a
 * gradient on the lower part only, so the photo stays visible.
 */
export function ProjectShowcaseCard({
  project,
  as: H = "h3",
  sizes = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw",
}: {
  project: ProjectCard;
  as?: HeadingLevel;
  sizes?: string;
}) {
  const badge = statusBadge(project.status);
  const meta = [project.category?.name, project.length, project.projectYear ? String(project.projectYear) : null].filter(Boolean);
  return (
    <Link
      href={routes.project(project.slug)}
      className="on-dark group relative isolate flex h-[25rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-deep text-white shadow-sm transition-shadow duration-300 hover:shadow-2xl"
    >
      {project.coverImage ? (
        <SiteImage
          image={project.coverImage}
          fill
          sizes={sizes}
          quality={80}
          className="-z-20 object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-20 flex items-center justify-center bg-gradient-to-br from-deep to-deep-2">
          <SailMark className="h-16 w-16" />
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
      <span className={`absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
      <span
        aria-hidden="true"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <ArrowRight className="h-4 w-4 -rotate-45" />
      </span>
      <div className="p-6">
        {meta.length ? <p className="text-[11px] font-bold uppercase tracking-widest text-gold">{meta.join(" · ")}</p> : null}
        <H className="mt-1.5 text-xl font-bold leading-snug">{project.title}</H>
        {project.shortDescription ? <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/80">{project.shortDescription}</p> : null}
      </div>
    </Link>
  );
}

/** Project card (Norm Yacht pattern): rounded image with status badge, title, summary, meta rows and a "View project" link. */
export function ProjectTile({
  project,
  as: H = "h3",
  sizes = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw",
  compact = false,
}: {
  project: ProjectCard;
  as?: HeadingLevel;
  sizes?: string;
  compact?: boolean;
}) {
  const badge = statusBadge(project.status);
  return (
    <Link
      href={routes.project(project.slug)}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-sm"
    >
      <div className="relative h-52 overflow-hidden bg-deep">
        {project.coverImage ? (
          <SiteImage image={project.coverImage} fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div aria-hidden="true" className="flex h-full items-center justify-center bg-gradient-to-br from-deep to-deep-2">
            <SailMark className="h-14 w-14 opacity-90" />
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute left-4 top-4 rounded-md px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <H className="mb-2 line-clamp-2 text-base font-bold text-neutral-900 transition-colors group-hover:text-gold-ink">{project.title}</H>
        {!compact && project.shortDescription ? (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-neutral-600">{project.shortDescription}</p>
        ) : null}
        <ul className="mb-4 space-y-2 text-xs text-neutral-500">
          {project.category ? (
            <li className="flex items-center gap-2">
              <Tag aria-hidden="true" className="h-3.5 w-3.5 text-gold-ink" />
              {project.category.name}
            </li>
          ) : null}
          {project.length ? (
            <li className="flex items-center gap-2">
              <Ruler aria-hidden="true" className="h-3.5 w-3.5 text-gold-ink" />
              {project.length}
            </li>
          ) : null}
          {project.projectYear ? (
            <li className="flex items-center gap-2">
              <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-gold-ink" />
              {project.projectYear}
            </li>
          ) : null}
        </ul>
        <span className="mt-auto flex items-center border-t border-neutral-100 pt-4 text-sm font-semibold text-gold-ink">
          View project
          <ArrowRight aria-hidden="true" className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
