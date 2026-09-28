import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { toSiteImage, type SiteImage } from "./media";
import { projectCardInclude, toProjectCard, type ProjectCard } from "./projects";

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: SiteImage | null;
  category: { name: string; slug: string } | null;
  authorName: string | null;
  publishedAt: Date;
  updatedAt: Date;
  featured: boolean;
};

export type PostDetail = PostCard & {
  content: string;
  ogImage: SiteImage | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedProjects: ProjectCard[];
  relatedServices: { title: string; slug: string; shortDescription: string }[];
};

/** Published = status PUBLISHED and a publication date that is not in the future. */
function publishedWhere(): Prisma.BlogPostWhereInput {
  return { publishStatus: "PUBLISHED", publishedAt: { lte: new Date() } };
}

const cardInclude = { coverImage: true, category: true } satisfies Prisma.BlogPostInclude;
type CardRow = Prisma.BlogPostGetPayload<{ include: typeof cardInclude }>;

function toPostCard(p: CardRow): PostCard {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: toSiteImage(p.coverImage, p.title),
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    authorName: p.authorName,
    publishedAt: p.publishedAt ?? p.createdAt,
    updatedAt: p.updatedAt,
    featured: p.featured,
  };
}

export const getPublishedPosts = cache(async (limit?: number): Promise<PostCard[]> => {
  const rows = await prisma.blogPost.findMany({
    where: publishedWhere(),
    orderBy: [{ publishedAt: "desc" }],
    include: cardInclude,
    ...(limit ? { take: limit } : {}),
  });
  return rows.map(toPostCard);
});

export const getPostBySlug = cache(async (slug: string): Promise<PostDetail | null> => {
  const p = await prisma.blogPost.findFirst({
    where: { slug, ...publishedWhere() },
    include: {
      ...cardInclude,
      ogImage: true,
      relatedProjects: { where: { publishStatus: "PUBLISHED" }, include: projectCardInclude },
      relatedServices: { where: { publishStatus: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!p) return null;
  return {
    ...toPostCard(p),
    content: p.content,
    ogImage: toSiteImage(p.ogImage, p.title),
    canonicalUrl: p.canonicalUrl,
    robotsIndex: p.robotsIndex,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    relatedProjects: p.relatedProjects.map(toProjectCard),
    relatedServices: p.relatedServices.map((s) => ({ title: s.title, slug: s.slug, shortDescription: s.shortDescription })),
  };
});
