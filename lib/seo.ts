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

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

/**
 * Per-page metadata with matching canonical, Open Graph and Twitter
 * fields. The share image comes from app/opengraph-image.tsx and
 * app/twitter-image.tsx, which Next.js attaches to every route.
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
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${company.name}`,
      description,
    },
  };
}
