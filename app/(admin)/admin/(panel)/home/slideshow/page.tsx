import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SlideshowManager } from "@/components/admin/list/SlideshowManager";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { Icon } from "@/components/Icon";
import { listVersions, readEntity } from "@/lib/admin/content-store";
import { verifySession } from "@/lib/auth/dal";
import { requireDb, schema } from "@/lib/db";

export const metadata: Metadata = { title: "Slideshow photos" };

export default function SlideshowPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SlideshowContent />
    </Suspense>
  );
}

async function SlideshowContent() {
  await verifySession();
  const [slides, rows, versions] = await Promise.all([
    readEntity({ type: "hero_slides", id: "all" }),
    requireDb().select({ id: schema.heroSlides.id, updatedAt: schema.heroSlides.updatedAt }).from(schema.heroSlides),
    listVersions([{ type: "hero_slides", id: "all" }], 1),
  ]);
  const updatedAt = new Map(rows.map((r) => [r.id, r.updatedAt.toISOString()]));
  const items = slides
    .filter((s) => s.id !== undefined)
    .map((s) => ({
      id: s.id!,
      title: s.alt,
      thumb: { src: s.src, alt: s.alt },
      updatedAt: updatedAt.get(s.id!),
      visible: s.visible,
      width: s.width,
      height: s.height,
    }));

  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <header className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <li className="flex items-center gap-1.5">
              <Link href="/admin" className="inline-flex min-h-11 items-center hover:text-navy hover:underline">Dashboard</Link>
              <Icon name="chevron" size={13} />
            </li>
            <li className="flex items-center gap-1.5">
              <Link href="/admin/home" className="inline-flex min-h-11 items-center hover:text-navy hover:underline">Home page</Link>
              <Icon name="chevron" size={13} />
            </li>
            <li aria-current="page" className="font-semibold text-navy">Slideshow photos</li>
          </ol>
        </nav>
        <p className="text-xs font-bold tracking-[0.14em] text-gold-deep uppercase">Home page</p>
        <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">Slideshow photos</h1>
        <p className="max-w-2xl text-muted">
          The photos behind the home page headline, in the order they appear. Select a description to edit it. Use the Visible switch to hide a photo without deleting it.
        </p>
      </header>
      <SlideshowManager slides={items} canUndo={versions.length > 0} />
    </main>
  );
}
