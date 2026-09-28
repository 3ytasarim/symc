import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { CtaBand } from "@/components/site/CtaBand";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Gallery } from "@/components/site/Gallery";
import { ArrowRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProjectTile } from "@/components/site/ProjectTiles";
import { RichText } from "@/components/site/RichText";
import { findRedirect } from "@/lib/data/redirects";
import { getPublishedServices, getServiceBySlug } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";
import { ids, pageGraph, serviceEntity } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";
import { SLUG_PATTERN } from "@/lib/content/slug";

/**
 * Catch-all for every URL not matched by a static route:
 *  1. /<slug>/ → service detail. Services live at the site root
 *     (/new-construction/, /retrofit-refit-services/, …) to keep the legacy
 *     symc.com.tr URLs 1:1.
 *  2. otherwise → a DB-managed redirect (slug changes / manual) if one exists
 *  3. otherwise → a real HTTP 404.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ path: string[] }> };

async function load(path: string[]) {
  const [slug] = path;
  if (path.length !== 1 || !slug || !SLUG_PATTERN.test(slug)) return null;
  return getServiceBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const svc = await load(path);
  if (!svc) return {};
  return buildMetadata({
    title: svc.seoTitle || svc.title,
    description: svc.seoDescription || svc.shortDescription,
    path: routes.service(svc.slug),
    image: svc.ogImage ?? svc.heroImage,
    index: svc.robotsIndex,
  });
}

export default async function ServicePage({ params }: Props) {
  const { path: segments } = await params;
  const svc = await load(segments);
  if (!svc) {
    const r = await findRedirect(`/${segments.map(encodeURIComponent).join("/")}/`);
    if (r) (r.statusCode === 302 ? redirect : permanentRedirect)(r.toPath);
    notFound();
  }
  const [s, allServices] = await Promise.all([getSiteSettings(), getPublishedServices()]);
  const path = routes.service(svc.slug);
  const url = absoluteUrl(path);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Services", path: routes.services },
    { name: svc.title, path },
  ];
  const others = allServices.filter((x) => x.slug !== svc.slug);
  const gallery = svc.gallery.filter((g) => g.id !== svc.heroImage?.id);

  const jsonLd = await pageGraph(s, {
    path,
    name: svc.seoTitle || svc.title,
    description: svc.seoDescription || svc.shortDescription,
    crumbs,
    primaryImage: svc.heroImage,
    datePublished: svc.createdAt,
    dateModified: svc.updatedAt,
    mainEntityId: ids.entity(url, "service"),
    entities: [
      serviceEntity({
        path,
        name: svc.title,
        description: svc.shortDescription,
        primaryImage: svc.heroImage,
        highlights: svc.highlights,
      }),
    ],
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero title={svc.title} eyebrow="Service" intro={svc.shortDescription} image={svc.heroImage} crumbs={crumbs} />

      <section className="shell py-20 md:py-32">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow index="01">Overview</Eyebrow>
            <RichText html={svc.content} className="mt-8 max-w-2xl" />
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-32">
              {svc.highlights.length ? (
                <>
                  <h2 className="eyebrow text-mute">What’s included</h2>
                  <ol className="mt-6 border-t border-line">
                    {svc.highlights.map((h, i) => (
                      <li key={h} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-3.5 text-[15px]">
                        <span className="font-mono text-[11px] leading-6 text-mute">{String(i + 1).padStart(2, "0")}</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
              <div className={`bg-deep p-8 text-white on-dark ${svc.highlights.length ? "mt-10" : ""}`}>
                <p className="font-display text-[1.7rem] leading-tight">Discuss your project with SYMC.</p>
                <Link href={routes.contact} className="btn-light-solid mt-6 w-full">
                  Contact us <ArrowRight />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {gallery.length ? (
        <section className="shell pb-20 md:pb-32" aria-labelledby="gallery-title">
          <h2 id="gallery-title" className="eyebrow mb-8 text-mute">
            {svc.title} — in the field
          </h2>
          <Gallery images={gallery} title={svc.title} />
        </section>
      ) : null}

      {svc.projects.length ? (
        <section className="border-t border-line bg-bone py-20 md:py-28" aria-labelledby="svc-projects">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow index="02">Delivered</Eyebrow>
                <h2 id="svc-projects" className="display-2 mt-6">Related projects</h2>
              </div>
              <Link href={routes.projects} className="text-link inline-flex items-center gap-2 text-[14px] font-medium">
                All completed projects <ArrowRight />
              </Link>
            </div>
            <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {svc.projects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <ProjectTile project={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <nav aria-labelledby="other-services" className="shell py-20 md:py-28">
          <h2 id="other-services" className="eyebrow text-mute">Other services</h2>
          <ul className="mt-6 border-t border-line">
            {others.map((o) => (
              <li key={o.slug} className="border-b border-line">
                <Link href={routes.service(o.slug)} className="group flex items-center justify-between gap-6 py-6">
                  <span className="font-display text-[1.9rem] leading-tight group-hover:text-sea md:text-[2.3rem]">{o.title}</span>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
