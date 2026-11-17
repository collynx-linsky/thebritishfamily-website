"use server";

/**
 * Dashboard actions: mark "needs attention" items as reviewed (or not), and
 * dismiss the first-visit welcome. Each checks the session itself.
 */
import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/dal";
import { recordActivity } from "@/lib/admin/activity";
import { getReviewItems } from "@/lib/admin/review";
import { requireDb, schema } from "@/lib/db";

export type DashboardResult = { ok: true } | { ok: false; error: string };

const KEY = /^[a-z0-9:_-]{1,100}$/;

async function guarded(task: (userId: number) => Promise<void>): Promise<DashboardResult> {
  try {
    const session = await requireAdmin();
    await task(session.userId);
    refresh();
    return { ok: true };
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: error.message };
    console.error("[admin] dashboard action failed", error);
    return { ok: false, error: "That didn't work. Please try again." };
  }
}

export async function setReviewed(key: string, reviewed: boolean): Promise<DashboardResult> {
  return guarded(async (userId) => {
    if (typeof key !== "string" || !KEY.test(key)) throw new Error("bad key");
    const item = (await getReviewItems()).find((i) => i.key === key);
    if (!item) throw new Error("unknown item");
    const db = requireDb();
    if (reviewed) {
      await db.insert(schema.contentReviews).values({ key, reviewedBy: userId }).onConflictDoNothing();
    } else {
      await db.delete(schema.contentReviews).where(eq(schema.contentReviews.key, key));
    }
    await recordActivity({
      userId,
      action: reviewed ? "review.mark" : "review.unmark",
      summary: `${reviewed ? "Marked as reviewed" : "Put back on the list"}: ${item.title}`,
      href: "/admin#attention",
    });
  });
}

export async function dismissWelcome(): Promise<DashboardResult> {
  return guarded(async (userId) => {
    await requireDb().update(schema.adminUsers).set({ onboardedAt: new Date() }).where(eq(schema.adminUsers.id, userId));
  });
}
