import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { ArrowRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteImage } from "@/components/site/SiteImage";
import { getPublishedServices } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";
import { itemListEntity, ids, pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";

export const revalidate = 3600;

const DESCRIPTION =
  "SYMC services: superyacht new construction, project management and consultancy, refit services and yacht management — from Tuzla, Istanbul.";

export async function generateMetadata(): Promise<Metadata> {
  const services = await getPublishedServices();
  return buildMetadata({ title: "Services", description: DESCRIPTION, path: routes.services, image: services[0]?.heroImage });
}

export default async function ServicesPage() {
  const [s, services] = await Promise.all([getSiteSettings(), getPublishedServices()]);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Services", path: routes.services },
  ];
  const lastModified = services.reduce<Date | null>((max, x) => (!max || x.updatedAt > max ? x.updatedAt : max), null);
  const jsonLd = await pageGraph(s, {
    path: routes.services,
    type: "CollectionPage",
    name: "Services",
    description: DESCRIPTION,
    crumbs,
    dateModified: lastModified,
    entities: [itemListEntity(routes.services, services.map((x) => ({ name: x.title, path: routes.service(x.slug) })))],
    mainEntityId: ids.entity(absoluteUrl(routes.services), "itemlist"),
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        size="band"
        title="Services"
        eyebrow="Superyacht Management & Consultancy"
        intro="From the first steel of a new build to the day-to-day management of your yacht — one trusted partner."
        crumbs={crumbs}
      />
      <section className="shell py-20 md:py-28">
        <ul className="space-y-24 md:space-y-32">
          {services.map((svc, i) => (
            <li key={svc.slug} className="grid items-center gap-10 md:grid-cols-12" data-reveal>
              <Link
                href={routes.service(svc.slug)}
                className={`group relative block aspect-[4/3] overflow-hidden bg-deep md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                {svc.heroImage ? (
                  <SiteImage image={svc.heroImage} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.03]" />
                ) : null}
              </Link>
              <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                <p className="font-mono text-[12px] text-mute">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="display-3 mt-4">
                  <Link href={routes.service(svc.slug)} className="hover:text-sea">
                    {svc.title}
                  </Link>
                </h2>
                <p className="mt-6 text-[1.0625rem] leading-[1.75] text-ink/75">{svc.shortDescription}</p>
                <Link href={routes.service(svc.slug)} className="btn-ghost mt-8">
                  Explore {svc.title} <ArrowRight />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
