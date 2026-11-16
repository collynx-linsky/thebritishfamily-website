import { defineConfig } from "drizzle-kit";

// Load .env.local when present (Node's built-in loader); production sets the variables itself.
try {
  process.loadEnvFile(".env.local");
} catch {}

// Migrations are generated from lib/db/schema.ts into drizzle/ and applied
// with `npm run db:migrate` (locally against Docker, in production against Neon).
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
