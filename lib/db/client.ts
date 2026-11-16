/**
 * Postgres connection shared by the app and the npm scripts.
 *
 * Uses node-postgres with a connection pool, the approach Neon and Vercel
 * recommend for Vercel Functions with Fluid compute. The app entry point
 * (lib/db/index.ts) also registers the pool with `attachDatabasePool` so idle
 * connections are closed before a function is suspended.
 *
 * App code must import from "@/lib/db", not from this file.
 */
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. See .env.example.");
  return new Pool({
    connectionString: url,
    // Fail fast so the public site can fall back to its defaults quickly
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    max: 5,
  });
}

export function createDb(pool: Pool): Database {
  return drizzle(pool, { schema });
}

export { schema };
