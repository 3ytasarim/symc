import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { Eyebrow } from "@/components/site/Eyebrow";
import { ArrowRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProjectTile } from "@/components/site/ProjectTiles";
import { getImageByKey } from "@/lib/data/media-lookup";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublishedServices } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";
import { pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/seo/site";

export const revalidate = 3600;

const HERO_KEY = "projects/my-duke-town-36-5m/my-duke-town-36-5m-hull-paint-refit-shed.jpg";
const TITLE = "About SYMC";
const DESCRIPTION =
  "Founded in 2020, SYMC is a Superyacht Management and Consultancy company in Tuzla, Istanbul, with more than 25 years of experience as a marine surveyor and project manager.";
// Original WordPress "About" page modification date.
const ABOUT_UPDATED = new Date("2022-08-18T22:16:53+03:00");

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ title: "About", description: DESCRIPTION, path: routes.about, image: await getImageByKey(HERO_KEY) });
}

export default async function AboutPage() {
  const [s, hero, services, projects] = await Promise.all([
    getSiteSettings(),
    getImageByKey(HERO_KEY),
    getPublishedServices(),
    getPublishedProjects(),
  ]);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "About", path: routes.about },
  ];
  const selected = projects.filter((p) => p.featured && p.coverImage).slice(0, 3);
  const jsonLd = await pageGraph(s, {
    path: routes.about,
    type: "AboutPage",
    name: TITLE,
    description: DESCRIPTION,
    crumbs,
    primaryImage: hero,
    aboutOrganization: true,
    dateModified: ABOUT_UPDATED,
    mainEntityId: undefined,
  });

  const capabilities = [
    {
      slug: "project-management-and-consultancy",
      title: "New Build Management",
      text: "SYMC will be the trusted partner and representative between you and the shipyard.",
    },
    {
      slug: "retrofit-refit-services",
      title: "Refit Services",
      text: "All you have to do is plan your next vacation with your renewed boat.",
    },
    {
      slug: "project-management-and-consultancy",
      title: "Project Management and Consultancy",
      text: "SYMC’s team includes project managers and project management office managers with shipyard experience.",
    },
    {
      slug: "yacht-management-service",
      title: "Yacht Management",
      text: "Being an owner of a yacht is completely different from managing it — your yacht needs special care from professionals.",
    },
  ].filter((c) => services.some((svc) => svc.slug === c.slug));

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={TITLE}
        eyebrow="Superyacht Management & Consultancy"
        intro="There is someone who cares about your yacht."
        image={hero}
        crumbs={crumbs}
      />

      <section className="shell py-24 md:py-36">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Eyebrow index="01">Who we are</Eyebrow>
          </div>
          <div className="md:col-span-8">
            <h2 className="display-3 text-balance md:text-[3rem] md:leading-[1.08]">
              SYMC was founded in 2020. Since then, SYMC has proved to be one of the most important superyacht management and consultancy
              companies in Turkey — with the projects it has finished and the superyacht portfolio it has managed.
            </h2>
            <p className="lede mt-10 max-w-3xl text-ink/80">
              With the experience and expertise of more than 25 years as a marine surveyor and project manager, SYMC can be your solution
              partner regarding all kinds of classification rules, owner requirements and the best quality of your existing yacht or new
              building activities, retrofit activities, project consultancy, project management activities and all kinds of progress reports
              and documentation.
            </p>
          </div>
        </div>
      </section>

      <section className="on-dark bg-deep text-white" aria-labelledby="care-title">
        <div className="shell py-24 md:py-32">
          <Eyebrow tone="light" index="02">What we do</Eyebrow>
          <h2 id="care-title" className="display-2 mt-6 max-w-[18ch] text-balance">
            There is someone who cares about your yacht.
          </h2>
          <ul className="mt-16 grid border-t border-white/15 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((c, i) => (
              <li key={c.title} className="border-b border-white/15 md:border-r xl:border-b-0 xl:last:border-r-0 md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r">
                <Link href={routes.service(c.slug)} className="group flex h-full flex-col p-8 pl-0 md:pl-8 md:first:pl-0">
                  <span className="font-mono text-[11px] text-white/60">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 font-display text-[1.9rem] leading-tight">{c.title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/70">{c.text}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[13px] font-medium text-white/85 group-hover:text-white">
                    Read more <ArrowRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {selected.length ? (
        <section className="shell py-24 md:py-32" aria-labelledby="about-projects">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow index="03">Selected work</Eyebrow>
              <h2 id="about-projects" className="display-2 mt-6">Projects</h2>
            </div>
            <Link href={routes.projects} className="text-link inline-flex items-center gap-2 text-[14px] font-medium">
              All completed projects <ArrowRight />
            </Link>
          </div>
          <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {selected.map((p) => (
              <li key={p.id}>
                <ProjectTile project={p} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
