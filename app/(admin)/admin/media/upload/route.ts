import { recordActivity } from "@/lib/admin/activity";
import { getSession } from "@/lib/auth/session";
import { createImageMedia } from "@/lib/media/library";
import { ImageRejectedError, MAX_IMAGE_BYTES } from "@/lib/media/process";
import { UploadsNotConfiguredError } from "@/lib/media/storage";

/**
 * Photo upload for the admin (multipart form: file, alt, status).
 * Signed-in admins only, same site only. The file is checked and converted
 * on the server (lib/media/process.ts) and stored under a generated name.
 */
export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Not allowed." }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Your session has ended. Please sign in again." }, { status: 401 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_IMAGE_BYTES + 64 * 1024) return Response.json({ error: "That file is too large. Please choose a photo under 4 MB." }, { status: 413 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "The upload could not be read. Please try again." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a photo to upload." }, { status: 400 });
  const status = form.get("status") === "library" ? "library" : "pending";
  const alt = typeof form.get("alt") === "string" ? String(form.get("alt")) : "";

  try {
    const record = await createImageMedia({ bytes: Buffer.from(await file.arrayBuffer()), fileName: file.name, alt, status, userId: session.userId });
    await recordActivity({ userId: session.userId, action: "content.save", summary: `Uploaded a photo${record.originalName ? ` (${record.originalName})` : ""}`, href: "/admin/media" });
    return Response.json({ media: record }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ImageRejectedError) return Response.json({ error: error.message }, { status: 422 });
    if (error instanceof UploadsNotConfiguredError) return Response.json({ error: error.message }, { status: 503 });
    console.error("[media] upload failed", error);
    return Response.json({ error: "The photo could not be saved. Please try again." }, { status: 500 });
  }
}
