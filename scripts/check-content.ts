/**
 * Checks that the built-in default content passes the same validation the
 * admin panel applies, so "Restore original" and the seed can never store
 * content the site would reject.
 *
 *   npm run content:check
 */
import { sectionDefaults, sectionSchemas } from "../lib/content/sections";

let failed = false;
for (const key of Object.keys(sectionSchemas) as (keyof typeof sectionSchemas)[]) {
  const result = sectionSchemas[key].safeParse(sectionDefaults[key]);
  if (result.success) {
    console.log(`  ok    ${key}`);
  } else {
    failed = true;
    console.log(`  FAIL  ${key}`);
    for (const issue of result.error.issues) console.log(`          ${issue.path.join(".")}: ${issue.message}`);
  }
}
process.exitCode = failed ? 1 : 0;
