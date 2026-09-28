import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SiteImage } from "@/components/site/SiteImage";
import { getPublishedPosts } from "@/lib/data/posts";
import { getSiteSettings } from "@/lib/data/settings";
import { ids, itemListEntity, pageGraph } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, routes } from "@/lib/seo/site";

export const revalidate = 3600;

const DESCRIPTION = "News and insights from SYMC — superyacht management, new construction, refit and project management.";

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedPosts();
  return buildMetadata({
    title: "News",
    description: DESCRIPTION,
    path: routes.news,
    image: posts[0]?.coverImage,
    // An empty listing is thin content: keep it out of the index until articles exist.
    index: posts.length > 0,
  });
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function NewsPage() {
  const [s, posts] = await Promise.all([getSiteSettings(), getPublishedPosts()]);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "News", path: routes.news },
  ];
  const [lead, ...rest] = [...posts.filter((p) => p.featured), ...posts.filter((p) => !p.featured)];
  const jsonLd = await pageGraph(s, {
    path: routes.news,
    type: "CollectionPage",
    name: "News",
    description: DESCRIPTION,
    crumbs,
    dateModified: posts[0]?.updatedAt,
    entities: posts.length ? [itemListEntity(routes.news, posts.map((p) => ({ name: p.title, path: routes.post(p.slug) })))] : [],
    mainEntityId: posts.length ? ids.entity(absoluteUrl(routes.news), "itemlist") : undefined,
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero size="band" title="News" eyebrow="Insights" intro="Updates from SYMC." crumbs={crumbs} />
      <section className="shell py-20 md:py-28">
        {!lead ? (
          <div className="max-w-xl border-t border-line pt-10">
            <p className="font-display text-[2rem] leading-tight">No articles have been published yet.</p>
            <p className="mt-4 text-mute">
              In the meantime, explore our <Link href={routes.projects} className="text-link text-ink">completed projects</Link> or our{" "}
              <Link href={routes.services} className="text-link text-ink">services</Link>.
            </p>
          </div>
        ) : (
          <>
            <article className="grid items-end gap-10 md:grid-cols-12">
              <Link href={routes.post(lead.slug)} className="group relative block aspect-[16/10] overflow-hidden bg-deep md:col-span-8" tabIndex={-1} aria-hidden="true">
                {lead.coverImage ? <SiteImage image={lead.coverImage} fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" /> : null}
              </Link>
              <div className="md:col-span-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                  {lead.category?.name ? `${lead.category.name} · ` : ""}
                  <time dateTime={lead.publishedAt.toISOString()}>{formatDate(lead.publishedAt)}</time>
                </p>
                <h2 className="display-3 mt-4">
                  <Link href={routes.post(lead.slug)} className="hover:text-sea">{lead.title}</Link>
                </h2>
                {lead.excerpt ? <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink/75">{lead.excerpt}</p> : null}
              </div>
            </article>
            {rest.length ? (
              <ul className="mt-24 grid gap-x-6 gap-y-16 border-t border-line pt-16 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <li key={post.id}>
                    <article>
                      <Link href={routes.post(post.slug)} className="group block">
                        <div className="relative aspect-[3/2] overflow-hidden bg-deep">
                          {post.coverImage ? <SiteImage image={post.coverImage} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                        </div>
                        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                        </p>
                        <h2 className="mt-2 font-display text-[1.7rem] leading-tight group-hover:text-sea">{post.title}</h2>
                        {post.excerpt ? <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-mute">{post.excerpt}</p> : null}
                      </Link>
                    </article>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </section>
      <CtaBand phone={s.phone} email={s.email} />
    </>
  );
}
