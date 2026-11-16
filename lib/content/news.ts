/**
 * News content access. Pages and components read news only through these
 * functions. Articles come from the database (managed in the admin panel),
 * falling back to lib/defaults/news.ts when there is no database, it was
 * never seeded, or it cannot be reached. The admin's save actions call
 * updateTag(NEWS_TAG) so every page showing news refreshes.
 */
import "server-only";
import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, schema } from "../db";
import { defaultNews } from "../defaults/news";
import { isSeeded } from "./site-content";
import type { NewsArticle, NewsCategory } from "./types";

export const NEWS_TAG = "news";

/** All published articles, newest first. */
export async function getNewsArticles(): Promise<NewsArticle[]> {
  "use cache";
  cacheTag(NEWS_TAG);
  const db = getDb();
  const sortNewest = (list: NewsArticle[]) =>
    [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (!db) {
    cacheLife("max");
    return sortNewest(defaultNews);
  }
  try {
    const rows = await db
      .select()
      .from(schema.newsArticles)
      .orderBy(desc(schema.newsArticles.publishedAt), desc(schema.newsArticles.id));
    if (!rows.length && !(await isSeeded())) {
      cacheLife("max");
      return sortNewest(defaultNews);
    }
    cacheLife("max");
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      category: r.category as NewsCategory,
      publishedAt: r.publishedAt,
      body: r.body,
      image: { src: r.imageUrl, alt: r.imageAlt, width: r.imageWidth, height: r.imageHeight },
    }));
  } catch (error) {
    console.error("[content] could not read news from the database; serving defaults", error);
    cacheLife("minutes");
    return sortNewest(defaultNews);
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | undefined> {
  const articles = await getNewsArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getLatestNews(count = 3): Promise<NewsArticle[]> {
  return (await getNewsArticles()).slice(0, count);
}

export const newsHref = (article: Pick<NewsArticle, "slug">) => `/news/${article.slug}`;

/** Rough reading time at 200 words per minute, at least one minute. */
export function readingMinutes(article: NewsArticle): number {
  const words = article.body.reduce((n, block) => n + block.text.split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 200));
}
