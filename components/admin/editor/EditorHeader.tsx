import Link from "next/link";
import { formatRelative } from "@/lib/format";
import { Icon } from "../../Icon";

/** Title, explanation, "last saved" and "View on site" above an editor. */
export function EditorHeader({
  title,
  intro,
  viewHref,
  lastSavedAt,
  back,
}: {
  title: string;
  intro: React.ReactNode;
  viewHref: string;
  lastSavedAt: string | null;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-3">
      {back ? (
        <Link href={back.href} className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-navy hover:text-gold-deep">
          <Icon name="arrow" size={16} className="rotate-180" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold [overflow-wrap:anywhere] text-navy sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{intro}</p>
          <p className="mt-2 text-sm text-muted">
            {lastSavedAt ? <>Last saved {formatRelative(new Date(lastSavedAt))}.</> : <>Not changed since the website was set up.</>}
          </p>
        </div>
        <a
          href={viewHref}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-sm border border-navy/30 px-5 text-sm font-semibold text-navy hover:border-navy sm:w-auto sm:min-h-11"
        >
          View on site
          <Icon name="external" size={16} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </header>
  );
}
