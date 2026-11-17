import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getSectorList } from "@/lib/admin/queries";
import { verifySession } from "@/lib/auth/dal";
import { formatRelative } from "@/lib/format";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Sectors" };

export default function SectorsAdminPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SectorsAdminPageContent />
    </Suspense>
  );
}

async function SectorsAdminPageContent() {
  await verifySession();
  const sectors = await getSectorList();
  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-navy sm:text-3xl">Sectors</h1>
        <p className="mt-2 max-w-2xl text-muted">Choose a sector to edit its name, card summary, page text and areas of focus.</p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {sectors.map((s) => (
          <li key={s.slug} className="min-w-0">
            <Link
              href={`/admin/sectors/${s.slug}`}
              className="group flex h-full min-w-0 flex-col gap-3 rounded-lg border border-line bg-white p-5 transition-colors hover:border-navy"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-mist text-gold-deep">
                  <Icon name={s.icon} size={22} />
                </span>
                <span className="min-w-0 text-lg font-bold [overflow-wrap:anywhere] text-navy">{s.name}</span>
              </span>
              <span className="text-sm [overflow-wrap:anywhere] text-muted">{s.summary}</span>
              <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
                <span className="text-muted">{s.lastSavedAt ? `Last saved ${formatRelative(s.lastSavedAt)}` : "Not changed yet"}</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-navy group-hover:text-gold-deep">
                  Edit
                  <Icon name="arrow" size={16} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
