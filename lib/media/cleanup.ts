/**
 * Removes abandoned uploads: photos uploaded from an editor but never
 * saved ("pending") and older than a day. A file still referenced by any
 * content is kept (and marked as in use) even if its status says pending.
 *
 * Runs daily from Vercel Cron (app/api/cron/media-cleanup) and on demand
 * with `npm run media:cleanup`.
 */
import "server-only";
import { and, eq, inArray, lt } from "drizzle-orm";
import type { Database } from "../db/client";
import * as schema from "../db/schema";
import { storageFor } from "./storage";
import { findUsage } from "./usage";

export async function cleanUpAbandonedUploads(db: Database, olderThanHours = 24): Promise<{ removed: number; kept: number; failed: number }> {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
  const candidates = await db
    .select()
    .from(schema.media)
    .where(and(eq(schema.media.status, "pending"), lt(schema.media.createdAt, cutoff)));
  if (!candidates.length) return { removed: 0, kept: 0, failed: 0 };

  const usage = await findUsage(db);
  const inUse = candidates.filter((c) => usage.has(c.url));
  if (inUse.length) {
    await db.update(schema.media).set({ status: "library", updatedAt: new Date() }).where(inArray(schema.media.id, inUse.map((c) => c.id)));
  }

  let removed = 0;
  let failed = 0;
  for (const item of candidates.filter((c) => !usage.has(c.url))) {
    try {
      await storageFor(item.url).remove(item);
      await db.delete(schema.media).where(eq(schema.media.id, item.id));
      removed++;
    } catch (error) {
      failed++;
      console.error("[media] could not remove an abandoned upload", item.url, error);
    }
  }
  return { removed, kept: inUse.length, failed };
}
