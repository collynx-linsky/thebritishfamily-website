import type { MetadataRoute } from "next";
import { absoluteUrl, searchIndexingAllowed, siteUrl } from "@/lib/seo";

/**
 * While indexing is not allowed (see lib/seo.ts), every response carries
 * `X-Robots-Tag: noindex` and every page a robots noindex meta tag. Crawling
 * stays allowed here on purpose: a crawler only sees a noindex instruction
 * on pages it may fetch, whereas a page blocked by robots.txt can still be
 * listed by its address alone. The sitemap is left out until launch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    ...(searchIndexingAllowed ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
    host: siteUrl,
  };
}
