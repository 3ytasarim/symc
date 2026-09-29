import type { Metadata } from "next";
import { Anchor, Award, Calendar, ClipboardCheck, Clock, Coins, Headset } from "lucide-react";
import { AboutShowcase, type Feature } from "@/components/site/AboutShowcase";
import { NewsCard, ViewAll } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { SectionHeading } from "@/components/site/Eyebrow";
import { HeroSlider, type Slide } from "@/components/site/HeroSlider";
import { JsonLd } from "@/components/site/JsonLd";
import { ProjectTile } from "@/components/site/ProjectTiles";
import { ServicesBento, type BentoTile } from "@/components/site/ServicesBento";
import { getImageByKey } from "@/lib/data/media-lookup";
import { getPublishedPosts } from "@/lib/data/posts";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublishedServices, getServiceBySlug } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";
import { pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/seo/site";

export const revalidate = 3600;

// Client-supplied photographs for the services bento (media library keys).
const BENTO_IMAGE_KEYS = {
  "project-management-and-consultancy": "home/services/project-management-superyacht-moored-at-quay.jpg",
  "retrofit-refit-services": "home/services/refit-motor-yacht-underway-at-sea.jpg",
  "yacht-management-service": "home/services/yacht-management-superyacht-at-sunset.jpg",
  contact: "home/services/work-with-us-superyacht-in-travel-lift.jpg",
} as const;

const HERO_INTRO =
  "Superyacht management and consultancy from Tuzla, Istanbul — new construction, project management, refit and yacht management, backed by more than 25 years of experience as a marine surveyor and project manager.";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return buildMetadata({
    title: s.defaultSeoTitle || "SYMC YACHT – Superyacht Management & Consultancy",
    absoluteTitle: true,
    description: s.defaultSeoDescription || s.description,
    path: routes.home,
    image: s.homeHeroImage,
  });
}

export default async function HomePage() {
  const [s, services, projects, posts] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
    getPublishedProjects(),
    getPublishedPosts(3),
  ]);
  const [pm, bentoImages] = await Promise.all([
    getServiceBySlug("project-management-and-consultancy"),
    Promise.all(Object.values(BENTO_IMAGE_KEYS).map(getImageByKey)),
  ]);
  const bentoImage = Object.fromEntries(Object.keys(BENTO_IMAGE_KEYS).map((k, i) => [k, bentoImages[i] ?? null]));
  const aboutImage = pm?.gallery[0] ?? pm?.heroImage ?? null;
  // Featured projects with photography first, then the rest.
  const homeProjects = [
    ...projects.filter((p) => p.featured && p.coverImage),
    ...projects.filter((p) => !(p.featured && p.coverImage)),
  ].slice(0, 3);

  // Bento: the four services (client-supplied photographs, falling back to each
  // service's hero image) followed by the "work with us" call to action.
  const bentoTiles: BentoTile[] = [
    ...services.map((svc, i) => ({
      href: routes.service(svc.slug),
      label: `Service ${String(i + 1).padStart(2, "0")}`,
      title: svc.title,
      text: svc.shortDescription,
      image: bentoImage[svc.slug] ?? svc.heroImage,
    })),
    {
      href: routes.contact,
      label: "Contact",
      title: "Do you want to work with us?",
      text: "With more than 25 years of experience and expertise as a marine surveyor and project manager, SYMC can be your solution partner.",
      image: bentoImage.contact ?? null,
      cta: "Contact SYMC",
    },
  ];

  const slides: Slide[] = [
    {
      title: s.tagline || "There is someone who cares about your yacht.",
      subtitle: HERO_INTRO,
      image: s.homeHeroImage,
      href: routes.services,
      cta: "Our services",
    },
    ...services
      .filter((svc) => svc.heroImage)
      .map((svc) => ({ title: svc.title, subtitle: svc.shortDescription, image: svc.heroImage, href: routes.service(svc.slug), cta: "Discover" })),
  ];

  const stats = [
    s.foundingYear ? { Icon: Calendar, value: String(s.foundingYear), label: "Founded" } : null,
    { Icon: Award, value: "25+", label: "Years of experience" },
    { Icon: Anchor, value: String(projects.length), label: "Projects featured" },
    { Icon: Clock, value: "24/7", label: "Service availability" },
  ].filter((x): x is { Icon: typeof Calendar; value: string; label: string } => x !== null);

  // The four feature blocks of the original symc.com.tr homepage (verbatim).
  const features: Feature[] = [
    { title: "New Build Management", text: "SYMC will be the trusted partner and representative between you and the shipyard.", href: routes.service("new-construction") },
    {
      title: "Project Management and Consultancy",
      text: "SYMC’s team includes project managers and project management office managers with shipyard experience.",
      href: routes.service("project-management-and-consultancy"),
    },
    { title: "Refit Services", text: "All you had to do is to plan your next vacation with your renewed boat.", href: routes.service("retrofit-refit-services") },
    {
      title: "Yacht Management",
      text: "Being an Owner of the yacht is completely different from managing it.",
      href: routes.service("yacht-management-service"),
    },
  ].filter((f) => services.some((svc) => f.href === routes.service(svc.slug)));

  const approach = [
    {
      Icon: Coins,
      t: "Right budget, right quality",
      d: "SYMC’s team includes project managers and project management office managers with shipyard experience — for the right budget, right quality, right equipment choices and right cash flow.",
    },
    {
      Icon: ClipboardCheck,
      t: "Close supervision, immediate reporting",
      d: "We closely supervise conformity to specifications and approved drawings, progress and quality. Any issue that may affect the building schedule is immediately brought to the owner’s attention.",
    },
    {
      Icon: Headset,
      t: "Available 24/7",
      d: "Professionalism, dedication and passion are the prerequisites for being part of the SYMC family. Whether maintenance, service or refit, we are available 24/7.",
    },
  ];

  const jsonLd = await pageGraph(s, {
    path: routes.home,
    name: s.defaultSeoTitle || "SYMC YACHT – Superyacht Management & Consultancy",
    description: s.defaultSeoDescription || s.description,
    aboutOrganization: true,
    primaryImage: s.homeHeroImage,
    dateModified: s.updatedAt,
  });

  return (
    <>
      <JsonLd data={jsonLd} />

      <HeroSlider slides={slides} heading="SYMC — Superyacht Management & Consultancy" />

      {/* ── About (with stats, Greek Harmony pattern) ────────── */}
      <AboutShowcase
        id="about-title"
        label="About SYMC"
        title="One of the most important superyacht management and consultancy companies in Turkey."
        intro="Founded in 2020, SYMC has proved its standing with the projects it has finished and the superyacht portfolio it has managed. With more than 25 years of experience and expertise as a marine surveyor and project manager, SYMC is your solution partner for all kinds of classification rules, owner requirements, retrofit, project consultancy, project management and all kinds of progress reports and documentation."
        image={aboutImage}
        features={features}
        stats={stats}
        cta={{ href: routes.about, label: "Learn more about SYMC" }}
      />

      {/* ── Services ─────────────────────────────────────────── */}
      <section id="services" className="bg-bone py-20" aria-labelledby="services-title">
        <div className="shell">
          <SectionHeading
            id="services-title"
            label="Our services"
            title="What we do"
          />
          <ServicesBento tiles={bentoTiles} />
          <ViewAll href={routes.services}>View all services</ViewAll>
        </div>
      </section>

      {/* ── Projects ─────────────────────────────────────────── */}
      {homeProjects.length ? (
        <section className="bg-white py-20" aria-labelledby="projects-title">
          <div className="shell">
            <SectionHeading
              id="projects-title"
              label="Our projects"
              title="Completed projects"
              subtitle="New construction and refit projects carried out, controlled and managed by SYMC."
            />
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {homeProjects.map((p) => (
                <li key={p.id} data-reveal>
                  <ProjectTile project={p} />
                </li>
              ))}
            </ul>
            <ViewAll href={routes.projects}>View all projects</ViewAll>
          </div>
        </section>
      ) : null}

      {/* ── Approach ─────────────────────────────────────────── */}
      <section className="bg-bone py-20" aria-labelledby="approach-title">
        <div className="shell">
          <SectionHeading id="approach-title" label="Why SYMC" title="The trusted partner between you and the shipyard" />
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {approach.map(({ Icon, t, d }) => (
              <li key={t} className="rounded-lg border border-neutral-100 bg-white p-8 shadow-sm" data-reveal>
                <div aria-hidden="true" className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-6 w-6 text-gold-ink" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-neutral-900">{t}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Latest news (only when articles exist) ───────────── */}
      {posts.length ? (
        <section className="bg-white py-20" aria-labelledby="news-title">
          <div className="shell">
            <SectionHeading id="news-title" label="News" title="Latest news" subtitle="Updates and insights from SYMC." />
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <NewsCard
                    href={routes.post(post.slug)}
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.coverImage}
                    date={post.publishedAt}
                    category={post.category?.name}
                  />
                </li>
              ))}
            </ul>
            <ViewAll href={routes.news}>View all news</ViewAll>
          </div>
        </section>
      ) : null}

      <CtaBand phone={s.phone} />
    </>
  );
}
