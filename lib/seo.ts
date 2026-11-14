import type { Metadata } from "next";
import { company } from "./site";

/**
 * Public URL of the site. The domain is not registered yet, so set
 * NEXT_PUBLIC_SITE_URL in the deployment environment (see README).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const absoluteUrl = (path = "/") => `${siteUrl}${path === "/" ? "" : path}`;

/** Shared by app/opengraph-image.tsx, app/twitter-image.tsx and pageMetadata. */
export const shareImageSize = { width: 1200, height: 630 };
export const shareImageAlt = `${company.name}: mining chemicals, construction, electronics and educational services in Dar es Salaam, Tanzania`;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

/**
 * Per-page metadata with matching canonical, Open Graph and Twitter fields.
 * Defining `openGraph`/`twitter` on a page replaces the inherited objects,
 * including the file-based share images, so they are referenced explicitly.
 */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${company.name}`,
      description,
      url: path,
      siteName: company.name,
      locale: "en_GB",
      type: "website",
      images: [{ url: "/opengraph-image", ...shareImageSize, alt: shareImageAlt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${company.name}`,
      description,
      images: [{ url: "/twitter-image", alt: shareImageAlt }],
    },
  };
}
