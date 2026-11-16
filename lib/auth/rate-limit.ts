/**
 * Login throttling with temporary lockouts.
 *
 * - Lockout is keyed by email + IP: after 5 failed attempts within 15 minutes
 *   from one network, that network is locked out for that email until the
 *   window passes. It expires on its own, and an attacker on another network
 *   can never lock out the real administrator.
 * - Across all networks, failures for an email add a short, capped delay
 *   (never a lockout), which slows down guessing spread over many IPs.
 * - Only hashes are stored, never emails or IP addresses.
 *
 * `npm run admin:unlock` clears everything immediately.
 */
import "server-only";
import { and, count, eq, gt, lt, min } from "drizzle-orm";
import { headers } from "next/headers";
import { requireDb, schema } from "../db";
import { sha256 } from "./tokens";

export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_NETWORK = 5;
const DELAY_AFTER_FAILURES = 3;
const DELAY_STEP_MS = 500;
const MAX_DELAY_MS = 4_000;

/** Client IP as reported by the platform (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

export function attemptKeys(email: string, ip: string) {
  return { pairKey: sha256(`pair:${email}:${ip}`), accountKey: sha256(`account:${email}`) };
}

export type Throttle =
  | { locked: true; retryInMs: number }
  | { locked: false; delayMs: number };

export async function checkThrottle(keys: ReturnType<typeof attemptKeys>): Promise<Throttle> {
  const db = requireDb();
  const since = new Date(Date.now() - WINDOW_MS);

  const [pair] = await db
    .select({ failures: count(), oldest: min(schema.loginAttempts.attemptedAt) })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.pairKey, keys.pairKey),
        eq(schema.loginAttempts.success, false),
        gt(schema.loginAttempts.attemptedAt, since),
      ),
    );
  if (pair.failures >= MAX_FAILURES_PER_NETWORK && pair.oldest) {
    const retryInMs = pair.oldest.getTime() + WINDOW_MS - Date.now();
    if (retryInMs > 0) return { locked: true, retryInMs };
  }

  const [account] = await db
    .select({ failures: count() })
    .from(schema.loginAttempts)
    .where(
      and(
        eq(schema.loginAttempts.accountKey, keys.accountKey),
        eq(schema.loginAttempts.success, false),
        gt(schema.loginAttempts.attemptedAt, since),
      ),
    );
  const extra = Math.max(0, account.failures - DELAY_AFTER_FAILURES);
  return { locked: false, delayMs: Math.min(extra * DELAY_STEP_MS, MAX_DELAY_MS) };
}

export async function recordAttempt(keys: ReturnType<typeof attemptKeys>, success: boolean): Promise<void> {
  const db = requireDb();
  await db.insert(schema.loginAttempts).values({ ...keys, success });
  if (success) {
    // A successful login clears this network's failures for this account
    await db
      .delete(schema.loginAttempts)
      .where(and(eq(schema.loginAttempts.pairKey, keys.pairKey), eq(schema.loginAttempts.success, false)));
  }
  // Housekeeping: drop records older than a day
  await db.delete(schema.loginAttempts).where(lt(schema.loginAttempts.attemptedAt, new Date(Date.now() - 86_400_000)));
}
