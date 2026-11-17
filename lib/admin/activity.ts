/**
 * The admin activity log: a readable record of what happened and who did
 * it. Writing never blocks or breaks the action it describes: a failure to
 * record is logged on the server and otherwise ignored.
 */
import "server-only";
import { desc, eq, gte, like, lt, sql } from "drizzle-orm";
import { requireDb, schema } from "../db";

export type ActivityAction =
  | "content.save"
  | "content.undo"
  | "content.restore"
  | "review.mark"
  | "review.unmark"
  | "auth.signin"
  | "auth.signout"
  | "auth.password"
  | "auth.devices";

const RETENTION = sql`now() - interval '1 year'`;

export async function recordActivity(entry: { userId: number | null; action: ActivityAction; summary: string; href?: string }) {
  try {
    const db = requireDb();
    await db.insert(schema.activityLog).values({ ...entry, href: entry.href ?? null });
    // Keep the log to a year; cheap thanks to the index on "at"
    if (Math.random() < 0.05) await db.delete(schema.activityLog).where(lt(schema.activityLog.at, RETENTION));
  } catch (error) {
    console.error("[admin] could not record activity", error);
  }
}

export type ActivityEntry = {
  id: number;
  at: Date;
  action: string;
  summary: string;
  href: string | null;
  who: string | null;
};

export async function listActivity(limit = 100): Promise<ActivityEntry[]> {
  return requireDb()
    .select({
      id: schema.activityLog.id,
      at: schema.activityLog.at,
      action: schema.activityLog.action,
      summary: schema.activityLog.summary,
      href: schema.activityLog.href,
      who: schema.adminUsers.displayName,
    })
    .from(schema.activityLog)
    .leftJoin(schema.adminUsers, eq(schema.adminUsers.id, schema.activityLog.userId))
    .orderBy(desc(schema.activityLog.at), desc(schema.activityLog.id))
    .limit(limit);
}

/** Number of content changes (saves, undos, restores) since a date */
export async function countContentChangesSince(since: Date): Promise<number> {
  const [row] = await requireDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.activityLog)
    .where(sql`${gte(schema.activityLog.at, since)} and ${like(schema.activityLog.action, "content.%")}`);
  return row?.n ?? 0;
}
