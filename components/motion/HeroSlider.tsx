"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { ImageAsset } from "@/lib/site";
import { Icon } from "../Icon";
import { focalStyle } from "@/lib/media/focal";

const SLIDE_MS = 6500;

/**
 * Hero background slideshow with the hero content (children) on top.
 *
 * - Crossfade with a slow zoom (CSS). The active progress dot's animation is
 *   the timer: its animationend advances the slide, so pausing the animation
 *   pauses the timer too. With reduced motion there is no animation, so the
 *   slideshow does not auto-play.
 * - Pauses on hover, on keyboard focus inside, and with the pause button.
 * - Arrows, dots and swipe; announced to screen readers only while paused.
 */
export function HeroSlider({
  slides,
  labelledBy,
  children,
}: {
  slides: ImageAsset[];
  labelledBy: string;
  children: React.ReactNode;
}) {
  const [{ index, previous }, setPosition] = useState({ index: 0, previous: -1 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const swipeStart = useRef<number | null>(null);

  const paused = hovered || focused || userPaused;
  const count = slides.length;

  const goTo = useCallback(
    (next: number) =>
      setPosition((current) => {
        const target = (next + count) % count;
        return target === current.index ? current : { index: target, previous: current.index };
      }),
    [count],
  );

  return (
    <section
      aria-labelledby={labelledBy}
      className="on-dark relative isolate touch-pan-y overflow-hidden bg-navy"
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const dx = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => (swipeStart.current = null)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {/* Slides */}
      <div
        className="absolute inset-0 -z-20"
        aria-roledescription="carousel"
        aria-label="Photos of our sectors"
        role="region"
      >
        {slides.map((slide, i) => {
          const phase = i === index ? "active" : i === previous ? "leaving" : "idle";
          return (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={phase !== "active"}
              data-phase={phase}
              className="hero-slide absolute inset-0"
            >
              <div className="hero-zoom absolute inset-0 will-change-transform">
                <Image
                  src={slide.src} style={focalStyle(slide)}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  preload={i === 0}
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}
        {/* Navy overlay keeps the low-resolution photos soft and the text legible */}
        <div className="absolute inset-0 bg-linear-100 from-navy-deep/95 via-navy-deep/85 to-navy-deep/75" />
      </div>

      {children}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-28 md:bottom-32">
        <div
          className="mx-auto flex w-full max-w-site items-center justify-end gap-1 px-5 sm:px-6"
          data-paused={paused ? "" : undefined}
        >
          <ControlButton label="Previous photo" onClick={() => goTo(index - 1)}>
            <Icon name="arrow" size={18} strokeWidth={2.4} className="rotate-180" />
          </ControlButton>

          <ol className="flex items-center" aria-label="Choose a photo">
            {slides.map((slide, i) => (
              <li key={slide.src}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index ? "true" : undefined}
                  className="group flex h-11 w-9 items-center justify-center rounded-sm"
                >
                  <span className="relative block h-1 w-6 overflow-hidden rounded-full bg-white/30 transition-colors group-hover:bg-white/50">
                    {i === index ? (
                      <span
                        key={index}
                        data-active=""
                        style={{ "--slide-ms": `${SLIDE_MS}ms` } as React.CSSProperties}
                        onAnimationEnd={() => goTo(index + 1)}
                        className="hero-progress absolute inset-0 rounded-full bg-gold"
                      />
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <ControlButton label="Next photo" onClick={() => goTo(index + 1)}>
            <Icon name="arrow" size={18} strokeWidth={2.4} />
          </ControlButton>

          <ControlButton
            label={userPaused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => setUserPaused((value) => !value)}
          >
            {userPaused ? (
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4.5v15l13-7.5z" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4.5" width="4" height="15" rx="1" />
                <rect x="14" y="4.5" width="4" height="15" rx="1" />
              </svg>
            )}
          </ControlButton>
        </div>
      </div>

      <p className="sr-only" aria-live={paused ? "polite" : "off"} aria-atomic="true">
        Photo {index + 1} of {count}: {slides[index].alt}
      </p>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-full text-white/80 ring-1 ring-white/25 transition-[transform,opacity] duration-500 ease-premium hover:text-gold hover:ring-gold/70 motion-safe:hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}
