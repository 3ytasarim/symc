import type { Metadata } from "next";
import { ServiceCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
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
        title="Services"
        eyebrow="Superyacht Management & Consultancy"
        crumbs={crumbs}
      />
      <section className="bg-bone py-16 md:py-20">
        <ul className="shell grid grid-cols-1 gap-6 sm:grid-cols-2">
          {services.map((svc) => (
            <li key={svc.slug} data-reveal>
              <ServiceCard
                as="h2"
                href={routes.service(svc.slug)}
                title={svc.title}
                summary={svc.shortDescription}
                image={svc.heroImage}
                imageClass="h-80 md:h-96"
                sizes="(min-width: 640px) 620px, 100vw"
              />
            </li>
          ))}
        </ul>
      </section>
      <CtaBand phone={s.phone} />
    </>
  );
}
