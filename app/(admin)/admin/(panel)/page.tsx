import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { AttentionPanel } from "@/components/admin/dashboard/AttentionPanel";
import { FirstVisitWelcome } from "@/components/admin/dashboard/FirstVisitWelcome";
import { Greeting } from "@/components/admin/dashboard/Greeting";
import { ContentOverview, LaunchChecklist, QuickActions, RecentActivity, StatCard, type OverviewRow } from "@/components/admin/dashboard/parts";
import { PageSkeleton } from "@/components/admin/PageSkeleton";
import { Icon } from "@/components/Icon";
import { countContentChangesSince, listActivity } from "@/lib/admin/activity";
import { ADMIN_AREAS } from "@/lib/admin/areas";
import { getAreaStatuses } from "@/lib/admin/queries";
import { countNews, getLaunchChecklist, getReviewItems } from "@/lib/admin/review";
import { verifySession } from "@/lib/auth/dal";
import { requireDb, schema } from "@/lib/db";
import { formatRelative, startOfMonthInSiteZone } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const itemNoun: Record<string, [string, string]> = {
  home: ["slideshow photo", "slideshow photos"],
  sectors: ["sector", "sectors"],
  leadership: ["director", "directors"],
  gallery: ["photo", "photos"],
  news: ["story", "stories"],
  downloads: ["document", "documents"],
};

/** Areas not managed in the admin yet (they say "Soon") */
const SOON = new Set(["gallery", "news", "downloads"]);

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await verifySession();
  const now = new Date();
  const monthStart = startOfMonthInSiteZone(now);
  const [statuses, reviewItems, activity, changesThisMonth, newsCount, [user]] = await Promise.all([
    getAreaStatuses(),
    getReviewItems(),
    listActivity(6),
    countContentChangesSince(monthStart),
    countNews(),
    requireDb().select({ onboardedAt: schema.adminUsers.onboardedAt }).from(schema.adminUsers).where(eq(schema.adminUsers.id, session.userId)),
  ]);
  const checklist = getLaunchChecklist(reviewItems);
  const openItems = reviewItems.filter((i) => !i.reviewed).length;
  const doneSteps = checklist.filter((l) => l.done).length;
  const lastChange = activity.find((a) => a.action.startsWith("content."));

  const overview: OverviewRow[] = ADMIN_AREAS.map((area) => {
    const status = statuses.find((s) => s.key === area.key);
    const noun = itemNoun[area.key];
    return {
      href: area.href,
      icon: area.icon,
      label: area.label,
      count: noun && status?.itemCount !== undefined ? `${status.itemCount} ${status.itemCount === 1 ? noun[0] : noun[1]}` : undefined,
      lastChangedAt: status?.lastChangedAt ?? null,
      soon: SOON.has(area.key),
    };
  });

  return (
    <main id="main" tabIndex={-1} className="flex flex-col gap-6 outline-none">
      {/* Welcome banner */}
      <section aria-labelledby="dashboard-title" className="on-dark relative isolate overflow-hidden rounded-2xl bg-navy-deep px-6 py-8 text-white sm:px-9 sm:py-10">
        <span aria-hidden="true" className="absolute -top-24 -right-20 -z-10 hidden aspect-square w-80 rounded-full border-[1.5rem] border-gold sm:block" />
        <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Dashboard</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
          Welcome back, {session.displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-on-navy sm:text-lg">
          <Greeting />. Everything you change here goes live on the website as soon as you save, and every change can be undone.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-gold px-5 font-bold text-ink transition-colors hover:bg-gold-bright"
          >
            Open the website
            <Icon name="external" size={16} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a href="#attention" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 px-5 font-bold text-white transition-colors hover:border-gold hover:text-gold">
            {openItems ? `Review what needs attention (${openItems})` : "Nothing needs attention"}
          </a>
        </div>
      </section>

      {user && !user.onboardedAt ? <FirstVisitWelcome /> : null}

      {/* Stat cards */}
      <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4" aria-label="At a glance">
        <li>
          <StatCard
            href="/admin/activity"
            value={changesThisMonth}
            label={changesThisMonth === 1 ? "Change this month" : "Changes this month"}
            detail={lastChange ? `Last: ${lastChange.summary}, ${formatRelative(lastChange.at, now)}.` : "No changes yet this month."}
          />
        </li>
        <li>
          <StatCard
            href="#attention"
            value={openItems}
            label="Need attention"
            detail={openItems ? "Sample photos, sample content and details to confirm." : "Nothing left to check."}
            attention={openItems > 0}
          />
        </li>
        <li>
          <StatCard href="#launch" value={doneSteps} suffix={`of ${checklist.length}`} label="Launch steps done" detail="What is left before the site goes public." />
        </li>
        <li>
          <StatCard href="/admin/news" value={newsCount} label={newsCount === 1 ? "News story" : "News stories"} detail="Writing and publishing news arrives soon." />
        </li>
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <QuickActions />
          <ContentOverview rows={overview} now={now} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <AttentionPanel items={reviewItems} />
          <LaunchChecklist lines={checklist} />
          <RecentActivity entries={activity} now={now} />
        </div>
      </div>
    </main>
  );
}
