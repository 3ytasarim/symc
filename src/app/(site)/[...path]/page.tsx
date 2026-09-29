import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Anchor, ArrowLeft, CheckCircle2, ClipboardList, Compass, HardHat, type LucideIcon, Paintbrush, Phone, Ruler, Ship, Users, Wrench } from "lucide-react";
import { ServiceCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/Eyebrow";
import { DecoratedImage } from "@/components/site/DecoratedImage";
import { EditorialHero } from "@/components/site/EditorialHero";
import { JsonLd } from "@/components/site/JsonLd";
import { RichText } from "@/components/site/RichText";
import { findRedirect } from "@/lib/data/redirects";
import { getPublishedServices, getServiceBySlug } from "@/lib/data/services";
import { getSiteSettings, telHref } from "@/lib/data/settings";
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

// Decorative corner icons around the service photograph.
const ICONS: Record<string, LucideIcon[]> = {
  "new-construction": [Ship, HardHat, Ruler, Anchor],
  "project-management-and-consultancy": [ClipboardList, HardHat, Compass, Users],
  "retrofit-refit-services": [Wrench, Paintbrush, Ship, Anchor],
  "yacht-management-service": [Anchor, Compass, Users, Ship],
};
const serviceIcons = (slug: string) => ICONS[slug] ?? [Anchor, Ship, Compass, Wrench];

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
      <EditorialHero
        eyebrow="Service"
        title={svc.title}
        description={svc.shortDescription}
        crumbs={crumbs}
        primaryCta={{ href: routes.contact, label: "Contact us" }}
        secondaryCta={{ href: routes.services, label: "All services" }}
        collage={false}
      />

      <section className="bg-white py-16 md:py-24">
        <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-14">
          <div className="lg:col-span-2">
            {svc.heroImage ? <DecoratedImage image={svc.heroImage} icons={serviceIcons(svc.slug)} priority /> : null}
            <div className={svc.heroImage ? "mt-14" : ""}>
              <p className="eyebrow text-gold-ink">Overview</p>
              <h2 className="display-3 mb-6 mt-3 text-neutral-900">About this service</h2>
              <RichText html={svc.content} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-bone shadow-sm lg:sticky lg:top-28">
              <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />
              <div className="p-6">
                {svc.highlights.length ? (
                  <>
                    <h2 className="mb-5 border-b border-neutral-200 pb-4 text-lg font-black text-neutral-900">What’s included</h2>
                    <ul className="mb-6 space-y-3">
                      {svc.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-sm text-neutral-700">
                          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <div className={svc.highlights.length ? "border-t border-neutral-200 pt-6" : ""}>
                  <h2 className="mb-3 text-lg font-black text-neutral-900">Need this service?</h2>
                  <p className="mb-6 text-sm leading-relaxed text-neutral-600">
                    Professionalism, dedication and passion are the prerequisites for being part of the SYMC family; whether maintenance, service or refit, we are available 24/7.
                  </p>
                  <Link href={routes.contact} className="btn-solid w-full">
                    Contact us
                  </Link>
                  {s.phone ? (
                    <a href={telHref(s.phone)} className="btn-ghost mt-3 w-full">
                      <Phone aria-hidden="true" className="h-4 w-4" />
                      {s.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            <Link href={routes.services} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-gold-ink">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All services
            </Link>
          </aside>
        </div>
      </section>

      {others.length ? (
        <section className="bg-bone py-20" aria-labelledby="other-services">
          <div className="shell">
            <SectionHeading id="other-services" label="Explore" title="Other services" />
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {others.map((o) => (
                <li key={o.slug} data-reveal>
                  <ServiceCard href={routes.service(o.slug)} title={o.title} summary={o.shortDescription} image={o.heroImage} imageClass="h-56" />
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
