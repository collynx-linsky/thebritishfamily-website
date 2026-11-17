"use server";

import { draftMode, headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Leave the live preview (Draft Mode). Harmless for anyone, so no session is
 * needed. Returns to the page the visitor was on (same site only).
 */
export async function exitPreview(): Promise<void> {
  (await draftMode()).disable();
  const referer = (await headers()).get("referer");
  let path = "/";
  try {
    const url = new URL(referer ?? "");
    if (url.pathname.startsWith("/") && !url.pathname.startsWith("//")) path = url.pathname;
  } catch {
    // no or invalid referer: home page
  }
  redirect(path);
}
