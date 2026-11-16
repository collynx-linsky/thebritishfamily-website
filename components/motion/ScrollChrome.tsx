"use client";

import { useEffect, useRef } from "react";
import { Icon } from "../Icon";

/**
 * Scroll progress bar (top of the viewport) and a back-to-top button.
 * Scroll work is batched into one requestAnimationFrame per frame and
 * written straight to the DOM, so scrolling never re-renders React.
 */
export function ScrollChrome({ focusTargetId }: { focusTargetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      const button = buttonRef.current;
      if (button) {
        const show = window.scrollY > window.innerHeight * 0.8;
        button.dataset.visible = show ? "true" : "false";
        button.tabIndex = show ? 0 : -1;
        button.setAttribute("aria-hidden", show ? "false" : "true");
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function backToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById(focusTargetId)?.focus({ preventScroll: true });
  }

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-60 h-[3px]">
        <div
          ref={barRef}
          className="h-full origin-left bg-gold will-change-transform"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <button
        ref={buttonRef}
        type="button"
        onClick={backToTop}
        data-visible="false"
        aria-hidden="true"
        tabIndex={-1}
        className="on-dark fixed right-4 bottom-4 z-40 inline-flex size-12 items-center justify-center rounded-full bg-navy text-gold shadow-lift transition-[opacity,transform,visibility] duration-500 ease-premium hover:bg-navy-deep data-[visible=false]:invisible data-[visible=false]:translate-y-4 data-[visible=false]:opacity-0 sm:right-6 sm:bottom-6"
      >
        <Icon name="arrow" size={20} strokeWidth={2.4} className="-rotate-90" />
        <span className="sr-only">Back to top</span>
      </button>
    </>
  );
}
