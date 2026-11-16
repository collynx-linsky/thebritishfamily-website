/**
 * Data access layer for authorisation. Every admin page, server action and
 * route handler must call one of these; the proxy's cookie check is only a
 * convenience redirect and is never relied on for security.
 */
import "server-only";
import { redirect } from "next/navigation";
import { getSession, type AdminSession } from "./session";

/** For admin pages and layouts: the session, or a redirect to the login page. */
export async function verifySession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Your session has ended. Please sign in again.");
    this.name = "UnauthorizedError";
  }
}

/** For server actions and route handlers: the session, or an error. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}
