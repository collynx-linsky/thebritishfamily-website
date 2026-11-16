"use client";

import { useState } from "react";

/**
 * Continuously scrolling strip. The content is rendered twice so the loop is
 * seamless; the copy is hidden from assistive technology and from keyboard
 * focus (inert). Pauses on hover and focus, and with its own button
 * (WCAG 2.2.2). With reduced motion it becomes a still, swipeable row (CSS).
 */
export function Marquee({ label, children }: { label: string; children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="marquee relative" data-paused={paused ? "" : undefined}>
      <div
        className="marquee-viewport overflow-hidden mask-x-from-90% mask-x-to-100% md:pr-0"
        role="region"
        aria-label={label}
      >
        <div className="marquee-track flex w-max will-change-transform">
          <div className="flex shrink-0">{children}</div>
          <div className="marquee-clone flex shrink-0" aria-hidden="true" inert>
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Play sector strip" : "Pause sector strip"}
        className="absolute top-1/2 right-2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy-deep text-gold shadow-[0_0_0_10px_var(--color-navy-deep)] ring-1 ring-white/20 transition-opacity duration-500 ease-premium hover:ring-gold motion-reduce:hidden sm:right-4"
      >
        {paused ? (
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4.5" width="4" height="15" rx="1" />
            <rect x="14" y="4.5" width="4" height="15" rx="1" />
          </svg>
        )}
      </button>
    </div>
  );
}
