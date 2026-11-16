"use server";

/**
 * Authentication server actions. Server actions are public endpoints:
 * each one validates its input and checks the session itself.
 */
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb, schema } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/dal";
import { MAX_PASSWORD_LENGTH, verifyPassword } from "@/lib/auth/password";
import { attemptKeys, checkThrottle, clientIp, recordAttempt } from "@/lib/auth/rate-limit";
import { createSession, destroyOtherSessions, destroySession } from "@/lib/auth/session";

export type LoginState = { error?: string; email?: string };

const loginInput = z.object({
  email: z.string().trim().toLowerCase().min(3).max(120),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
  next: z.string().max(200).optional(),
});

/** Same message for unknown email and wrong password, so accounts can't be probed. */
const WRONG_CREDENTIALS = "That email and password don't match. Check them and try again.";

/**
 * Argon2id hash of a discarded random value (same parameters as real hashes).
 * Verified when the email is unknown, so both paths cost one Argon2 verify
 * and response time does not reveal whether an account exists.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$haj8BATuBGXuocz1boVEwQ$0oeHuG9mf4/6P0VPeZ05T0w108BCdVAnJ39y75mkEZY";

/** Only same-site admin paths are allowed as the post-login destination. */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") && !next.includes("\\") ? next : "/admin";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    return { error: "Enter your email address and password.", email: String(formData.get("email") ?? "") };
  }
  const { email, password, next } = parsed.data;

  const keys = attemptKeys(email, await clientIp());
  const throttle = await checkThrottle(keys);
  if (throttle.locked) {
    const minutes = Math.max(1, Math.ceil(throttle.retryInMs / 60_000));
    return {
      error: `Too many failed attempts from this network. For your security, sign-in is paused for ${minutes} minute${minutes === 1 ? "" : "s"}. Try again then.`,
      email,
    };
  }
  if (throttle.delayMs) await sleep(throttle.delayMs);

  const [user] = await requireDb()
    .select({ id: schema.adminUsers.id, passwordHash: schema.adminUsers.passwordHash })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email));

  const ok = user
    ? await verifyPassword(user.passwordHash, password)
    : (await verifyPassword(DUMMY_HASH, password), false);
  await recordAttempt(keys, ok);
  if (!ok || !user) return { error: WRONG_CREDENTIALS, email };

  await createSession(user.id);
  redirect(safeNext(next));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login?signedOut=1");
}

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

export async function signOutOtherDevices(): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const count = await destroyOtherSessions(session);
    return {
      ok: true,
      message: count ? `Signed out of ${count} other device${count === 1 ? "" : "s"}.` : "You were not signed in anywhere else.",
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: error.message };
    throw error;
  }
}
