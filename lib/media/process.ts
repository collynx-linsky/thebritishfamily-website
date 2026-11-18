/**
 * Turning an uploaded photo into what the website stores.
 *
 * The file is decoded with sharp, so the server knows what it really is
 * whatever its name or the type the browser claimed: only JPEG, PNG and
 * WebP pass. The camera's rotation is applied, very large photos are scaled
 * down, and the result is saved as WebP, which also drops all hidden
 * metadata (phone photos carry the GPS location where they were taken).
 */
import sharp, { type Metadata } from "sharp";

export const ACCEPTED_IMAGE_FORMATS = ["jpeg", "png", "webp"] as const;
/** Largest upload accepted (browsers shrink big photos before sending) */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
/** Longest side kept; next/image serves smaller versions to visitors */
const MAX_DIMENSION = 2400;
const MIN_DIMENSION = 200;

export class ImageRejectedError extends Error {}

export type ProcessedImage = { buffer: Buffer; width: number; height: number; blurDataUrl: string };

export async function processImage(bytes: Buffer): Promise<ProcessedImage> {
  if (bytes.length > MAX_IMAGE_BYTES) throw new ImageRejectedError("That file is too large. Please choose a photo under 4 MB.");

  let meta: Metadata;
  try {
    meta = await sharp(bytes, { failOn: "error" }).metadata();
  } catch {
    throw new ImageRejectedError("That file isn't a photo the website can use. Please choose a JPEG, PNG or WebP image.");
  }
  if (!meta.format || !(ACCEPTED_IMAGE_FORMATS as readonly string[]).includes(meta.format)) {
    throw new ImageRejectedError("Please choose a JPEG, PNG or WebP image.");
  }
  if ((meta.width ?? 0) < MIN_DIMENSION || (meta.height ?? 0) < MIN_DIMENSION) {
    throw new ImageRejectedError(`That photo is too small (at least ${MIN_DIMENSION} × ${MIN_DIMENSION} pixels is needed).`);
  }

  const { data, info } = await sharp(bytes, { failOn: "error" })
    .rotate() // follow the camera's orientation, then forget it
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const tiny = await sharp(data).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return { buffer: data, width: info.width, height: info.height, blurDataUrl: `data:image/webp;base64,${tiny.toString("base64")}` };
}

/** A safe display name for the file the person chose (shown in the library only). */
export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  return base.replace(/[^\p{L}\p{N} ._()-]/gu, "").slice(0, 120);
}
