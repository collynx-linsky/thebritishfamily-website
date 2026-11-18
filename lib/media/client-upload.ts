/**
 * Uploading a photo from the browser (admin only).
 *
 * Big phone photos are shrunk in the browser before sending (longest side
 * 2400 px), which keeps uploads fast on mobile data and under the hosting
 * limit (4.5 MB per request). The server still checks and converts every
 * file itself (lib/media/process.ts); this step is only for speed.
 */
import type { MediaRecord } from "./library";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SEND_AS_IS_BELOW = 3.5 * 1024 * 1024;
const MAX_SIDE = 2400;

export class UploadError extends Error {}

async function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new UploadError("The photo could not be prepared."))), "image/jpeg", quality));
}

/** Check the type and shrink large photos; returns what to send. */
export async function prepareImage(file: File): Promise<Blob> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new UploadError(`“${file.name}” is not a JPEG, PNG or WebP photo.`);
  if (file.size <= SEND_AS_IS_BELOW) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new UploadError(`“${file.name}” could not be opened. Try saving it as a JPEG first.`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let blob = await toBlob(canvas, 0.88);
  if (blob.size > SEND_AS_IS_BELOW) blob = await toBlob(canvas, 0.75);
  return blob;
}

/** Send a photo to the server, reporting progress (0 to 1). */
export function uploadImage(
  file: File,
  options: { status: "library" | "pending"; alt?: string; onProgress?: (fraction: number) => void },
): Promise<MediaRecord> {
  return prepareImage(file).then(
    (body) =>
      new Promise<MediaRecord>((resolve, reject) => {
        const form = new FormData();
        form.append("file", body, file.name);
        form.append("status", options.status);
        if (options.alt) form.append("alt", options.alt);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/admin/media/upload");
        xhr.responseType = "json";
        xhr.upload.onprogress = (e) => e.lengthComputable && options.onProgress?.(e.loaded / e.total);
        xhr.onload = () => {
          const data = xhr.response as { media?: MediaRecord; error?: string } | null;
          if (xhr.status === 201 && data?.media) resolve(data.media);
          else reject(new UploadError(data?.error ?? "The photo could not be uploaded. Please try again."));
        };
        xhr.onerror = () => reject(new UploadError("The connection dropped during the upload. Please try again."));
        xhr.send(form);
      }),
  );
}
