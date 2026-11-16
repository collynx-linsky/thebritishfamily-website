"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { IconName } from "@/lib/site";
import { Icon } from "../Icon";

export type GalleryGridPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  filter: string | null;
  label: string | null;
  icon: IconName | null;
};

type Filter = { value: string; label: string; count: number };

/**
 * Filterable masonry gallery with a full-screen viewer.
 * The viewer is a native <dialog> opened with showModal(): focus is trapped,
 * Escape closes it, the page behind is inert, and focus returns to the photo
 * that opened it. Arrow keys move between photos.
 */
export function GalleryGrid({ photos, filters }: { photos: GalleryGridPhoto[]; filters: Filter[] }) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const captionId = useId();

  const visible = filter === "all" ? photos : photos.filter((p) => p.filter === filter);
  const current = open !== null ? visible[open] : null;

  const step = useCallback(
    (by: number) => setOpen((i) => (i === null ? i : (i + by + visible.length) % visible.length)),
    [visible.length],
  );

  // Open / close the dialog and lock page scroll while it is open
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (open === null && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Clean up if the page is hidden or unmounted while the viewer is open
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div>
      <div role="group" aria-label="Filter photos by sector" className="flex flex-wrap justify-center gap-2.5">
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.value)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-5 text-sm font-bold transition-[transform,background-color,color,border-color] duration-500 ease-premium motion-safe:hover:-translate-y-0.5 ${active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}
            >
              {f.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-gold text-ink" : "bg-mist text-muted"}`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} photos
      </p>

      {/* Remounted per filter so the tiles animate in again */}
      <ul key={filter} className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visible.map((photo, i) => (
          <li
            key={photo.src}
            className="gallery-in mb-5 break-inside-avoid"
            style={{ "--delay": `${Math.min(i, 9) * 70}ms` } as React.CSSProperties}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block w-full overflow-hidden rounded-lg bg-navy text-left shadow-card"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1200px) 384px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                className="block h-auto w-full transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 max-h-48 bg-linear-to-t from-navy-deep via-navy-deep/75 to-transparent" />
              <span className="pointer-events-none absolute inset-0 bg-navy-deep/40 opacity-0 transition-opacity duration-500 ease-premium group-hover:opacity-100 group-focus-visible:opacity-100" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
                <span className="flex min-w-0 flex-col">
                  {photo.label ? (
                    <span className="eyebrow flex items-center gap-1.5 text-gold">
                      {photo.icon ? <Icon name={photo.icon} size={14} strokeWidth={2.2} /> : null}
                      {photo.label}
                    </span>
                  ) : null}
                  <span aria-hidden="true" className="mt-1 text-sm font-semibold">
                    {photo.alt}
                  </span>
                </span>
                <span className="inline-flex size-10 shrink-0 scale-90 items-center justify-center rounded-full bg-gold text-ink opacity-0 transition-[transform,opacity] duration-500 ease-premium group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </span>
              </span>
              <span className="sr-only">View larger</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Viewer */}
      <dialog
        ref={dialogRef}
        aria-labelledby={captionId}
        onClose={() => {
          setOpen(null);
          document.documentElement.style.overflow = "";
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(null); // backdrop click
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        className="on-dark m-auto max-h-none max-w-none bg-transparent p-0 text-white backdrop:bg-navy-deep/92 backdrop:backdrop-blur-sm"
      >
        {current ? (
          <div className="flex w-[min(94vw,72rem)] flex-col gap-4 p-2 sm:p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-on-navy" aria-live="polite">
                {open! + 1} / {visible.length}
              </p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close viewer"
                autoFocus
                className="inline-flex size-11 items-center justify-center rounded-full text-white ring-1 ring-white/30 transition-transform duration-500 ease-premium hover:text-gold hover:ring-gold motion-safe:hover:rotate-90"
              >
                <Icon name="close" size={22} strokeWidth={2.2} />
              </button>
            </div>

            <div className="relative h-[min(70vh,48rem)] w-full">
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="94vw"
                className="viewer-in object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <ViewerButton label="Previous photo" onClick={() => step(-1)}>
                <Icon name="arrow" size={20} strokeWidth={2.2} className="rotate-180" />
              </ViewerButton>
              <p id={captionId} className="text-center text-sm sm:text-base">
                {current.label ? <span className="font-bold text-gold">{current.label} · </span> : null}
                {current.alt}
              </p>
              <ViewerButton label="Next photo" onClick={() => step(1)}>
                <Icon name="arrow" size={20} strokeWidth={2.2} />
              </ViewerButton>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

function ViewerButton({
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
      className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 transition-[transform,opacity] duration-500 ease-premium hover:bg-gold hover:text-ink motion-safe:hover:-translate-y-0.5"
    >
      {children}
    </button>
  );
}
