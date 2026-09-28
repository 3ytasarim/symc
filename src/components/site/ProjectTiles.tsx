import Link from "next/link";
import type { ProjectCard } from "@/lib/data/projects";
import { routes } from "@/lib/seo/site";
import { ArrowUpRight, SailMark } from "./Icons";
import { SiteImage } from "./SiteImage";

export function projectMeta(p: Pick<ProjectCard, "category" | "projectYear" | "length" | "status">): string[] {
  return [
    p.category?.name,
    p.projectYear ? String(p.projectYear) : p.status === "IN_PROGRESS" ? "In progress" : null,
    p.length,
  ].filter((x): x is string => Boolean(x));
}

type HeadingLevel = "h2" | "h3";

/** Large, photography-led project feature (image fills the tile, title over a scrim). */
export function ProjectFeature({ project, as: H = "h3", sizes = "100vw", className = "" }: { project: ProjectCard; as?: HeadingLevel; sizes?: string; className?: string }) {
  return (
    <Link href={routes.project(project.slug)} className={`on-dark group relative isolate block overflow-hidden bg-deep text-white ${className}`}>
      {project.coverImage ? (
        <SiteImage image={project.coverImage} fill sizes={sizes} className="-z-20 object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-soft)] group-hover:scale-[1.035]" />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
      <div className="flex h-full flex-col justify-end p-6 md:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/75">{projectMeta(project).join(" · ")}</p>
        <div className="mt-3 flex items-end justify-between gap-6">
          <H className="display-3 max-w-[18ch]">{project.title}</H>
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center border border-white/40 transition-colors group-hover:bg-white group-hover:text-ink md:flex">
            <ArrowUpRight />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Editorial project tile: image on top, meta + title + summary below. Typographic fallback when no photography exists. */
export function ProjectTile({ project, as: H = "h3", sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" }: { project: ProjectCard; as?: HeadingLevel; sizes?: string }) {
  return (
    <Link href={routes.project(project.slug)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-deep">
        {project.coverImage ? (
          <SiteImage image={project.coverImage} fill sizes={sizes} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]" />
        ) : (
          <div aria-hidden="true" className="on-dark flex h-full flex-col justify-between p-6 text-white">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">{project.category?.name}</span>
            <SailMark className="h-14 w-14 opacity-90" />
          </div>
        )}
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">{projectMeta(project).join(" · ")}</p>
      <H className="mt-2 font-display text-[1.75rem] leading-tight transition-colors group-hover:text-sea">{project.title}</H>
      {project.shortDescription ? <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-mute">{project.shortDescription}</p> : null}
    </Link>
  );
}
