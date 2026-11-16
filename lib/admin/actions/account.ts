"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireDb, schema } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/dal";
import { hashPassword, MAX_PASSWORD_LENGTH, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { destroyOtherSessions } from "@/lib/auth/session";

export type PasswordState =
  | { status: "idle" }
  | { status: "saved"; message: string }
  | { status: "error"; message: string; fields?: Partial<Record<"current" | "next" | "confirm", string>> };

const input = z.object({
  current: z.string().max(MAX_PASSWORD_LENGTH),
  next: z.string().max(MAX_PASSWORD_LENGTH),
  confirm: z.string().max(MAX_PASSWORD_LENGTH),
});

/** Change the administrator's password; signs out every other device. */
export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  try {
    const session = await requireAdmin();
    const parsed = input.safeParse({
      current: formData.get("current") ?? "",
      next: formData.get("next") ?? "",
      confirm: formData.get("confirm") ?? "",
    });
    if (!parsed.success) return { status: "error", message: "Please fill in all three fields." };
    const { current, next, confirm } = parsed.data;

    const fields: NonNullable<Extract<PasswordState, { status: "error" }>["fields"]> = {};
    if (!current) fields.current = "Enter your current password.";
    const problem = passwordProblem(next);
    if (problem) fields.next = problem;
    else if (next === current) fields.next = "Choose a password different from the current one.";
    if (confirm !== next) fields.confirm = "The two new passwords don't match.";
    if (Object.keys(fields).length) return { status: "error", message: "Please fix the fields marked below.", fields };

    const db = requireDb();
    const [user] = await db
      .select({ passwordHash: schema.adminUsers.passwordHash })
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.id, session.userId));
    if (!user || !(await verifyPassword(user.passwordHash, current))) {
      return { status: "error", message: "Please fix the fields marked below.", fields: { current: "That isn't your current password." } };
    }

    await db
      .update(schema.adminUsers)
      .set({ passwordHash: await hashPassword(next), passwordChangedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.adminUsers.id, session.userId));
    const others = await destroyOtherSessions(session);
    return {
      status: "saved",
      message: `Your password has been changed.${others ? ` ${others} other device${others === 1 ? " was" : "s were"} signed out.` : ""}`,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) return { status: "error", message: error.message };
    throw error;
  }
}
