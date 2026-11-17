"use client";

import { useState, useTransition } from "react";
import { dismissWelcome } from "@/lib/admin/actions/dashboard";
import { Icon } from "../../Icon";
import { ShortcutHint } from "../shell/ShortcutHint";

/** Shown until dismissed: the three things an editor needs to know. */
export function FirstVisitWelcome() {
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();
  if (hidden) return null;

  const points = [
    {
      icon: "compass" as const,
      title: "Find anything",
      text: (
        <>
          The menu follows the website: Home, About, Sectors and so on. Or press <ShortcutHint className="!inline-block border-line text-muted" /> and type
          what you are looking for.
        </>
      ),
    },
    { icon: "check" as const, title: "Save makes it live", text: <>When you press Save, the website changes straight away. Nothing changes until then.</> },
    {
      icon: "shield" as const,
      title: "Mistakes are easy to fix",
      text: <>Every editor has “Undo last change”, and “Restore original” puts back the starting text.</>,
    },
  ];

  return (
    <section aria-labelledby="welcome-title" className="rounded-xl border border-gold/40 bg-white p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-gold-deep uppercase">First visit</p>
          <h2 id="welcome-title" className="mt-1 font-display text-2xl font-extrabold text-navy">
            Three things to know
          </h2>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await dismissWelcome();
              if (r.ok) setHidden(true);
            })
          }
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-70"
        >
          {pending ? "One moment…" : "Got it"}
        </button>
      </div>
      <ol className="mt-5 grid gap-4 md:grid-cols-3">
        {points.map((p, i) => (
          <li key={p.title} className="flex gap-3 rounded-lg bg-paper p-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-gold-deep">
              <Icon name={p.icon} size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-navy">
                <span className="sr-only">{i + 1}. </span>
                {p.title}
              </p>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
