/**
 * Admin sessions stored in the database.
 *
 * The cookie holds a random 256-bit token; the database keeps only its
 * SHA-256 hash, so a leaked database contains no usable sessions. Sessions
 * end after 12 hours, or after 2 hours without activity, and can be revoked
 * instantly (logout, password change, "sign out other devices") by deleting
 * rows.
 */
import "server-only";
import { and, eq, gt, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { requireDb, schema } from "../db";
import { newSessionToken, sha256 } from "./tokens";

const ABSOLUTE_LIFETIME_MS = 12 * 60 * 60 * 1000;
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const TOUCH_EVERY_MS = 5 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

/**
 * In production the __Host- prefix makes the browser enforce Secure, path=/
 * and no Domain attribute. Locally (plain http) a prefix-free name is used.
 */
export const SESSION_COOKIE = isProduction ? "__Host-bfl_admin" : "bfl_admin";

export type AdminSession = { sessionId: number; userId: number; email: string };

export async function createSession(userId: number): Promise<void> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + ABSOLUTE_LIFETIME_MS);
  await requireDb().insert(schema.adminSessions).values({ userId, tokenHash: sha256(token), expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * The current admin session, or null. Validates against the database on
 * every call (deduplicated per request), so revoked or expired sessions are
 * refused immediately.
 */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  // Session checks are always per request; this also lets the code below
  // read the current time (Cache Components requires it to be request-time)
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const db = requireDb();
  const now = new Date();
  const [row] = await db
    .select({
      sessionId: schema.adminSessions.id,
      userId: schema.adminSessions.userId,
      lastSeenAt: schema.adminSessions.lastSeenAt,
      email: schema.adminUsers.email,
    })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.adminSessions.userId))
    .where(and(eq(schema.adminSessions.tokenHash, sha256(token)), gt(schema.adminSessions.expiresAt, now)));

  if (!row) return null;

  const idleFor = now.getTime() - row.lastSeenAt.getTime();
  if (idleFor > IDLE_TIMEOUT_MS) {
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.id, row.sessionId));
    return null;
  }
  if (idleFor > TOUCH_EVERY_MS) {
    await db.update(schema.adminSessions).set({ lastSeenAt: now }).where(eq(schema.adminSessions.id, row.sessionId));
  }
  return { sessionId: row.sessionId, userId: row.userId, email: row.email };
});

/** End the current session (logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await requireDb().delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, sha256(token)));
  }
  // Browsers only accept changes to a __Host- cookie that carry Secure and
  // path=/, so expire it with the same attributes it was set with.
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/** Sign out every other session of this user (keeps the current one). */
export async function destroyOtherSessions(session: AdminSession): Promise<number> {
  const removed = await requireDb()
    .delete(schema.adminSessions)
    .where(and(eq(schema.adminSessions.userId, session.userId), ne(schema.adminSessions.id, session.sessionId)))
    .returning({ id: schema.adminSessions.id });
  return removed.length;
}
