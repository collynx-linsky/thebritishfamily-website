/**
 * Live preview: unsaved editor values, read by the public content getters
 * only while Draft Mode is on (see lib/content/site-content.ts).
 *
 * Draft Mode's cookie is only ever set by an admin-checked action
 * (lib/admin/actions/content.ts startPreview), and its value is a secret
 * that changes with every build, so visitors never see unsaved content.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../db";

/** The unsaved value for an entity key ("section:home", "hero_slides:all"), or null. */
export async function readPreviewDraft(key: string): Promise<unknown | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [row] = await db.select({ data: schema.previewDrafts.data }).from(schema.previewDrafts).where(eq(schema.previewDrafts.key, key));
    return row?.data ?? null;
  } catch (error) {
    console.error("[preview] could not read a draft", error);
    return null;
  }
}
