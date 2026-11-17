"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

/** "Ctrl K", or "⌘ K" on Apple devices (decided after hydration, so markup matches). */
export function ShortcutHint({ className = "" }: { className?: string }) {
  const apple = useSyncExternalStore(subscribe, isApple, () => false);
  return (
    <kbd
      aria-hidden="true"
      className={`hidden shrink-0 rounded-sm border px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold sm:inline-block ${className}`}
    >
      {apple ? "⌘ K" : "Ctrl K"}
    </kbd>
  );
}
