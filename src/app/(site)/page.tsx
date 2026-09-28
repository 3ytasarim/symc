import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { Eyebrow } from "@/components/site/Eyebrow";
import { ArrowRight, ArrowUpRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/site/JsonLd";
import { ProjectFeature } from "@/components/site/ProjectTiles";
import { SiteImage } from "@/components/site/SiteImage";
import { getPublishedPosts } from "@/lib/data/posts";
import { getPublishedProjects } from "@/lib/data/projects";
import { getPublishedServices, getServiceBySlug } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";
import { pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/seo/site";

export const revalidate = 3600;

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
  // Lead feature = featured project with the highest-resolution photograph (it renders full-bleed).
  const featured = projects
    .filter((p) => p.featured && p.coverImage)
    .sort((a, b) => (b.coverImage?.width ?? 0) - (a.coverImage?.width ?? 0));
  const [lead, ...restFeatured] = featured;
  const supporting = restFeatured.slice(0, 2);
  const pm = await getServiceBySlug("project-management-and-consultancy");
  const approachImage = pm?.gallery[0] ?? pm?.heroImage ?? null;
  const ctaImage = services.find((x) => x.slug === "retrofit-refit-services")?.heroImage ?? null;

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

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-deep text-white">
        {s.homeHeroImage ? (
          <>
            <SiteImage image={s.homeHeroImage} fill priority sizes="100vw" quality={80} className="-z-20 object-cover object-[70%_50%]" />
            <div aria-hidden="true" className="scrim-bottom absolute inset-0 -z-10" />
            <div aria-hidden="true" className="scrim-left absolute inset-0 -z-10" />
          </>
        ) : null}
        <div className="shell w-full pt-40">
          <h1>
            <span className="eyebrow flex items-center gap-3 text-white/80">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-signal" />
              SYMC — Superyacht Management &amp; Consultancy
            </span>
            <span className="display-1 mt-7 block max-w-[13ch] text-balance">{s.tagline || "There is someone who cares about your yacht."}</span>
          </h1>
          <p className="lede mt-8 max-w-xl text-white/80">{HERO_INTRO}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={routes.services} className="btn-light-solid">
              Our services <ArrowRight />
            </Link>
            <Link href={routes.projects} className="btn-light">
              Completed projects
            </Link>
          </div>
        </div>
        <nav aria-label="Services" className="shell mt-16 w-full md:mt-24">
          <ul className="grid grid-cols-2 border-t border-white/20 md:grid-cols-4">
            {services.map((svc, i) => (
              <li key={svc.slug} className="border-white/20 md:border-l md:first:border-l-0">
                <Link href={routes.service(svc.slug)} className="group flex h-full flex-col gap-2 py-5 pr-4 md:px-6 md:py-7">
                  <span className="font-mono text-[11px] text-white/55">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[14px] font-medium leading-snug text-white/90 group-hover:text-white md:text-[15px]">
                    {svc.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* ── Introduction ─────────────────────────────────────── */}
      <section className="shell py-24 md:py-36" aria-labelledby="intro-title">
        <div className="grid gap-10 md:grid-cols-12" data-reveal>
          <div className="md:col-span-3">
            <Eyebrow index="01">About SYMC</Eyebrow>
          </div>
          <div className="md:col-span-9">
            <h2 id="intro-title" className="display-3 max-w-[26ch] text-balance md:text-[3.1rem] md:leading-[1.08]">
              Founded in 2020, SYMC is one of the most important superyacht management and consultancy companies in Turkey.
            </h2>
            <div className="mt-10 grid gap-8 text-[1.0625rem] leading-[1.75] text-ink/80 md:grid-cols-2">
              <p>
                SYMC has proved its standing with the projects it has finished and the superyacht portfolio it has managed. With more than
                25 years of experience and expertise as a marine surveyor and project manager, SYMC is your solution partner for all kinds
                of classification rules and owner requirements.
              </p>
              <p>
                For existing yachts and new building activities alike — retrofit, project consultancy, project management, and all kinds of
                progress reports and documentation — SYMC works to the best quality.
              </p>
            </div>
            <Link href={routes.about} className="text-link mt-10 inline-flex items-center gap-2 text-[14px] font-medium">
              More about SYMC <ArrowRight />
            </Link>
          </div>
        </div>
        <dl className="mt-20 grid grid-cols-2 border-t border-line md:mt-28 md:grid-cols-4" data-reveal>
          {[
            { value: s.foundingYear ? String(s.foundingYear) : null, label: "Founded" },
            { value: "25+", label: "Years of surveying & project management experience" },
            { value: String(projects.length), label: "Projects featured" },
            { value: "24/7", label: "Service availability" },
          ]
            .filter((f): f is { value: string; label: string } => Boolean(f.value))
            .map((f) => (
              <div key={f.label} className="flex flex-col gap-3 border-b border-line py-8 pr-6 md:border-b-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0">
                <dt className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-mute">{f.label}</dt>
                <dd className="order-first font-display text-[3.2rem] leading-none md:text-[4rem]">{f.value}</dd>
              </div>
            ))}
        </dl>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section id="services" className="border-t border-line bg-bone py-24 md:py-32" aria-labelledby="services-title">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
            <div>
              <Eyebrow index="02">Expertise</Eyebrow>
              <h2 id="services-title" className="display-2 mt-6">Services</h2>
            </div>
            <Link href={routes.services} className="text-link inline-flex items-center gap-2 text-[14px] font-medium">
              All services <ArrowRight />
            </Link>
          </div>
          <ul className="mt-14 border-t border-ink/15">
            {services.map((svc, i) => (
              <li key={svc.slug} className="border-b border-ink/15" data-reveal>
                <Link href={routes.service(svc.slug)} className="group grid items-center gap-6 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                  <span className="font-mono text-[12px] text-mute md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-[2.1rem] leading-[1.05] transition-colors group-hover:text-sea md:col-span-4 md:text-[2.6rem]">
                    {svc.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-mute md:col-span-4">{svc.shortDescription}</p>
                  <div className="relative hidden aspect-[4/3] overflow-hidden bg-deep md:col-span-2 md:block">
                    {svc.heroImage ? (
                      <SiteImage image={svc.heroImage} fill sizes="(min-width: 1440px) 220px, 15vw" className="object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                    ) : null}
                  </div>
                  <span className="hidden justify-end md:col-span-1 md:flex">
                    <span className="flex h-12 w-12 items-center justify-center border border-ink/20 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                      <ArrowUpRight />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Featured projects ────────────────────────────────── */}
      {lead ? (
        <section className="py-24 md:py-32" aria-labelledby="projects-title">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
              <div>
                <Eyebrow index="03">Selected work</Eyebrow>
                <h2 id="projects-title" className="display-2 mt-6">Featured projects</h2>
              </div>
              <Link href={routes.projects} className="text-link inline-flex items-center gap-2 text-[14px] font-medium">
                All completed projects <ArrowRight />
              </Link>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-12">
              <ProjectFeature project={lead} className="aspect-[4/5] md:col-span-12 md:aspect-[21/9]" sizes="(min-width: 1440px) 1330px, 100vw" />
              {supporting.map((p) => (
                <ProjectFeature key={p.id} project={p} className="aspect-[4/5] md:col-span-6 md:aspect-[5/4]" sizes="(min-width: 768px) 50vw, 100vw" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Approach ─────────────────────────────────────────── */}
      <section className="on-dark bg-deep text-white" aria-labelledby="approach-title">
        <div className="shell grid gap-14 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-6" data-reveal>
            <Eyebrow tone="light" index="04">Approach</Eyebrow>
            <h2 id="approach-title" className="display-2 mt-6 text-balance">
              The trusted partner between you and the shipyard.
            </h2>
            <ol className="mt-14 space-y-10">
              {[
                {
                  t: "Right budget, right quality",
                  d: "SYMC’s team includes project managers and project management office managers with shipyard experience — for the right budget, right quality, right equipment choices and right cash flow.",
                },
                {
                  t: "Close supervision, immediate reporting",
                  d: "We closely supervise conformity to specifications and approved drawings, progress and quality. Any issue that may affect the building schedule is immediately brought to the owner’s attention.",
                },
                {
                  t: "Available 24/7",
                  d: "Professionalism, dedication and passion are the prerequisites for being part of the SYMC family. Whether maintenance, service or refit, we are available 24/7.",
                },
              ].map((item, i) => (
                <li key={item.t} className="grid grid-cols-[3rem_1fr] border-t border-white/15 pt-6">
                  <span className="font-mono text-[12px] text-white/60">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-[1.2rem] font-medium">{item.t}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/70">{item.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {approachImage ? (
            <div className="relative min-h-[420px] md:col-span-5 md:col-start-8" data-reveal>
              <SiteImage image={approachImage} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Track record ─────────────────────────────────────── */}
      <section className="shell py-24 md:py-32" aria-labelledby="record-title">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4" data-reveal>
            <Eyebrow index="05">Experience</Eyebrow>
            <h2 id="record-title" className="display-2 mt-6">Track record</h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-mute">
              New construction and refit projects carried out, controlled and managed by SYMC.
            </p>
          </div>
          <div className="md:col-span-8" data-reveal>
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Projects by SYMC</caption>
              <thead>
                <tr className="border-b border-ink font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                  <th scope="col" className="py-3 font-medium">Project</th>
                  <th scope="col" className="hidden py-3 font-medium sm:table-cell">Type</th>
                  <th scope="col" className="py-3 text-right font-medium">Year</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="group border-b border-line">
                    <td className="py-5 pr-4">
                      <Link href={routes.project(p.slug)} className="font-display text-[1.45rem] leading-tight group-hover:text-sea md:text-[1.7rem]">
                        {p.title}
                      </Link>
                    </td>
                    <td className="hidden py-5 pr-4 text-[14px] text-mute sm:table-cell">{p.category?.name}</td>
                    <td className="py-5 text-right font-mono text-[12px] text-mute">
                      {p.projectYear ?? (p.status === "IN_PROGRESS" ? "Ongoing" : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Latest news (only when articles exist) ───────────── */}
      {posts.length ? (
        <section className="border-t border-line bg-bone py-24 md:py-32" aria-labelledby="news-title">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow index="06">Insights</Eyebrow>
                <h2 id="news-title" className="display-2 mt-6">Latest news</h2>
              </div>
              <Link href={routes.news} className="text-link inline-flex items-center gap-2 text-[14px] font-medium">
                All news <ArrowRight />
              </Link>
            </div>
            <ul className="mt-14 grid gap-10 md:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={routes.post(post.slug)} className="group block">
                    <div className="relative aspect-[3/2] overflow-hidden bg-deep">
                      {post.coverImage ? (
                        <SiteImage image={post.coverImage} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : null}
                    </div>
                    <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                      <time dateTime={post.publishedAt.toISOString()}>
                        {post.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </time>
                    </p>
                    <h3 className="mt-2 font-display text-[1.7rem] leading-tight group-hover:text-sea">{post.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand image={ctaImage} phone={s.phone} email={s.email} />
    </>
  );
}
