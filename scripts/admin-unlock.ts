/**
 * Clear all login lockouts and delays immediately (they also expire on
 * their own after 15 minutes).
 *
 *   npm run admin:unlock
 */
import { requireEnv } from "./env";
import { createDb, createPool, schema } from "../lib/db/client";

async function main() {
  requireEnv("DATABASE_URL");
  const pool = createPool();
  try {
    const removed = await createDb(pool).delete(schema.loginAttempts).returning({ id: schema.loginAttempts.id });
    console.log(`\n  Login lockouts cleared (${removed.length} recorded attempts removed).\n`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\n ", error instanceof Error ? error.message : error, "\n");
  process.exitCode = 1;
});
