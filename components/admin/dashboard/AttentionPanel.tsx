"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setReviewed } from "@/lib/admin/actions/dashboard";
import type { ReviewItem, ReviewKind } from "@/lib/admin/review";
import { Icon } from "../../Icon";
import type { IconName } from "@/lib/site";

const KIND: Record<ReviewKind, { icon: IconName; label: string }> = {
  photo: { icon: "image", label: "Photo" },
  content: { icon: "file", label: "Sample content" },
  confirm: { icon: "check", label: "To confirm" },
};

/**
 * Items that still need a decision before launch. "Mark reviewed" keeps an
 * item on purpose (it moves to the reviewed list and can be put back).
 */
export function AttentionPanel({ items }: { items: ReviewItem[] }) {
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const open = items.filter((i) => !i.reviewed);
  // Keep the panel short: the first few, then the rest on request
  const SHORT = 4;
  const visible = showAll ? open : open.slice(0, SHORT);
  const done = items.filter((i) => i.reviewed);

  const toggle = (key: string, reviewed: boolean) => {
    setBusyKey(key);
    setError(null);
    startTransition(async () => {
      const r = await setReviewed(key, reviewed);
      if (!r.ok) setError(r.error);
      setBusyKey(null);
    });
  };

  return (
    <section id="attention" aria-labelledby="attention-title" className="scroll-mt-24 rounded-xl border border-paper-line bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="attention-title" className="font-display text-xl font-extrabold text-navy">
          Needs attention
        </h2>
        <span className="text-sm font-semibold text-muted">{open.length ? `${open.length} to do` : "All done"}</span>
      </div>
      <p className="mt-1 text-sm text-muted">Sample photos, sample content and details to confirm before launch.</p>
      {error ? (
        <p role="alert" className="mt-3 rounded-md bg-error/5 px-3 py-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}

      {open.length ? (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((item) => (
            <li key={item.key} className="rounded-lg border border-line p-4">
              <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-gold-deep uppercase">
                <Icon name={KIND[item.kind].icon} size={14} />
                {KIND[item.kind].label}
              </p>
              <p className="mt-1.5 font-semibold [overflow-wrap:anywhere] text-navy">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={item.href} className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-navy px-4 text-sm font-bold text-white hover:bg-navy-deep">
                  Open
                  <Icon name="arrow" size={15} />
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => toggle(item.key, true)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-navy disabled:opacity-60"
                >
                  <Icon name="check" size={15} />
                  {busyKey === item.key ? "Saving…" : "Mark reviewed"}
                </button>
              </div>
            </li>
          ))}
          {open.length > SHORT ? (
            <li>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                aria-expanded={showAll}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-navy/30 px-4 text-sm font-semibold text-navy hover:border-navy hover:bg-paper"
              >
                {showAll ? "Show fewer" : `Show all ${open.length}`}
                <Icon name="chevron" size={14} className={showAll ? "-rotate-90" : "rotate-90"} />
              </button>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-paper p-4 text-sm font-semibold text-navy">
          <Icon name="check" size={18} className="text-gold-deep" />
          Nothing left to check. Well done.
        </p>
      )}

      {done.length ? (
        <details className="group/r mt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-muted hover:text-navy [&::-webkit-details-marker]:hidden">
            <Icon name="chevron" size={14} className="transition-transform group-open/r:rotate-90" />
            Reviewed ({done.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {done.map((item) => (
              <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper px-3 py-2">
                <span className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere] text-muted">{item.title}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => toggle(item.key, false)}
                  className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-navy hover:bg-white disabled:opacity-60"
                >
                  {busyKey === item.key ? "Saving…" : "Put back"}
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
