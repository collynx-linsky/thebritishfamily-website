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
