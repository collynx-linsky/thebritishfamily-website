/**
 * Password hashing with Argon2id (via the maintained @node-rs/argon2
 * binding). Parameters follow the OWASP Password Storage Cheat Sheet
 * minimum for Argon2id: 19 MiB memory, 2 iterations, 1 degree of parallelism.
 * No server-only import: also used by the seed and reset scripts.
 */
import { hash, verify } from "@node-rs/argon2";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./password-rules";

const OPTIONS = {
  algorithm: 2, // Argon2id
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH };

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(hashed: string, password: string): Promise<boolean> {
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}

/** Human-readable problem with a proposed password, or null if acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > MAX_PASSWORD_LENGTH) return `Use at most ${MAX_PASSWORD_LENGTH} characters.`;
  if (new Set(password).size < 5) return "Use a less repetitive password.";
  return null;
}
