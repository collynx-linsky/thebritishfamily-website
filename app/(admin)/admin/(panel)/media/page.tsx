import type { Metadata } from "next";
import { Suspense } from "react";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { verifySession } from "@/lib/auth/dal";
import { listLibrary } from "@/lib/media/library";

export const metadata: Metadata = { title: "Media library" };

export default function MediaPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MediaContent />
    </Suspense>
  );
}

async function MediaContent() {
  await verifySession();
  const items = await listLibrary();
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-gold-deep uppercase">Media and news</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-navy sm:text-4xl">Media library</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Every photo you upload, in one place. Select a photo to describe it, choose its framing, or see where it is used. Photos are resized automatically.
        </p>
      </header>
      <MediaLibrary items={items} />
    </main>
  );
}
