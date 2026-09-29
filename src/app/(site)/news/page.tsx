import type { Metadata } from "next";
import Link from "next/link";
import { NewsCard } from "@/components/site/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
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

export default async function NewsPage() {
  const [s, posts] = await Promise.all([getSiteSettings(), getPublishedPosts()]);
  const crumbs = [
    { name: "Home", path: routes.home },
    { name: "News", path: routes.news },
  ];
  const ordered = [...posts.filter((p) => p.featured), ...posts.filter((p) => !p.featured)];
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
      <PageHero title="News" eyebrow="Insights" intro="Updates from SYMC." crumbs={crumbs} />
      <section className="bg-bone py-16">
        <div className="shell">
          {!ordered.length ? (
            <div className="mx-auto max-w-xl rounded-lg border border-neutral-100 bg-white p-10 text-center shadow-sm">
              <p className="mb-3 text-xl font-black text-neutral-900">No articles have been published yet.</p>
              <p className="text-neutral-600">
                In the meantime, explore our <Link href={routes.projects} className="text-link">completed projects</Link> or our{" "}
                <Link href={routes.services} className="text-link">services</Link>.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ordered.map((post) => (
                <li key={post.id}>
                  <NewsCard
                    as="h2"
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
          )}
        </div>
      </section>
      <CtaBand phone={s.phone} />
    </>
  );
}
