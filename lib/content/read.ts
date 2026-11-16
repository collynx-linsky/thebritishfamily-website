import "server-only";
import { cacheLife } from "next/cache";
import { getDb, isDbCircuitOpen, isDbReachable, markDbDown } from "../db";
import type { Database } from "../db/client";

/**
 * Runs a public content read with the site's fallback rules. Must be called
 * from inside a "use cache" function (it sets that cache entry's lifetime):
 *
 * - no DATABASE_URL           -> defaults, cached long
 * - database recently failed  -> defaults immediately (no waiting), cached briefly
 * - query succeeds            -> result, cached long (until the admin's updateTag)
 * - query fails               -> defaults, cached briefly; logged; the circuit
 *                                opens so other reads fail fast
 *
 * "Cached briefly" uses the `minutes` profile (stale 5 min, revalidate 1 min,
 * expire 1 hour): visitors keep getting the cached fallback instantly while a
 * background revalidation retries the database.
 */
export async function readWithFallback<T>(
  what: string,
  fallback: () => T,
  query: (db: Database) => Promise<T>,
): Promise<T> {
  const db = getDb();
  if (!db) {
    cacheLife("max");
    return fallback();
  }
  // One shared check for all concurrent reads (and instant while the circuit is open)
  if (isDbCircuitOpen() || !(await isDbReachable(db))) {
    cacheLife("minutes");
    return fallback();
  }
  try {
    const result = await query(db);
    cacheLife("max");
    return result;
  } catch (error) {
    markDbDown();
    console.error(`[content] could not read ${what} from the database; serving defaults`, error);
    cacheLife("minutes");
    return fallback();
  }
}
