"use client";

import { useEffect, useRef } from "react";

/**
 * Number that counts up from zero when it scrolls into view.
 *
 * The page contains the final value exactly once, so everyone gets the same
 * text: visitors without JavaScript, screen readers, copy and paste, reader
 * modes and search engines (an always-present screen-reader copy would read
 * as "22" in all of those). Only while the animation runs is the moving
 * number hidden from assistive technology, with a temporary screen-reader
 * copy of the final value beside it; both are undone when it finishes.
 *
 * With reduced motion, or if the number is already on screen when the page
 * loads, it simply stays at the final value.
 */
export function CountUp({
  value,
  durationMs = 1600,
  onLoad = false,
}: {
  value: number;
  durationMs?: number;
  /** Count up as soon as the page loads, even when already on screen (dashboard figures) */
  onLoad?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = ref.current;
    const number = wrapper?.firstElementChild as HTMLElement | null;
    if (!wrapper || !number || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { top, bottom } = wrapper.getBoundingClientRect();
    if (!onLoad && top < window.innerHeight && bottom > 0) return;

    // Animation mode: the moving number is visual only; screen readers get the final value
    const spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = String(value);
    number.setAttribute("aria-hidden", "true");
    number.textContent = "0";
    wrapper.append(spoken);

    const finish = () => {
      number.textContent = String(value);
      number.removeAttribute("aria-hidden");
      spoken.remove();
    };

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          number.textContent = String(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
          else finish();
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      finish();
    };
  }, [value, durationMs, onLoad]);

  return (
    <span ref={ref}>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}
