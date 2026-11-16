/**
 * Downloads content access. Pages read documents only through these
 * functions. When the admin panel is built, `loadDownloads()` becomes a
 * database query (files stored in Vercel Blob) with the defaults as a
 * fallback, and the admin's save action calls `updateTag(DOWNLOADS_TAG)`.
 */
import { cacheLife, cacheTag } from "next/cache";
import { defaultDownloads } from "../defaults/downloads";
import { downloadCategories, type DownloadCategory, type DownloadItem } from "./types";

export const DOWNLOADS_TAG = "downloads";

async function loadDownloads(): Promise<DownloadItem[]> {
  return defaultDownloads;
}

/** All documents, featured first, then newest first. */
export async function getDownloads(): Promise<DownloadItem[]> {
  "use cache";
  cacheTag(DOWNLOADS_TAG);
  cacheLife("max");
  const items = await loadDownloads();
  return [...items].sort(
    (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.publishedAt.localeCompare(a.publishedAt),
  );
}

/** Documents grouped by category, in the display order of the categories. */
export async function getDownloadsByCategory(): Promise<
  { category: (typeof downloadCategories)[number]; items: DownloadItem[] }[]
> {
  const items = await getDownloads();
  return downloadCategories.map((category) => ({
    category,
    items: items.filter((item) => item.category === category.id),
  }));
}

export async function getDownload(id: string): Promise<DownloadItem | undefined> {
  return (await getDownloads()).find((item) => item.id === id);
}

export type { DownloadCategory };
