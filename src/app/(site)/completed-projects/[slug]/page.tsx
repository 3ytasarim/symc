import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { CtaBand } from "@/components/site/CtaBand";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Gallery } from "@/components/site/Gallery";
import { ArrowRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProjectTile, projectMeta } from "@/components/site/ProjectTiles";
import { RichText } from "@/components/site/RichText";
import { SpecList } from "@/components/site/SpecList";
import { findRedirect } from "@/lib/data/redirects";
import { getProjectBySlug, getRelatedProjects } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { SLUG_PATTERN } from "@/lib/content/slug";
import { htmlToText } from "@/lib/content/sanitize";
import { ids, pageGraph, projectEntity } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  if (!SLUG_PATTERN.test(slug)) return null;
  return getProjectBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return {};
  const primary = p.heroImage ?? p.coverImage;
  return buildMetadata({
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.shortDescription || htmlToText(p.content),
    path: routes.project(p.slug),
    // Same primary image for the visible hero, og:image and #primaryimage.
    image: p.ogImage ?? primary,
    index: p.robotsIndex,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) {
    const r = await findRedirect(routes.project(slug));
    if (r) (r.statusCode === 302 ? redirect : permanentRedirect)(r.toPath);
    notFound();
  }
  const [s, related] = await Promise.all([getSiteSettings(), getRelatedProjects(p, 3)]);
  const path = routes.project(p.slug);
  const url = absoluteUrl(path);
  const primary = p.heroImage ?? p.coverImage;
  const gallery = p.gallery.filter((g) => g.id !== primary?.id);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Completed Projects", path: routes.projects },
    { name: p.title, path },
  ];
  const description = p.seoDescription || p.shortDescription || htmlToText(p.content);

  const jsonLd = await pageGraph(s, {
    path,
    type: "ItemPage",
    name: p.seoTitle || p.title,
    description,
    crumbs,
    primaryImage: primary,
    primaryImageCaption: primary?.caption || p.title,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt,
    mainEntityId: ids.entity(url, "project"),
    entities: [
      projectEntity({
        path,
        name: p.title,
        description,
        category: p.category?.name,
        year: p.projectYear,
        location: p.location,
        primaryImage: primary,
        gallery: p.gallery,
        datePublished: p.publishedAt,
        dateModified: p.updatedAt,
        serviceUrls: p.services.map((x) => absoluteUrl(routes.service(x.slug))),
      }),
    ],
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={p.title}
        eyebrow={p.category?.name ?? "Project"}
        image={primary}
        crumbs={crumbs}
        meta={projectMeta(p)}
      />

      <section className="shell py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow index="01">The project</Eyebrow>
            {p.shortDescription ? (
              <p className="mt-8 font-display text-[1.9rem] leading-[1.2] text-balance md:text-[2.4rem]">{p.shortDescription}</p>
            ) : null}
            {p.content && htmlToText(p.content) !== p.shortDescription ? <RichText html={p.content} className="mt-10 max-w-2xl" /> : null}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            {p.specs.length ? (
              <>
                <h2 className="eyebrow text-mute">Specifications</h2>
                <div className="mt-6">
                  <SpecList specs={p.specs} />
                </div>
              </>
            ) : null}
            {p.services.length ? (
              <div className={p.specs.length ? "mt-12" : ""}>
                <h2 className="eyebrow text-mute">Services</h2>
                <ul className="mt-6 border-t border-line">
                  {p.services.map((svc) => (
                    <li key={svc.slug} className="border-b border-line">
                      <Link href={routes.service(svc.slug)} className="group flex items-center justify-between gap-4 py-4 text-[15px] hover:text-sea">
                        {svc.title}
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {p.scopeItems.length ? (
        <section className="on-dark bg-deep text-white" aria-labelledby="scope-title">
          <div className="shell py-20 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow tone="light" index="02">Scope of work</Eyebrow>
                <h2 id="scope-title" className="display-2 mt-6">
                  {p.scopeItems.length} {p.scopeItems.length === 1 ? "work item" : "work items"}
                </h2>
              </div>
            </div>
            <ol className="mt-14 grid border-t border-white/15 md:grid-cols-2 md:gap-x-16">
              {p.scopeItems.map((item, i) => (
                <li key={`${i}-${item}`} className="grid grid-cols-[3rem_1fr] border-b border-white/15 py-4 text-[15px] leading-relaxed text-white/85">
                  <span className="font-mono text-[11px] leading-6 text-white/60">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {gallery.length ? (
        <section className="shell py-20 md:py-28" aria-labelledby="gallery-title">
          <Eyebrow index="03">Gallery</Eyebrow>
          <h2 id="gallery-title" className="display-2 mb-12 mt-6">{p.title}</h2>
          <Gallery images={gallery} title={p.title} />
        </section>
      ) : null}

      {related.length ? (
        <section className="border-t border-line bg-bone py-20 md:py-28" aria-labelledby="related-title">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="related-title" className="display-2">More projects</h2>
              <Link href={routes.projects} className="text-link inline-flex items-center gap-2 text-[14px] font-medium">
                All completed projects <ArrowRight />
              </Link>
            </div>
            <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <ProjectTile project={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
