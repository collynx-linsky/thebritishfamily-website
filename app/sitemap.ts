import type { MetadataRoute } from "next";
import { getNewsArticles, newsHref } from "@/lib/content/news";
import { absoluteUrl } from "@/lib/seo";
import { getSectors } from "@/lib/content/site-content";
import { navigation, sectorHref } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = navigation.map((item) => ({
    url: absoluteUrl(item.href),
    changeFrequency: (item.href === "/news" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const sectorPages = (await getSectors()).map((sector) => ({
    url: absoluteUrl(sectorHref(sector)),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articles = (await getNewsArticles()).map((article) => ({
    url: absoluteUrl(newsHref(article)),
    lastModified: article.publishedAt,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...sectorPages, ...articles];
}
