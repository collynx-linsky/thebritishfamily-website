import { createHash, randomBytes } from "node:crypto";

/** 256-bit random token, URL-safe. The only copy lives in the cookie. */
export const newSessionToken = () => randomBytes(32).toString("base64url");

/** SHA-256 hex digest: what the database stores instead of tokens or IPs. */
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
