import type { Metadata } from "next";
import { Ship, Wrench } from "lucide-react";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ProjectTabs } from "@/components/site/ProjectTabs";
import { ProjectShowcaseCard } from "@/components/site/ProjectTiles";
import { getProjectCategories, getPublishedProjects } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { ids, itemListEntity, pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";

export const revalidate = 3600;

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
  const [s, projects, categories] = await Promise.all([getSiteSettings(), getPublishedProjects(), getProjectCategories()]);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "Completed Projects", path: routes.projects },
  ];
  const tabs = [
    ...categories.map((c) => ({ key: c.slug, label: c.name, count: projects.filter((p) => p.category?.slug === c.slug).length })).filter((t) => t.count),
    ...(projects.some((p) => !p.category) ? [{ key: "other", label: "Other", count: projects.filter((p) => !p.category).length }] : []),
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
  const categoryIcon = (slug: string) => (/new|construction|build/.test(slug) ? Ship : Wrench);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title="Completed Projects"
        eyebrow="Track record"
        intro="New construction and refit projects carried out, controlled and managed by SYMC."
        crumbs={crumbs}
        badges={tabs.map((t) => ({ label: `${t.count} ${t.label}` }))}
      />

      <section id="projects" className="scroll-mt-24 bg-white py-16 md:py-24" aria-labelledby="projects-title">
        <div className="shell">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="eyebrow text-gold-ink">Our projects</p>
            <h2 id="projects-title" className="display-2 mt-3 text-neutral-900">
              {projects.length} projects
            </h2>
            <div aria-hidden="true" className="section-divider mx-auto mt-6 w-24" />
          </div>
          <ProjectTabs
            tabs={tabs}
            items={projects.map((p) => ({ id: p.id, cat: p.category?.slug ?? "other", node: <ProjectShowcaseCard project={p} /> }))}
          />
        </div>
      </section>

      {categories.some((c) => c.description) ? (
        <section className="bg-bone py-16 md:py-20" aria-label="Project types">
          <ul className="shell grid grid-cols-1 gap-6 md:grid-cols-2">
            {categories
              .filter((c) => c.description)
              .map((c) => {
                const Icon = categoryIcon(c.slug);
                return (
                  <li key={c.slug} className="rounded-[1.75rem] border border-neutral-200 bg-white p-8 shadow-sm md:p-10" data-reveal>
                    <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-ink">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 text-xl font-black text-neutral-900">{c.name}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">{c.description}</p>
                  </li>
                );
              })}
          </ul>
        </section>
      ) : null}

      <CtaBand phone={s.phone} />
    </>
  );
}
