"use server";

/**
 * Media library actions. Each checks the session itself.
 */
import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { recordActivity } from "@/lib/admin/activity";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/site-content";
import { requireDb, schema } from "@/lib/db";
import { deleteMediaFile, getMedia, listLibrary, type LibraryItem } from "@/lib/media/library";
import { findUsage } from "@/lib/media/usage";

export type MediaActionResult = { ok: true; message: string } | { ok: false; message: string; field?: "alt" };

async function guarded(task: (userId: number) => Promise<MediaActionResult>): Promise<MediaActionResult> {
  try {
    const session = await requireAdmin();
    return await task(session.userId);
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, message: error.message };
    console.error("[admin] media action failed", error);
    return { ok: false, message: "That didn't work. Please try again." };
  }
}

/** The library for the photo picker (images only). */
export async function listPickerMedia(): Promise<LibraryItem[]> {
  await requireAdmin();
  return (await listLibrary()).filter((m) => m.kind === "image");
}

const details = z.object({
  alt: z.string().trim().min(1, "Describe the photo, for visitors who can't see it.").max(160, "Keep this under 160 characters."),
  focalX: z.int().min(0).max(100),
  focalY: z.int().min(0).max(100),
});

export async function updateMediaDetails(id: number, input: { alt: string; focalX: number; focalY: number }): Promise<MediaActionResult> {
  return guarded(async (userId) => {
    const parsed = details.safeParse(input);
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, field: "alt" };
    const record = await getMedia(id);
    if (!record) return { ok: false, message: "That photo no longer exists." };
    await requireDb()
      .update(schema.media)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.media.id, id));
    // The focal point changes how the photo is cropped on public pages
    updateTag(TAGS.media);
    refresh();
    await recordActivity({ userId, action: "content.save", summary: "Updated a photo's description and framing", href: "/admin/media" });
    return { ok: true, message: "Saved." };
  });
}

export async function deleteMedia(id: number): Promise<MediaActionResult> {
  return guarded(async (userId) => {
    const record = await getMedia(id);
    if (!record) return { ok: false, message: "That photo no longer exists." };
    const usedIn = (await findUsage(requireDb())).get(record.url) ?? [];
    if (usedIn.length) {
      return { ok: false, message: `This photo is still used: ${usedIn.map((u) => u.label).join("; ")}. Replace it there first.` };
    }
    await deleteMediaFile(record);
    refresh();
    await recordActivity({ userId, action: "content.save", summary: `Deleted a photo from the library${record.originalName ? ` (${record.originalName})` : ""}`, href: "/admin/media" });
    return { ok: true, message: "The photo was deleted." };
  });
}
