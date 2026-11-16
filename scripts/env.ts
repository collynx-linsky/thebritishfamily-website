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

/**
 * Check that DATABASE_URL looks like a Postgres address and explain common
 * copy-and-paste mistakes. Never prints the value itself (it holds a password).
 * Exits when it is unusable, before any connection is attempted.
 */
export function requireDatabaseUrl(): void {
  const raw = requireEnv("DATABASE_URL");
  const problems: string[] = [];
  if (/^\s|\s$/.test(raw)) problems.push("It starts or ends with a space. Remove the spaces.");
  if (/[<>]/.test(raw)) problems.push("It contains < or >. Those were only placeholders in the instructions: paste the address alone.");
  if (/^[A-Z_]+\s*=/.test(raw.trim())) problems.push("It starts with a NAME= part. You copied the whole line: paste only the part inside the quotes, starting with postgresql://");
  if (/["'`]/.test(raw)) problems.push("It contains quote marks inside the value. Paste only the address, without its own quotes.");
  if (!problems.length && !/^postgres(ql)?:\/\//.test(raw)) problems.push("It doesn't start with postgresql:// — check you copied the complete address.");
  if (!problems.length) {
    try {
      const url = new URL(raw);
      if (!url.hostname) problems.push("It has no server name. Check you copied the complete address.");
    } catch {
      problems.push("It isn't a valid address. Check you copied all of it, in one piece.");
    }
  }
  if (problems.length) {
    console.error(`\n  DATABASE_URL can't be used (its value is not shown, because it contains a password):\n${problems.map((p) => `   - ${p}`).join("\n")}\n`);
    process.exit(1);
  }
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
