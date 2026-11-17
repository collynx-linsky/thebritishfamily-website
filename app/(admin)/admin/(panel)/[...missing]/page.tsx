import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { Icon } from "@/components/Icon";
import { verifySession } from "@/lib/auth/dal";
import type { IconName } from "@/lib/site";

export const metadata: Metadata = { title: "Page not found" };

/** Areas that are planned but not built yet, so the page can say so plainly */
const COMING: Record<string, { label: string; icon: IconName; what: string; site: string }> = {
  gallery: { label: "Gallery", icon: "image", what: "add, replace, reorder and hide photos", site: "/gallery" },
  news: { label: "News", icon: "news", what: "write, edit and publish news stories", site: "/news" },
  downloads: { label: "Downloads", icon: "download", what: "upload and manage the company profile and forms", site: "/downloads" },
};

/** Friendly page for unknown admin addresses and areas still being built (real routes take priority). */
export default function AdminMissingPage({ params }: { params: Promise<{ missing: string[] }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminMissingContent params={params} />
    </Suspense>
  );
}

async function AdminMissingContent({ params }: { params: Promise<{ missing: string[] }> }) {
  await verifySession();
  const { missing } = await params;
  const coming = missing.length === 1 ? COMING[missing[0]] : undefined;

  return (
    <main id="main" className="outline-none" tabIndex={-1}>
      <div className="max-w-2xl rounded-xl border border-paper-line bg-white p-6 sm:p-9">
        {coming ? (
          <>
            <span className="inline-flex size-12 items-center justify-center rounded-lg bg-paper text-gold-deep">
              <Icon name={coming.icon} size={24} />
            </span>
            <p className="mt-5 text-xs font-bold tracking-[0.14em] text-gold-deep uppercase">Coming soon</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-navy">{coming.label}</h1>
            <p className="mt-3 text-muted">
              This is where you will {coming.what}. It is being built now. Until then, the website shows the current {coming.label.toLowerCase()} as it
              is.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin" className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 font-semibold text-white hover:bg-navy-deep">
                Back to the dashboard
              </Link>
              <a
                href={coming.site}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 px-5 font-semibold text-navy hover:border-navy"
              >
                See it on the website
                <Icon name="external" size={16} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-extrabold text-navy">This page isn&apos;t available</h1>
            <p className="mt-3 text-muted">The address may be mistyped. Use the menu, or search with the box at the top.</p>
            <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-navy px-5 font-semibold text-white hover:bg-navy-deep">
              Back to the dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
