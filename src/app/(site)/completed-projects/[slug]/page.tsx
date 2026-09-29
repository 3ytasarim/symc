import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Anchor, ArrowLeft, ArrowRight, CheckCircle2, Compass, Ship, Wrench } from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/Eyebrow";
import { Gallery } from "@/components/site/Gallery";
import { JsonLd } from "@/components/site/JsonLd";
import { DecoratedImage } from "@/components/site/DecoratedImage";
import { PageHero } from "@/components/site/PageHero";
import { ProjectShowcaseCard, statusBadge } from "@/components/site/ProjectTiles";
import { RichText } from "@/components/site/RichText";
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
    // Same primary image for the visible gallery lead, og:image and #primaryimage.
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
  const images = [...(primary ? [primary] : []), ...p.gallery.filter((g) => g.id !== primary?.id)];
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Completed Projects", path: routes.projects },
    { name: p.title, path },
  ];
  const description = p.seoDescription || p.shortDescription || htmlToText(p.content);
  const badge = statusBadge(p.status);

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

  // Inner images: everything except the primary photo shown at the top.
  const inner = images.filter((img) => img.id !== primary?.id);
  const hasBody = Boolean(p.content && htmlToText(p.content) !== p.shortDescription);
  const heroBadges = [
    { label: badge.label, tone: badge.tone },
    ...(p.projectYear ? [{ label: String(p.projectYear), tone: "neutral" as const }] : []),
    ...(p.length ? [{ label: p.length, tone: "neutral" as const }] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={p.title}
        eyebrow={p.category?.name ?? "Project"}
        intro={p.shortDescription || undefined}
        crumbs={crumbs}
        badges={heroBadges}
      />

      <section className="bg-white py-16 md:py-24">
        <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-14">
          <div className="space-y-12 lg:col-span-2">
            {primary ? <DecoratedImage image={primary} icons={[Ship, Anchor, Wrench, Compass]} priority /> : null}

            {hasBody ? (
              <div>
                <p className="eyebrow text-gold-ink">Overview</p>
                <h2 className="display-3 mb-6 mt-3 text-neutral-900">Project description</h2>
                <RichText html={p.content} />
              </div>
            ) : null}

            {p.scopeItems.length ? (
              <div className="rounded-[1.75rem] border border-neutral-200 bg-bone p-6 md:p-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow text-gold-ink">Delivered</p>
                    <h2 className="display-3 mt-3 text-neutral-900">Scope of work</h2>
                  </div>
                  <span className="rounded-full bg-gold px-4 py-1.5 text-sm font-black text-ink">
                    {p.scopeItems.length} {p.scopeItems.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
                  {p.scopeItems.map((item, i) => (
                    <li key={`${i}-${item}`} className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-700">
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

                      </div>

          <aside className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-bone shadow-sm lg:sticky lg:top-28">
              <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />
              <div className="p-6">
                <h2 className="mb-5 border-b border-neutral-200 pb-4 text-lg font-black text-neutral-900">Project details</h2>
                <dl className="space-y-4">
                  {p.specs.map((spec) => (
                    <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-dashed border-neutral-200 pb-3">
                      <dt className="text-xs font-bold uppercase tracking-wide text-neutral-500">{spec.label}</dt>
                      <dd className="text-right font-semibold text-neutral-900">{spec.value}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-xs font-bold uppercase tracking-wide text-neutral-500">Status</dt>
                    <dd>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
                    </dd>
                  </div>
                </dl>

                {p.services.length ? (
                  <div className="mt-6 border-t border-neutral-200 pt-6">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">Services</h2>
                    <ul className="space-y-2">
                      {p.services.map((svc) => (
                        <li key={svc.slug}>
                          <Link href={routes.service(svc.slug)} className="group flex items-center justify-between gap-3 text-sm font-semibold text-neutral-800 hover:text-gold-ink">
                            {svc.title}
                            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-gold-ink transition-transform group-hover:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-6 border-t border-neutral-200 pt-6">
                  <Link href={routes.contact} className="btn-solid w-full">
                    Discuss your project
                  </Link>
                </div>
              </div>
            </div>
            <Link href={routes.projects} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-gold-ink">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to projects
            </Link>
          </aside>
        </div>
      </section>

      {inner.length ? (
        <section className="bg-bone py-16 md:py-24" aria-labelledby="gallery-title">
          <div className="shell">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold-ink">Gallery</p>
                <h2 id="gallery-title" className="display-2 mt-3 text-neutral-900">
                  {p.title}
                </h2>
              </div>
              <span className="text-sm font-semibold text-neutral-500">{inner.length} {inner.length === 1 ? "photo" : "photos"}</span>
            </div>
            <Gallery images={inner} title={p.title} />
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-white py-20" aria-labelledby="related-title">
          <div className="shell">
            <SectionHeading id="related-title" label="Our projects" title="More projects" />
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id} data-reveal>
                  <ProjectShowcaseCard project={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand phone={s.phone} />
    </>
  );
}
