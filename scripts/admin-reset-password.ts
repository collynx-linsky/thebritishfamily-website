/**
 * Reset the administrator's password, sign out every session and clear
 * login lockouts. For when the password is forgotten.
 *
 *   npm run admin:reset-password
 *
 * Asks for the new password without showing it. To run non-interactively,
 * set ADMIN_EMAIL and ADMIN_NEW_PASSWORD in the environment instead.
 */
import { requireEnv } from "./env";
import { eq } from "drizzle-orm";
import { createInterface } from "node:readline";
import { createDb, createPool, schema } from "../lib/db/client";
import { hashPassword, passwordProblem } from "../lib/auth/password";

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Print the prompt, then suppress echo of typed characters
      const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
        if (s.includes(question)) write.call(rl, s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  requireEnv("DATABASE_URL");
  const interactive = process.stdin.isTTY && !process.env.ADMIN_NEW_PASSWORD;

  const email = (interactive
    ? (await ask(`Admin email [${process.env.ADMIN_EMAIL ?? ""}]: `)) || process.env.ADMIN_EMAIL || ""
    : requireEnv("ADMIN_EMAIL")
  ).trim().toLowerCase();

  const password = interactive ? await ask("New password: ", true) : requireEnv("ADMIN_NEW_PASSWORD");
  const problem = passwordProblem(password);
  if (problem) throw new Error(`Password not changed: ${problem}`);
  if (interactive && (await ask("Repeat new password: ", true)) !== password) {
    throw new Error("Password not changed: the two passwords did not match.");
  }

  const pool = createPool();
  const db = createDb(pool);
  try {
    const passwordHash = await hashPassword(password);
    const updated = await db
      .update(schema.adminUsers)
      .set({ passwordHash, passwordChangedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.adminUsers.email, email))
      .returning({ id: schema.adminUsers.id });

    if (updated.length) {
      await db.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, updated[0].id));
    } else {
      // No account with that email yet: create it (e.g. first setup)
      await db.insert(schema.adminUsers).values({ email, passwordHash });
    }
    await db.delete(schema.loginAttempts);
    console.log(
      `\n  Password ${updated.length ? "reset" : "set (new account created)"} for ${email}.` +
        "\n  All sessions were signed out and login lockouts were cleared.\n",
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\n ", error instanceof Error ? error.message : error, "\n");
  process.exitCode = 1;
});
