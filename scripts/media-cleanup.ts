/**
 * Remove abandoned uploads now (photos uploaded from an editor but never
 * saved, older than a day). The same job runs daily on Vercel.
 *
 *   npm run media:cleanup
 */
import { requireDatabaseUrl, describeDatabase, explainError } from "./env";
import { createDb, createPool } from "../lib/db/client";
import { cleanUpAbandonedUploads } from "../lib/media/cleanup";

requireDatabaseUrl();
console.log(`\n  Cleaning up abandoned uploads in ${describeDatabase()}`);
const pool = createPool();
cleanUpAbandonedUploads(createDb(pool))
  .then((r) => console.log(`  Removed ${r.removed}, kept ${r.kept} that turned out to be in use${r.failed ? `, ${r.failed} could not be removed` : ""}.\n`))
  .catch((error) => {
    console.error(`\n  Clean-up failed: ${explainError(error)}\n`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
