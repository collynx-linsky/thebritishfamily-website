import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { navigation, sectorHref, sectors } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = navigation.map((item) => ({
    url: absoluteUrl(item.href),
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const sectorPages = sectors.map((sector) => ({
    url: absoluteUrl(sectorHref(sector)),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...pages, ...sectorPages];
}
