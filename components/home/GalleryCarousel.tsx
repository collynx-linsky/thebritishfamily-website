"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

/**
 * Horizontal, scroll-snapping gallery. Native scrolling does the work
 * (touch, trackpad, and arrow keys once the list has focus); the buttons
 * scroll by one tile. Children are the tiles (<li> elements).
 */
export function GalleryCarousel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const start = list.scrollLeft <= 4;
      const end = list.scrollLeft + list.clientWidth >= list.scrollWidth - 4;
      setEdges((current) =>
        current.start === start && current.end === end ? current : { start, end },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function scrollByTile(direction: 1 | -1) {
    const list = listRef.current;
    const tile = list?.querySelector("li");
    if (!list || !tile) return;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({
      left: direction * (tile.getBoundingClientRect().width + gap),
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <div>
      <div className="mb-6 flex justify-end gap-3">
        <NavButton label="Previous photos" disabled={edges.start} onClick={() => scrollByTile(-1)}>
          <Icon name="arrow" size={20} strokeWidth={2.2} className="rotate-180" />
        </NavButton>
        <NavButton label="Next photos" disabled={edges.end} onClick={() => scrollByTile(1)}>
          <Icon name="arrow" size={20} strokeWidth={2.2} />
        </NavButton>
      </div>
      <ul
        ref={listRef}
        tabIndex={0}
        aria-label={label}
        data-reveal="stagger"
        // Bleeds to the right edge of the viewport; stays aligned with the content on the left
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 scrollbar-thin sm:-ml-6 sm:mr-[calc(50%-50vw)] sm:scroll-px-6 sm:px-6"
      >
        {children}
      </ul>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled) onClick();
      }}
      // aria-disabled (not disabled) so keyboard focus is not lost at either end
      aria-disabled={disabled}
      aria-label={label}
      className="inline-flex size-12 items-center justify-center rounded-full border-2 border-navy text-navy transition-[transform,opacity] duration-500 ease-premium hover:bg-navy hover:text-white aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:bg-transparent aria-disabled:hover:text-navy motion-safe:hover:-translate-y-0.5 motion-safe:aria-disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}
