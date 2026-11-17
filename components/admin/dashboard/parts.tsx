import Link from "next/link";
import type { ActivityEntry } from "@/lib/admin/activity";
import type { ChecklistLine } from "@/lib/admin/review";
import { formatRelative } from "@/lib/format";
import type { IconName } from "@/lib/site";
import { Icon } from "../../Icon";
import { CountUp } from "../../motion/CountUp";

/* ------------------------------------------------------------------
   Stat card
   ------------------------------------------------------------------ */

export function StatCard({
  href,
  value,
  suffix,
  label,
  detail,
  attention = false,
}: {
  href: string;
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  /** Outlined in gold: something here needs doing */
  attention?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full min-w-0 flex-col gap-1 rounded-xl border bg-white p-5 transition-[border-color,box-shadow] hover:shadow-card ${
        attention ? "border-gold ring-1 ring-gold/40" : "border-paper-line hover:border-navy/30"
      }`}
    >
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-4xl leading-none font-extrabold text-navy">
          <CountUp value={value} onLoad durationMs={900} />
        </span>
        {suffix ? <span className="text-lg font-bold text-muted">{suffix}</span> : null}
      </span>
      <span className="mt-1 font-semibold text-navy">{label}</span>
      <span className="text-sm [overflow-wrap:anywhere] text-muted">{detail}</span>
      <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-navy group-hover:text-gold-deep">
        Open
        <Icon name="arrow" size={15} className="transition-transform motion-safe:group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------
   Quick actions
   ------------------------------------------------------------------ */

const QUICK_ACTIONS: { href: string; icon: IconName; title: string; text: string }[] = [
  { href: "/admin/home#main-headline", icon: "home", title: "Edit the headline", text: "Home page hero" },
  { href: "/admin/contact", icon: "pin", title: "Contact details", text: "Phones, email, address" },
  { href: "/admin/sectors", icon: "building", title: "Sector text", text: "The four sectors" },
  { href: "/admin/leadership", icon: "users", title: "Directors", text: "Names and biographies" },
  { href: "/admin/pages", icon: "search", title: "Google listing", text: "Titles and descriptions" },
  { href: "/admin/account", icon: "key", title: "Change password", text: "Keep it safe" },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-title">
      <h2 id="quick-title" className="font-display text-xl font-extrabold text-navy">
        Quick actions
      </h2>
      <ul className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group flex h-full min-h-20 items-center gap-3 rounded-xl border border-paper-line bg-white p-4 transition-[border-color,box-shadow] hover:border-navy/30 hover:shadow-card"
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-paper text-gold-deep transition-colors group-hover:bg-navy group-hover:text-gold">
                <Icon name={a.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-navy">{a.title}</span>
                <span className="block text-sm text-muted">{a.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------
   Website content overview
   ------------------------------------------------------------------ */

export type OverviewRow = {
  href: string;
  icon: IconName;
  label: string;
  count?: string;
  lastChangedAt: Date | null;
  soon?: boolean;
};

export function ContentOverview({ rows, now }: { rows: OverviewRow[]; now: Date }) {
  return (
    <section aria-labelledby="overview-title" className="rounded-xl border border-paper-line bg-white">
      <div className="px-5 pt-5 sm:px-6">
        <h2 id="overview-title" className="font-display text-xl font-extrabold text-navy">
          Website content
        </h2>
        <p className="mt-1 text-sm text-muted">Every part of the website, with what it holds and when it last changed.</p>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {rows.map((row) => (
          <li key={row.href}>
            <Link href={row.href} className="group flex min-h-16 items-center gap-3 px-5 py-3 transition-colors hover:bg-paper sm:px-6">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-paper text-navy">
                <Icon name={row.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 font-semibold text-navy">
                  {row.label}
                  {row.soon ? (
                    <span className="rounded-sm bg-paper px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wide text-muted uppercase">Soon</span>
                  ) : null}
                </span>
                <span className="block text-sm text-muted">
                  {[row.count, row.lastChangedAt ? `changed ${formatRelative(row.lastChangedAt, now)}` : "not changed since setup"]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <Icon name="chevron" size={16} className="shrink-0 text-muted group-hover:text-navy" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------
   Launch checklist
   ------------------------------------------------------------------ */

export function LaunchChecklist({ lines }: { lines: ChecklistLine[] }) {
  const done = lines.filter((l) => l.done).length;
  return (
    <section id="launch" aria-labelledby="launch-title" className="scroll-mt-24 rounded-xl border border-paper-line bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="launch-title" className="font-display text-xl font-extrabold text-navy">
          Ready for launch
        </h2>
        <span className="text-sm font-semibold text-muted">
          {done} of {lines.length} done
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper" aria-hidden="true">
        <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${(done / lines.length) * 100}%` }} />
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {lines.map((line) => {
          const body = (
            <>
              <span
                className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full ${line.done ? "bg-gold text-ink" : "border-2 border-line"}`}
              >
                {line.done ? <Icon name="check" size={14} strokeWidth={2.6} /> : null}
                <span className="sr-only">{line.done ? "Done: " : "To do: "}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className={`flex flex-wrap items-center gap-x-2 font-semibold ${line.done ? "text-muted" : "text-navy"}`}>
                  {line.label}
                  {line.developer ? (
                    <span className="rounded-sm bg-paper px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wide text-muted uppercase">Developer</span>
                  ) : null}
                </span>
                <span className="block text-sm text-muted">{line.detail}</span>
              </span>
            </>
          );
          return (
            <li key={line.label}>
              {line.href && !line.done ? (
                <a href={line.href} className="flex gap-3 rounded-lg p-1 hover:bg-paper">
                  {body}
                </a>
              ) : (
                <div className="flex gap-3 p-1">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------
   Recent activity
   ------------------------------------------------------------------ */

export const activityIcon = (action: string): IconName =>
  action === "auth.signin" ? "user" : action === "auth.signout" || action === "auth.devices" ? "logout" : action === "auth.password" ? "key" : action.startsWith("review.") ? "check" : "file";

export function RecentActivity({ entries, now }: { entries: ActivityEntry[]; now: Date }) {
  return (
    <section aria-labelledby="activity-title" className="rounded-xl border border-paper-line bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="activity-title" className="font-display text-xl font-extrabold text-navy">
          Recent activity
        </h2>
        <Link href="/admin/activity" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy hover:text-gold-deep">
          View all
        </Link>
      </div>
      {entries.length ? (
        <ol className="mt-2 flex flex-col">
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3 border-b border-line py-3 last:border-0">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-paper text-navy">
                <Icon name={activityIcon(e.action)} size={15} />
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block font-semibold [overflow-wrap:anywhere] text-navy">{e.summary}</span>
                <span className="block text-muted">
                  {e.who ?? "Someone"} · <time dateTime={e.at.toISOString()}>{formatRelative(e.at, now)}</time>
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing yet. Saves, sign-ins and other changes will appear here.</p>
      )}
    </section>
  );
}
