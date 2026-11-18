/**
 * The media library: recording uploads and reading them back for the admin.
 */
import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireDb, schema } from "../db";
import { cleanFileName, processImage } from "./process";
import { getStorage, storageFor } from "./storage";
import { findUsage, type Usage } from "./usage";

export type MediaRecord = {
  id: number;
  url: string;
  kind: "image" | "document";
  width: number | null;
  height: number | null;
  alt: string;
  focalX: number;
  focalY: number;
  blurDataUrl: string | null;
  originalName: string;
  sizeBytes: number;
  createdAt: string;
};

export type LibraryItem = MediaRecord & { usage: Usage[] };

const toRecord = (r: typeof schema.media.$inferSelect): MediaRecord => ({
  id: r.id,
  url: r.url,
  kind: r.kind,
  width: r.width,
  height: r.height,
  alt: r.alt,
  focalX: r.focalX,
  focalY: r.focalY,
  blurDataUrl: r.blurDataUrl,
  originalName: r.originalName,
  sizeBytes: r.sizeBytes,
  createdAt: r.createdAt.toISOString(),
});

/**
 * Store an uploaded photo: check and convert it, save the file under a name
 * the server generates, and record it. If recording fails, the file is
 * removed again so nothing is left behind.
 */
export async function createImageMedia(input: { bytes: Buffer; fileName: string; alt: string; status: "library" | "pending"; userId: number }): Promise<MediaRecord> {
  const image = await processImage(input.bytes);
  const storage = getStorage();
  const pathname = `media/${new Date().getUTCFullYear()}/${randomBytes(12).toString("hex")}.webp`;
  const stored = await storage.save(pathname, image.buffer, "image/webp");
  try {
    const [row] = await requireDb()
      .insert(schema.media)
      .values({
        url: stored.url,
        pathname: stored.pathname,
        kind: "image",
        contentType: "image/webp",
        sizeBytes: image.buffer.length,
        width: image.width,
        height: image.height,
        alt: input.alt.trim().slice(0, 160),
        blurDataUrl: image.blurDataUrl,
        originalName: cleanFileName(input.fileName),
        status: input.status,
        createdBy: input.userId,
      })
      .returning();
    return toRecord(row);
  } catch (error) {
    await storage.remove(stored).catch(() => {});
    throw error;
  }
}

/** Everything in the library (plus pending uploads), newest first, with where each is used. */
export async function listLibrary(): Promise<LibraryItem[]> {
  const db = requireDb();
  const [rows, usage] = await Promise.all([db.select().from(schema.media).orderBy(desc(schema.media.createdAt), desc(schema.media.id)), findUsage(db)]);
  return rows.map((r) => ({ ...toRecord(r), usage: usage.get(r.url) ?? [] }));
}

export async function getMedia(id: number): Promise<MediaRecord | null> {
  const [row] = await requireDb().select().from(schema.media).where(eq(schema.media.id, id));
  return row ? toRecord(row) : null;
}

/** Once saved content refers to an upload, it is no longer a pending orphan. */
export async function markMediaInUse(urls: string[]): Promise<void> {
  if (!urls.length) return;
  await requireDb()
    .update(schema.media)
    .set({ status: "library", updatedAt: new Date() })
    .where(and(inArray(schema.media.url, urls), eq(schema.media.status, "pending")));
}

/** URLs of stored media mentioned anywhere in a value (saved content, drafts). */
export function mediaUrlsIn(value: unknown): string[] {
  const text = JSON.stringify(value) ?? "";
  return [...new Set(text.match(/(?:https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com|\/dev-uploads)\/media\/[^"\\\s]+/gi) ?? [])];
}

/** Delete a library file and its record (callers check it is unused first). */
export async function deleteMediaFile(record: { id: number; url: string; pathname?: string }): Promise<void> {
  const db = requireDb();
  const [row] = await db.select({ url: schema.media.url, pathname: schema.media.pathname }).from(schema.media).where(eq(schema.media.id, record.id));
  if (!row) return;
  await storageFor(row.url).remove(row);
  await db.delete(schema.media).where(eq(schema.media.id, record.id));
}
