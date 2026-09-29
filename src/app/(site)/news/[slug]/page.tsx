import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { ArrowLeft, ArrowRight, Calendar, User } from "lucide-react";
import { NewsCard } from "@/components/site/Cards";
import { SectionHeading } from "@/components/site/Eyebrow";
import { VELARIS_COLORS } from "@/components/site/palette";
import { Velaris } from "@/components/site/Velaris";
import { JsonLd } from "@/components/site/JsonLd";
import { ProjectTile } from "@/components/site/ProjectTiles";
import { RichText } from "@/components/site/RichText";
import { SiteImage } from "@/components/site/SiteImage";
import { findRedirect } from "@/lib/data/redirects";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/posts";
import { getSiteSettings } from "@/lib/data/settings";
import { SLUG_PATTERN } from "@/lib/content/slug";
import { htmlToText } from "@/lib/content/sanitize";
import { blogPostingEntity, ids, pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  if (!SLUG_PATTERN.test(slug)) return null;
  return getPostBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || htmlToText(post.content),
    path: routes.post(post.slug),
    image: post.ogImage ?? post.coverImage,
    type: "article",
    index: post.robotsIndex,
    canonicalOverride: post.canonicalUrl,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.authorName ? [post.authorName] : undefined,
    section: post.category?.name,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) {
    const r = await findRedirect(routes.post(slug));
    if (r) (r.statusCode === 302 ? redirect : permanentRedirect)(r.toPath);
    notFound();
  }
  const [s, latest] = await Promise.all([getSiteSettings(), getPublishedPosts(4)]);
  const more = latest.filter((x) => x.id !== post.id).slice(0, 3);
  const path = routes.post(post.slug);
  const url = absoluteUrl(path);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "News", path: routes.news },
    { name: post.title, path },
  ];
  const description = post.seoDescription || post.excerpt || htmlToText(post.content);
  const jsonLd = await pageGraph(s, {
    path,
    name: post.title,
    description,
    crumbs,
    primaryImage: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityId: ids.entity(url, "article"),
    entities: [
      blogPostingEntity({
        path,
        headline: post.title,
        description,
        primaryImage: post.coverImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        authorName: post.authorName,
        section: post.category?.name,
      }),
    ],
  });
  const date = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <JsonLd data={jsonLd} />
      <article>
        <header className="on-dark text-white">
          <Velaris colors={VELARIS_COLORS}>
            <div aria-hidden="true" className="absolute inset-0 -z-[5] bg-black/35" />
            <div className="shell relative py-16 md:py-20">
              <Breadcrumbs crumbs={crumbs} />
              <Link href={routes.news} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-gold">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All news
              </Link>
              <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight md:text-5xl">{post.title}</h1>
              <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-300">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar aria-hidden="true" className="h-4 w-4 text-gold" />
                  <time dateTime={post.publishedAt.toISOString()}>{date(post.publishedAt)}</time>
                </span>
                {post.category ? <span className="rounded-md bg-gold px-2 py-0.5 text-xs font-bold text-ink">{post.category.name}</span> : null}
                {post.authorName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <User aria-hidden="true" className="h-4 w-4 text-gold" /> {post.authorName}
                  </span>
                ) : null}
              </p>
            </div>
          </Velaris>
        </header>
        <div className="shell max-w-4xl py-16">
          {post.coverImage ? (
            <SiteImage image={post.coverImage} priority sizes="(min-width: 1024px) 900px, 100vw" className="mb-10 h-auto w-full rounded-lg shadow-lg" />
          ) : null}
          {post.excerpt ? <p className="mb-8 text-xl font-semibold leading-relaxed text-neutral-800">{post.excerpt}</p> : null}
          <RichText html={post.content} />
          {post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000 ? (
            <p className="mt-10 text-xs text-neutral-500">
              Updated <time dateTime={post.updatedAt.toISOString()}>{date(post.updatedAt)}</time>
            </p>
          ) : null}
          {post.relatedServices.length ? (
            <nav aria-labelledby="post-services" className="mt-12 rounded-lg border border-neutral-100 bg-bone p-6">
              <h2 id="post-services" className="mb-4 text-lg font-black text-neutral-900">Related services</h2>
              <ul className="space-y-2">
                {post.relatedServices.map((svc) => (
                  <li key={svc.slug}>
                    <Link href={routes.service(svc.slug)} className="group inline-flex items-center gap-2 font-semibold text-neutral-800 hover:text-gold-ink">
                      {svc.title}
                      <ArrowRight aria-hidden="true" className="h-4 w-4 text-gold-ink transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </article>

      {post.relatedProjects.length ? (
        <section className="bg-bone py-20" aria-labelledby="post-projects">
          <div className="shell">
            <SectionHeading id="post-projects" label="Our projects" title="Related projects" />
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.relatedProjects.map((p) => (
                <li key={p.id}>
                  <ProjectTile project={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {more.length ? (
        <section className="bg-white py-20" aria-labelledby="more-news">
          <div className="shell">
            <SectionHeading id="more-news" label="News" title="More news" />
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {more.map((m) => (
                <li key={m.id}>
                  <NewsCard href={routes.post(m.slug)} title={m.title} excerpt={m.excerpt} image={m.coverImage} date={m.publishedAt} category={m.category?.name} />
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
