import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { Eyebrow } from "@/components/site/Eyebrow";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProjectFeature, ProjectTile } from "@/components/site/ProjectTiles";
import { getImageByKey } from "@/lib/data/media-lookup";
import { getProjectCategories, getPublishedProjects } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { ids, itemListEntity, pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";

export const revalidate = 3600;

const HERO_KEY = "services/refit-services/yachts-in-refit-shed.jpg";
const DESCRIPTION =
  "Completed and ongoing SYMC projects: superyacht new construction supervision and full refits of motor yachts from 35 m to 50 m, including M/Y MMM, Starburst III, Ileria and Duke Town.";

export async function generateMetadata(): Promise<Metadata> {
  const projects = await getPublishedProjects();
  // Share image: the sharpest featured project photograph.
  const lead =
    projects
      .filter((p) => p.featured && p.coverImage)
      .map((p) => p.coverImage!)
      .sort((a, b) => b.width - a.width)[0] ?? null;
  return buildMetadata({ title: "Completed Projects", description: DESCRIPTION, path: routes.projects, image: lead });
}

export default async function ProjectsPage() {
  const [s, projects, categories, fallbackHero] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
    getProjectCategories(),
    getImageByKey(HERO_KEY),
  ]);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Completed Projects", path: routes.projects },
  ];
  const groups = [
    ...categories
      .map((c) => ({ key: c.slug, name: c.name, description: c.description, items: projects.filter((p) => p.category?.slug === c.slug) }))
      .filter((g) => g.items.length),
    ...(projects.some((p) => !p.category)
      ? [{ key: "other", name: "Other projects", description: "", items: projects.filter((p) => !p.category) }]
      : []),
  ];
  const lastModified = projects.reduce<Date | null>((max, x) => (!max || x.updatedAt > max ? x.updatedAt : max), null);
  const jsonLd = await pageGraph(s, {
    path: routes.projects,
    type: "CollectionPage",
    name: "Completed Projects",
    description: DESCRIPTION,
    crumbs,
    dateModified: lastModified,
    entities: [itemListEntity(routes.projects, projects.map((p) => ({ name: p.title, path: routes.project(p.slug) })))],
    mainEntityId: ids.entity(absoluteUrl(routes.projects), "itemlist"),
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title="Completed Projects"
        eyebrow="Track record"
        intro="New construction and refit projects carried out, controlled and managed by SYMC."
        image={fallbackHero}
        crumbs={crumbs}
        meta={groups.map((g) => `${g.items.length} ${g.name}`)}
      />

      {groups.map((g, gi) => {
        const [first, ...rest] = g.items;
        // Full-bleed lead only when the photograph is large enough to stay sharp.
        const leadIsPhoto = (first?.coverImage?.width ?? 0) >= 1200;
        return (
          <section key={g.key} id={g.key} className={`py-20 md:py-28 ${gi % 2 ? "border-t border-line bg-bone" : ""}`} aria-labelledby={`cat-${g.key}`}>
            <div className="shell">
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Eyebrow index={String(gi + 1).padStart(2, "0")}>{`${g.items.length} project${g.items.length === 1 ? "" : "s"}`}</Eyebrow>
                  <h2 id={`cat-${g.key}`} className="display-2 mt-6">{g.name}</h2>
                </div>
                {g.description ? <p className="text-[1.0625rem] leading-[1.75] text-ink/75 md:col-span-6 md:col-start-7 md:pt-14">{g.description}</p> : null}
              </div>
              {first && leadIsPhoto ? (
                <div className="mt-14">
                  <ProjectFeature project={first} className="aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9]" sizes="(min-width: 1440px) 1330px, 100vw" />
                </div>
              ) : null}
              <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {(leadIsPhoto ? rest : g.items).map((p) => (
                  <li key={p.id}>
                    <ProjectTile project={p} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
