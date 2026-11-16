import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ADMIN_AREAS } from "@/lib/admin/areas";
import { getAreaStatuses } from "@/lib/admin/queries";
import { verifySession } from "@/lib/auth/dal";
import { formatRelative } from "@/lib/format";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/admin/PageSkeleton";

export const metadata: Metadata = { title: "Dashboard" };

const itemNoun: Record<string, [string, string]> = {
  home: ["slideshow photo", "slideshow photos"],
  sectors: ["sector", "sectors"],
  leadership: ["director", "directors"],
  gallery: ["photo", "photos"],
  news: ["article", "articles"],
  downloads: ["document", "documents"],
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}

async function DashboardPageContent() {
  const session = await verifySession();
  const statuses = await getAreaStatuses();
  const now = new Date();

  return (
    <main id="main" className="outline-none" tabIndex={-1}>
      <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      <p className="mt-2 text-muted">
        Welcome. Choose what you want to change. Each area matches a part of the website.
        <span className="sr-only"> Signed in as {session.email}.</span>
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_AREAS.map((area) => {
          const status = statuses.find((s) => s.key === area.key);
          const noun = itemNoun[area.key];
          return (
            <li key={area.key}>
              <article className="flex h-full flex-col gap-3 rounded-lg border border-line bg-white p-5 transition-shadow hover:shadow-card">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-mist text-navy">
                    <Icon name={area.icon} size={20} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-navy">{area.label}</h2>
                    <p className="mt-0.5 text-sm text-muted">{area.description}</p>
                  </div>
                </div>

                <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
                  <div className="flex gap-1">
                    <dt>Last changed:</dt>
                    <dd className="font-semibold text-ink">
                      {status?.lastChangedAt ? (
                        <time dateTime={status.lastChangedAt.toISOString()}>{formatRelative(status.lastChangedAt, now)}</time>
                      ) : (
                        "not changed since setup"
                      )}
                    </dd>
                  </div>
                  {noun && status?.itemCount !== undefined ? (
                    <div className="flex gap-1">
                      <dt className="sr-only">Items:</dt>
                      <dd className="font-semibold text-ink">
                        {status.itemCount} {status.itemCount === 1 ? noun[0] : noun[1]}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={area.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
                  >
                    Edit
                    <span className="sr-only"> {area.label}</span>
                  </Link>
                  <a
                    href={area.viewOnSite}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-sm px-3 text-sm font-semibold text-navy hover:bg-mist"
                  >
                    View on site
                    <Icon name="external" size={14} strokeWidth={2} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
