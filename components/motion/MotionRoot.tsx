"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll reveals for everything inside it marked with data-reveal
 * ("up" | "left" | "right" | "scale" | "stagger" | "wipe").
 *
 * The server HTML shows everything. After hydration, only elements that are
 * still below the viewport are set to data-state="hidden", then revealed
 * once as they scroll into view. With reduced motion nothing is
 * hidden at all. The CSS lives in app/globals.css.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-state", "shown");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );

    const viewport = window.innerHeight;
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.state === "shown") return; // already revealed (page kept alive)
      const { top, width, height } = el.getBoundingClientRect();
      // Only hide what is still below the fold. Elements on screen or already
      // scrolled past (restored scroll, anchor links) stay visible, and so do
      // elements not laid out at this width (display: none), which could
      // otherwise never be revealed.
      if (top < viewport * 0.9 || (width === 0 && height === 0)) return;
      el.dataset.state = "hidden";
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // overflow-x: clip stops side-sliding reveals from adding horizontal scroll
  // (unlike hidden, clip does not create a scroll container).
  return (
    <div ref={ref} className="overflow-x-clip">
      {children}
    </div>
  );
}
