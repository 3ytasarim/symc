import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";
import { ArrowRight } from "@/components/site/Icons";
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
        <header className="on-dark bg-deep text-white">
          <div className="shell pb-14 pt-36 md:pb-20 md:pt-44">
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="display-2 mt-12 max-w-[20ch] text-balance">{post.title}</h1>
            <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.16em] text-white/70">
              <time dateTime={post.publishedAt.toISOString()}>{date(post.publishedAt)}</time>
              {post.category ? <span>{post.category.name}</span> : null}
              {post.authorName ? <span>By {post.authorName}</span> : null}
            </p>
          </div>
        </header>
        {post.coverImage ? (
          <div className="shell -mt-px">
            <SiteImage image={post.coverImage} priority sizes="(min-width: 1440px) 1330px, 100vw" className="h-auto w-full" />
          </div>
        ) : null}
        <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-3">
            {post.excerpt ? <p className="font-display text-[1.8rem] leading-[1.25] md:text-[2.2rem]">{post.excerpt}</p> : null}
            <RichText html={post.content} className="mt-10" />
            {post.updatedAt.getTime() - post.publishedAt.getTime() > 86_400_000 ? (
              <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                Updated <time dateTime={post.updatedAt.toISOString()}>{date(post.updatedAt)}</time>
              </p>
            ) : null}
          </div>
        </div>
      </article>

      {post.relatedServices.length ? (
        <nav aria-labelledby="post-services" className="shell pb-16">
          <h2 id="post-services" className="eyebrow text-mute">Related services</h2>
          <ul className="mt-6 border-t border-line">
            {post.relatedServices.map((svc) => (
              <li key={svc.slug} className="border-b border-line">
                <Link href={routes.service(svc.slug)} className="group flex items-center justify-between py-5">
                  <span className="font-display text-[1.8rem] group-hover:text-sea">{svc.title}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {post.relatedProjects.length ? (
        <section className="border-t border-line bg-bone py-20" aria-labelledby="post-projects">
          <div className="shell">
            <h2 id="post-projects" className="display-3">Related projects</h2>
            <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
        <nav aria-labelledby="more-news" className="shell py-20">
          <h2 id="more-news" className="eyebrow text-mute">More news</h2>
          <ul className="mt-6 border-t border-line">
            {more.map((m) => (
              <li key={m.id} className="border-b border-line">
                <Link href={routes.post(m.slug)} className="group grid gap-2 py-6 md:grid-cols-12">
                  <time className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute md:col-span-3" dateTime={m.publishedAt.toISOString()}>
                    {date(m.publishedAt)}
                  </time>
                  <span className="font-display text-[1.6rem] leading-tight group-hover:text-sea md:col-span-9">{m.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
