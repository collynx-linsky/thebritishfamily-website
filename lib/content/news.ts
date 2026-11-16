/**
 * News content access. Pages and components read news only through these
 * functions, never from the defaults directly.
 *
 * Today the data comes from lib/defaults/news.ts. When the admin panel is
 * built, replace the body of `loadNews()` with a database query (falling
 * back to the defaults on error) and call `updateTag(NEWS_TAG)` from the
 * admin's save action: every page that shows news is then refreshed on the
 * next visit, while staying statically cached the rest of the time.
 */
import { cacheLife, cacheTag } from "next/cache";
import { defaultNews } from "../defaults/news";
import type { NewsArticle } from "./types";

export const NEWS_TAG = "news";

async function loadNews(): Promise<NewsArticle[]> {
  return defaultNews;
}

/** All published articles, newest first. */
export async function getNewsArticles(): Promise<NewsArticle[]> {
  "use cache";
  cacheTag(NEWS_TAG);
  cacheLife("max");
  const articles = await loadNews();
  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
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
