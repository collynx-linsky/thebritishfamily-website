/**
 * Loads .env.local for npm scripts run outside Next.js (Node's built-in
 * loader, no dependency). In production the variables already exist.
 */
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // file not present: fine
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`\n  Missing ${name}. Add it to .env.local (see .env.example).\n`);
    process.exit(1);
  }
  return value;
}

/** "host / database" of DATABASE_URL, without the user name or password. */
export function describeDatabase(): string {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    return `${url.hostname}${url.port ? `:${url.port}` : ""} / ${url.pathname.replace(/^\//, "") || "(default database)"}`;
  } catch {
    return "(DATABASE_URL is not a valid address)";
  }
}

/**
 * The most useful message from a failed database call: Drizzle wraps the
 * driver's error (the one with the real reason) in `cause`.
 */
export function explainError(error: unknown): string {
  const parts: string[] = [];
  for (let e: unknown = error; e; e = (e as { cause?: unknown }).cause) {
    if (!(e instanceof Error)) {
      parts.push(String(e));
      break;
    }
    const code = (e as { code?: string }).code;
    // Drizzle's own message repeats the whole query and its values; skip it
    if (!e.message.startsWith("Failed query:")) parts.push(code ? `${e.message} (code ${code})` : e.message);
  }
  return parts.join("\n    caused by: ") || String(error);
}
