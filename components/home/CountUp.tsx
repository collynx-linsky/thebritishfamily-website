"use client";

import { useEffect, useRef } from "react";

/**
 * Number that counts up from zero when it scrolls into view.
 * The server HTML shows the final value, and screen readers always get the
 * final value. With reduced motion, or if the number is already on screen
 * when the page loads, it simply stays at the final value.
 */
export function CountUp({ value, durationMs = 1600 }: { value: number; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top < window.innerHeight && bottom > 0) return;

    el.textContent = "0";
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          el.textContent = String(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = String(value);
    };
  }, [value, durationMs]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
