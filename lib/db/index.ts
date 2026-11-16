import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { sql } from "drizzle-orm";
import type { Pool } from "pg";
import { createDb, createPool, hasDatabaseUrl, type Database } from "./client";

/**
 * The app's database handle. One pool per server instance, created lazily so
 * that builds and pages without DATABASE_URL never try to connect (the
 * content layer then serves the built-in defaults).
 */
const globalForDb = globalThis as unknown as { bflPool?: Pool; bflDb?: Database; bflDbDownUntil?: number };

export function getDb(): Database | null {
  if (!hasDatabaseUrl()) return null;
  if (!globalForDb.bflDb) {
    const pool = createPool();
    attachDatabasePool(pool);
    pool.on("error", (error) => console.error("[db] idle client error", error));
    globalForDb.bflPool = pool;
    globalForDb.bflDb = createDb(pool);
  }
  return globalForDb.bflDb;
}

/** Like getDb(), for admin code where a database is required. */
export function requireDb(): Database {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set. The admin panel needs a database.");
  return db;
}

/* ------------------------------------------------------------------
   Circuit breaker for public reads.
   After one failed query the database is treated as down for 30 seconds:
   every other public read fails fast to the defaults instead of waiting on
   the connection timeout again. So during an outage at most one read per
   30 seconds (per server instance) pays the timeout.
   ------------------------------------------------------------------ */

const DOWN_FOR_MS = 30_000;

export function isDbCircuitOpen(): boolean {
  return (globalForDb.bflDbDownUntil ?? 0) > Date.now();
}

export function markDbDown(): void {
  globalForDb.bflDbDownUntil = Date.now() + DOWN_FOR_MS;
  (globalThis as unknown as { bflDbSeenDown?: boolean }).bflDbSeenDown = true;
}

/**
 * Shared reachability check for public reads ("half-open" circuit breaker).
 *
 * - Concurrent callers share one in-flight `select 1`, so a page starting
 *   several reads at once costs at most one wait, capped at PROBE_TIMEOUT_MS.
 * - Only a check made while the database state is unknown (first use, or
 *   after a success expired) blocks the request.
 * - Once the database has been seen down, later checks run in the
 *   background: the request that triggered them gets the defaults
 *   immediately, and reads go back to the database once a background check
 *   succeeds. So during an outage a visitor waits on the database at most
 *   once.
 */
const OK_FOR_MS = 10_000;
const PROBE_TIMEOUT_MS = 3_000;
const probeState = globalThis as unknown as {
  bflProbe?: Promise<boolean> | null;
  bflDbOkUntil?: number;
  bflDbSeenDown?: boolean;
};

function runProbe(db: Database): Promise<boolean> {
  probeState.bflProbe ??= Promise.race([
    db.execute(sql`select 1`).then(() => true),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`no answer within ${PROBE_TIMEOUT_MS} ms`)), PROBE_TIMEOUT_MS),
    ),
  ])
    .then(() => {
      probeState.bflDbOkUntil = Date.now() + OK_FOR_MS;
      probeState.bflDbSeenDown = false;
      return true;
    })
    .catch((error: unknown) => {
      markDbDown();
      probeState.bflDbSeenDown = true;
      console.error("[content] could not read from the database (unreachable); serving defaults", error);
      return false;
    })
    .finally(() => {
      probeState.bflProbe = null;
    });
  return probeState.bflProbe;
}

export function isDbReachable(db: Database): Promise<boolean> {
  if ((probeState.bflDbOkUntil ?? 0) > Date.now()) return Promise.resolve(true);
  if (isDbCircuitOpen()) return Promise.resolve(false);
  if (probeState.bflDbSeenDown) {
    void runProbe(db); // retry in the background; never make this visitor wait
    return Promise.resolve(false);
  }
  return runProbe(db);
}

export * as schema from "./schema";
