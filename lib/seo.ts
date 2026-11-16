import type { Metadata } from "next";
import { company as defaultCompany } from "./site";

/**
 * Public URL of the site, used for canonical links, the sitemap, robots.txt
 * and share images. In order of preference:
 *
 * 1. NEXT_PUBLIC_SITE_URL, set in the deployment environment (the real
 *    domain once it is registered; see README),
 * 2. on Vercel, the project's production address, which Vercel provides at
 *    build time (so a deployment never advertises localhost),
 * 3. the local development server.
 *
 * Only server code reads this (metadata, sitemap, robots), so the
 * server-side Vercel variable is safe to use.
 *
 * This module stays free of server-only imports (the seed script reaches it).
 * Pages get their metadata through lib/content/metadata.ts, which supplies
 * the edited company name and page copy.
 */
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProduction ? `https://${vercelProduction}` : "http://localhost:3000")
).replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${siteUrl}${path === "/" ? "" : path}`;

/** Shared by app/opengraph-image.tsx, app/twitter-image.tsx and pageMetadata. */
export const shareImageSize = { width: 1200, height: 630 };
export const shareImageAlt = (siteName: string = defaultCompany.name) =>
  `${siteName}: mining chemicals, construction, electronics and educational services in Dar es Salaam, Tanzania`;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  siteName: string;
};

/**
 * Per-page metadata with matching canonical, Open Graph and Twitter fields.
 * Defining `openGraph`/`twitter` on a page replaces the inherited objects,
 * including the file-based share images, so they are referenced explicitly.
 */
export function pageMetadata({ title, description, path, siteName }: PageMetaInput): Metadata {
  const alt = shareImageAlt(siteName);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      siteName,
      locale: "en_GB",
      type: "website",
      images: [{ url: "/opengraph-image", ...shareImageSize, alt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [{ url: "/twitter-image", alt }],
    },
  };
}
