/**
 * Downloads content access. Documents come from the database (uploaded in
 * the admin panel, stored in Vercel Blob), falling back to
 * lib/defaults/downloads.ts when there is no database, it was never seeded,
 * or it cannot be reached. The admin's save actions call
 * updateTag(DOWNLOADS_TAG).
 */
import "server-only";
import { asc, desc } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { schema } from "../db";
import { readWithFallback } from "./read";
import { defaultDownloads } from "../defaults/downloads";
import { isSeeded } from "./site-content";
import { downloadCategories, type DownloadCategory, type DownloadItem } from "./types";

export const DOWNLOADS_TAG = "downloads";

const sortItems = (items: DownloadItem[]) =>
  [...items].sort(
    (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.publishedAt.localeCompare(a.publishedAt),
  );

/** All documents, featured first, then newest first. */
export async function getDownloads(): Promise<DownloadItem[]> {
  "use cache";
  cacheTag(DOWNLOADS_TAG);
  const defaults = () => sortItems(defaultDownloads);
  return readWithFallback("downloads", defaults, async (db) => {
    const rows = await db
      .select()
      .from(schema.downloads)
      .orderBy(desc(schema.downloads.featured), asc(schema.downloads.sortOrder), desc(schema.downloads.publishedAt));
    if (!rows.length && !(await isSeeded())) return defaults();
    return rows.map((r) => ({
      id: r.key,
      title: r.title,
      description: r.description,
      category: r.category as DownloadCategory,
      file: {
        url: r.fileUrl,
        fileName: r.fileName,
        format: r.fileFormat,
        sizeBytes: r.fileSizeBytes,
        ...(r.filePages ? { pages: r.filePages } : {}),
      },
      publishedAt: r.publishedAt,
      featured: r.featured,
    }));
  });
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
