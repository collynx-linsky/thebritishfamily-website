/**
 * Where uploaded files are stored.
 *
 * - Vercel Blob whenever BLOB_READ_WRITE_TOKEN is set (production, and
 *   locally when the token is copied into .env.local).
 * - Local disk (public/dev-uploads/) only in development without a token,
 *   so uploads can be built and tested before the Blob store exists. It can
 *   never run in production: choosing it there throws, and the adapter
 *   itself refuses to write when NODE_ENV is "production" (Vercel's
 *   filesystem is read-only and not kept between requests anyway).
 */
import "server-only";
import { del, put } from "@vercel/blob";

export type StoredFile = { url: string; pathname: string };

export type Storage = {
  name: "vercel-blob" | "local-dev";
  save(pathname: string, body: Buffer, contentType: string): Promise<StoredFile>;
  remove(file: { url: string; pathname: string }): Promise<void>;
};

const isProduction = process.env.NODE_ENV === "production";

const blobStorage: Storage = {
  name: "vercel-blob",
  async save(pathname, body, contentType) {
    const result = await put(pathname, body, {
      access: "public",
      contentType,
      // Names are random already (lib/media/upload.ts); never overwrite
      addRandomSuffix: false,
      allowOverwrite: false,
      // Files never change at the same address, so caches may keep them long
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: result.url, pathname: result.pathname };
  },
  async remove(file) {
    await del(file.url);
  },
};

const LOCAL_ROOT = "dev-uploads";

const localDevStorage: Storage = {
  name: "local-dev",
  async save(pathname, body) {
    if (isProduction) throw new Error("Local file storage is for development only.");
    const { mkdir, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(process.cwd(), "public", LOCAL_ROOT, ...pathname.split("/"));
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body, { flag: "wx" }); // never overwrite
    return { url: `/${LOCAL_ROOT}/${pathname}`, pathname };
  },
  async remove(file) {
    if (isProduction) throw new Error("Local file storage is for development only.");
    const { rm } = await import("node:fs/promises");
    const path = await import("node:path");
    await rm(path.join(process.cwd(), "public", LOCAL_ROOT, ...file.pathname.split("/")), { force: true });
  },
};

export class UploadsNotConfiguredError extends Error {
  constructor() {
    super("Photo uploads are not set up yet: the website's file storage (Vercel Blob) still needs connecting.");
  }
}

/** The storage to use now; throws in production when Blob is not connected. */
export function getStorage(): Storage {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStorage;
  if (isProduction) throw new UploadsNotConfiguredError();
  return localDevStorage;
}

/** Storage that can delete a given file (by where its URL points). */
export function storageFor(url: string): Storage {
  if (url.startsWith(`/${LOCAL_ROOT}/`)) {
    if (isProduction) throw new Error("Local file storage is for development only.");
    return localDevStorage;
  }
  return blobStorage;
}
