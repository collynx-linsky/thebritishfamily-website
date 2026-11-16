/**
 * Shapes of the admin-managed content (news and downloads).
 *
 * These mirror the rows the admin panel will store in the database, so the
 * public pages will not change when the data source moves from the defaults
 * in lib/defaults/ to the database. All text is plain text: it is rendered
 * as text, never as HTML.
 */
import type { ImageAsset } from "../site";

/** ISO date, YYYY-MM-DD */
export type IsoDate = string;

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string };

export type NewsCategory = "company-news" | "sectors" | "announcements";

export type NewsArticle = {
  slug: string;
  title: string;
  /** One or two sentences for cards and the meta description */
  excerpt: string;
  category: NewsCategory;
  publishedAt: IsoDate;
  image: ImageAsset;
  body: ArticleBlock[];
  /** Default content written from the company profile; replace with real news */
  sample?: boolean;
};

export type DownloadCategory = "company" | "forms" | "brochures";

export type DownloadItem = {
  id: string;
  title: string;
  description: string;
  category: DownloadCategory;
  file: {
    /** Public URL (later: a Vercel Blob URL saved by the admin panel) */
    url: string;
    /** Name the visitor's browser saves the file as */
    fileName: string;
    /** Short format label shown on the card, e.g. "PDF" */
    format: string;
    sizeBytes: number;
    pages?: number;
  };
  publishedAt: IsoDate;
  featured?: boolean;
};

export const newsCategoryLabels: Record<NewsCategory, string> = {
  "company-news": "Company news",
  sectors: "Sectors",
  announcements: "Announcements",
};

export const downloadCategories: { id: DownloadCategory; label: string; description: string }[] = [
  {
    id: "company",
    label: "Company documents",
    description: "Our company profile and contact details.",
  },
  {
    id: "forms",
    label: "Forms",
    description: "Forms for clients, suppliers and partners.",
  },
  {
    id: "brochures",
    label: "Brochures and guides",
    description: "Information about our sectors, products and services.",
  },
];
