/**
 * Apply the migrations in drizzle/ to the database in DATABASE_URL.
 *
 *   npm run db:migrate
 *
 * Uses Drizzle's migrator directly (the same bookkeeping table as
 * `drizzle-kit migrate`) because it reports failures clearly and exits with
 * an error code, so a following command such as the seed does not run
 * against a half-set-up database.
 */
import { describeDatabase, explainError, requireEnv } from "./env";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb, createPool } from "../lib/db/client";

requireEnv("DATABASE_URL");
console.log(`\n  Applying migrations to ${describeDatabase()}`);

const pool = createPool();
migrate(createDb(pool), { migrationsFolder: "drizzle" })
  .then(() => console.log("  ✓ Database is up to date.\n"))
  .catch((error) => {
    console.error(`\n  Migration failed: ${explainError(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
