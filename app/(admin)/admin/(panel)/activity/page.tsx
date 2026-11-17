import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { activityIcon } from "@/components/admin/dashboard/parts";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { Icon } from "@/components/Icon";
import { listActivity, type ActivityEntry } from "@/lib/admin/activity";
import { verifySession } from "@/lib/auth/dal";
import { formatRelative, SITE_TIME_ZONE } from "@/lib/format";

export const metadata: Metadata = { title: "Activity" };

// Shown in Tanzania time (the server itself runs on UTC)
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: SITE_TIME_ZONE });
const timeLabel = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SITE_TIME_ZONE });

export default function ActivityPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ActivityContent />
    </Suspense>
  );
}

async function ActivityContent() {
  await verifySession();
  const now = new Date();
  const entries = await listActivity(200);

  // Group by day, newest first
  const days = new Map<string, ActivityEntry[]>();
  for (const e of entries) {
    const key = dayLabel.format(e.at);
    days.set(key, [...(days.get(key) ?? []), e]);
  }

  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-gold-deep uppercase">Overview</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-navy">Activity</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Everything that has changed in the admin, newest first: saves, undos, sign-ins and account changes. Select a line to open what it is about.
        </p>
      </header>

      {entries.length ? (
        [...days].map(([day, list]) => (
          <section key={day} aria-label={day} className="rounded-xl border border-paper-line bg-white">
            <h2 className="border-b border-line px-5 py-3 text-sm font-bold text-navy sm:px-6">{day}</h2>
            <ol>
              {list.map((e) => {
                const body = (
                  <>
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-paper text-navy">
                      <Icon name={activityIcon(e.action)} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold [overflow-wrap:anywhere] text-navy">{e.summary}</span>
                      <span className="block text-sm text-muted">
                        {e.who ?? "Someone"} · <time dateTime={e.at.toISOString()}>{timeLabel.format(e.at)}</time>
                        <span className="sr-only"> ({formatRelative(e.at, now)})</span>
                      </span>
                    </span>
                    {e.href ? <Icon name="chevron" size={16} className="shrink-0 text-muted" /> : null}
                  </>
                );
                return (
                  <li key={e.id} className="border-b border-line last:border-0">
                    {e.href ? (
                      <Link href={e.href} className="flex min-h-16 items-center gap-3 px-5 py-3 hover:bg-paper sm:px-6">
                        {body}
                      </Link>
                    ) : (
                      <div className="flex min-h-16 items-center gap-3 px-5 py-3 sm:px-6">{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      ) : (
        <div className="rounded-xl border border-paper-line bg-white p-8 text-center">
          <p className="font-semibold text-navy">Nothing has happened yet.</p>
          <p className="mt-1 text-sm text-muted">When you save a change or sign in, it will be listed here.</p>
        </div>
      )}
    </main>
  );
}
