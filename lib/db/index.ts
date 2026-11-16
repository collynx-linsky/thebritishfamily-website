import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import type { Pool } from "pg";
import { createDb, createPool, hasDatabaseUrl, type Database } from "./client";

/**
 * The app's database handle. One pool per server instance, created lazily so
 * that builds and pages without DATABASE_URL never try to connect (the
 * content layer then serves the built-in defaults).
 */
const globalForDb = globalThis as unknown as { bflPool?: Pool; bflDb?: Database };

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

export * as schema from "./schema";
