/**
 * Read-only queries for the admin panel (uncached: admins should always see
 * the current state). Callers must have verified the session already.
 */
import "server-only";
import { count, max, min } from "drizzle-orm";
import { requireDb, schema } from "../db";
import type { HistoryEntity } from "../db/schema";
import { ADMIN_AREAS, type AdminArea } from "./areas";

export type AreaStatus = {
  key: string;
  /** Most recent change, or null when nothing changed since setup */
  lastChangedAt: Date | null;
  /** Number of items in the area's main list (list areas only) */
  itemCount?: number;
};

type TableName = NonNullable<AdminArea["sources"]["tables"]>[number];

const tables = {
  sectors: schema.sectors,
  leaders: schema.leaders,
  hero_slides: schema.heroSlides,
  gallery_photos: schema.galleryPhotos,
  news_articles: schema.newsArticles,
  downloads: schema.downloads,
} as const satisfies Record<TableName, unknown>;

/** History entity type written when a row of each table is saved or deleted */
const historyEntityFor: Record<TableName, HistoryEntity> = {
  sectors: "sector",
  leaders: "leader",
  hero_slides: "hero_slides",
  gallery_photos: "gallery_photos",
  news_articles: "news_article",
  downloads: "download",
};

const newest = (dates: (Date | null | undefined)[]) =>
  dates.filter((d): d is Date => d instanceof Date).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

/** A row change counts only if it happened after the row was set up. */
const changedAt = (created: Date | null, updated: Date | null) =>
  created && updated && updated.getTime() - created.getTime() > 1000 ? updated : null;

/** For each admin area: when it last changed (ignoring the initial setup) and its item count. */
export async function getAreaStatuses(): Promise<AreaStatus[]> {
  const db = requireDb();

  const [sections, history, tableStats] = await Promise.all([
    db
      .select({ key: schema.contentSections.key, createdAt: schema.contentSections.createdAt, updatedAt: schema.contentSections.updatedAt })
      .from(schema.contentSections),
    // Every save (including deletions) writes history, so it also catches removals
    db
      .select({ entityType: schema.contentHistory.entityType, entityId: schema.contentHistory.entityId, savedAt: max(schema.contentHistory.savedAt) })
      .from(schema.contentHistory)
      .groupBy(schema.contentHistory.entityType, schema.contentHistory.entityId),
    Promise.all(
      (Object.keys(tables) as TableName[]).map(async (name) => {
        const t = tables[name];
        const [row] = await db.select({ items: count(), lastUpdated: max(t.updatedAt), firstCreated: min(t.createdAt) }).from(t);
        return [name, row] as const;
      }),
    ).then((entries) => Object.fromEntries(entries) as Record<TableName, { items: number; lastUpdated: Date | null; firstCreated: Date | null }>),
  ]);

  return ADMIN_AREAS.map((area) => {
    const times: (Date | null | undefined)[] = [];
    for (const key of area.sources.sections ?? []) {
      const s = sections.find((x) => x.key === key);
      times.push(s && changedAt(s.createdAt, s.updatedAt));
      times.push(history.find((h) => h.entityType === "section" && h.entityId === key)?.savedAt);
    }
    for (const name of area.sources.tables ?? []) {
      const stat = tableStats[name];
      times.push(changedAt(stat.firstCreated, stat.lastUpdated));
      times.push(...history.filter((h) => h.entityType === historyEntityFor[name]).map((h) => h.savedAt));
    }
    const mainTable = area.sources.tables?.[0];
    return {
      key: area.key,
      lastChangedAt: newest(times),
      itemCount: mainTable ? tableStats[mainTable].items : undefined,
    };
  });
}
