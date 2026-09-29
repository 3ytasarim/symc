import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { EditorialHero } from "@/components/site/EditorialHero";
import { FeatureCards, type FeatureCard } from "@/components/site/FeatureCards";
import { JsonLd } from "@/components/site/JsonLd";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { getImageByKey } from "@/lib/data/media-lookup";
import { getPublishedServices } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";
import { resolveLogo } from "@/lib/seo/images";
import { pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/seo/site";

export const revalidate = 3600;

// Social-share image only (the page itself shows the logo instead of a photograph).
const SHARE_IMAGE_KEY = "projects/my-duke-town-36-5m/my-duke-town-36-5m-hull-paint-refit-shed.jpg";
const TITLE = "About SYMC";
const DESCRIPTION =
  "Founded in 2020, SYMC is a Superyacht Management and Consultancy company in Tuzla, Istanbul, with more than 25 years of experience as a marine surveyor and project manager.";
// Original WordPress "About" page modification date.
const ABOUT_UPDATED = new Date("2022-08-18T22:16:53+03:00");

/* Copy: verbatim from https://www.symc.com.tr/about/ */
const INTRO =
  "SYMC has been founded in 2020. Since 2020 SYMC proved that they are one of the most important Superyacht Management and Consultancy Company in Turkey with the projects that they had finished and the superyacht portfolio that they have managed.";
const EXPERTISE =
  "With experience and the expertise that SYMC has more than 25 years as a marine surveyor and project manager, SYMC can be your solution partner regarding all kind’s classification rules, owner requirements, and the best quality of your existing yachts or new building activities, retrofit activities, project consultancy, project management activities and all kind of progress reports and documentation.";
// The scope listed in the paragraph above, one step per item.
const EXPERTISE_STEPS = [
  { title: "Classification rules and owner requirements" },
  { title: "Existing yachts and new building activities" },
  { title: "Retrofit activities, project consultancy and project management" },
  { title: "Progress reports and documentation" },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: "About", description: DESCRIPTION, path: routes.about, image: await getImageByKey(SHARE_IMAGE_KEY) });
}

export default async function AboutPage() {
  const [s, services] = await Promise.all([getSiteSettings(), getPublishedServices()]);
  const logo = await resolveLogo(s);
  const has = (slug: string) => services.some((svc) => svc.slug === slug);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "About", path: routes.about },
  ];
  const jsonLd = await pageGraph(s, {
    path: routes.about,
    type: "AboutPage",
    name: TITLE,
    description: DESCRIPTION,
    crumbs,
    primaryImage: logo,
    aboutOrganization: true,
    dateModified: ABOUT_UPDATED,
    mainEntityId: undefined,
  });

  const cards: FeatureCard[] = [
    {
      art: "partner",
      title: "New Build Management",
      text: "SYMC will be the trusted partner and representative between you and the shipyard.",
      href: has("new-construction") ? routes.service("new-construction") : undefined,
    },
    {
      art: "refit",
      title: "Refit Services",
      text: "All you had to do is to plan your next vacation with your renewed boat.",
      href: has("retrofit-refit-services") ? routes.service("retrofit-refit-services") : undefined,
    },
    {
      art: "team",
      title: "Project Management and Consultancy",
      text: "SYMC’s team includes project managers and project management office managers with shipyard experience.",
      href: has("project-management-and-consultancy") ? routes.service("project-management-and-consultancy") : undefined,
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <EditorialHero
        eyebrow="About SYMC"
        title="There is someone who"
        titleLine2="cares about your yacht."
        description={INTRO}
        crumbs={crumbs}
        primaryCta={{ href: routes.contact, label: "Contact" }}
        secondaryCta={{ href: routes.projects, label: "Completed Projects" }}
      />

      <ProcessTimeline
        id="expertise-title"
        eyebrow="More than 25 years"
        title="Your solution partner"
        description={EXPERTISE}
        steps={EXPERTISE_STEPS}
      />

      <section className="bg-bone py-20 md:py-28" aria-labelledby="care-title">
        <div className="shell">
          <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
            <p className="eyebrow text-gold-ink">What we do</p>
            <h2 id="care-title" className="display-2 mt-4 text-balance text-neutral-900">
              There is someone who cares about your yacht.
            </h2>
            <div aria-hidden="true" className="section-divider mx-auto mt-6 w-24" />
          </div>
          <FeatureCards cards={cards} />
        </div>
      </section>

      <CtaBand phone={s.phone} />
    </>
  );
}
