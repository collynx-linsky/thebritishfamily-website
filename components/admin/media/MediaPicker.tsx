"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { listPickerMedia } from "@/lib/admin/actions/media";
import type { LibraryItem, MediaRecord } from "@/lib/media/library";
import { Icon } from "../../Icon";
import { Dropzone } from "./Dropzone";

export type Recommended = { width: number; height: number; shape: string };

/**
 * Choose a photo: upload a new one, or pick one from the media library.
 * Says what size and shape works best and where the photo will appear.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  title,
  recommended,
  where,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaRecord) => void;
  title: string;
  recommended?: Recommended;
  where?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [loading, startLoading] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const showLibrary = () => {
    setTab("library");
    if (items === null) startLoading(async () => setItems(await listPickerMedia()));
  };

  const choose = (media: MediaRecord) => {
    onSelect(media);
    onClose();
  };

  const shown = (items ?? []).filter((m) => !query.trim() || `${m.alt} ${m.originalName}`.toLowerCase().includes(query.trim().toLowerCase()));
  const tabClass = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold ${active ? "bg-navy text-white" : "text-navy hover:bg-paper"}`;

  return (
    <dialog
      ref={ref}
      aria-labelledby="picker-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[92dvh] w-[min(46rem,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-xl bg-white p-0 backdrop:bg-navy-deep/55"
    >
      {open ? (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div className="min-w-0">
              <h2 id="picker-title" className="font-display text-xl font-extrabold text-navy">
                {title}
              </h2>
              {recommended || where ? (
                <p className="mt-1 text-sm text-muted">
                  {where ? `${where}. ` : ""}
                  {recommended ? `Best: ${recommended.shape}, at least ${recommended.width} × ${recommended.height} pixels.` : ""}
                </p>
              ) : null}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-navy hover:bg-paper">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div role="tablist" aria-label="Where the photo comes from" className="flex gap-1 border-b border-line px-5 py-2">
            <button type="button" role="tab" aria-selected={tab === "upload"} onClick={() => setTab("upload")} className={tabClass(tab === "upload")}>
              Upload a new photo
            </button>
            <button type="button" role="tab" aria-selected={tab === "library"} onClick={showLibrary} className={tabClass(tab === "library")}>
              Choose from the library
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "upload" ? (
              <Dropzone status="pending" onUploaded={choose} hint="You can describe it after choosing." />
            ) : loading || items === null ? (
              <p className="py-10 text-center text-sm text-muted">Loading the library…</p>
            ) : items.length ? (
              <div className="flex flex-col gap-3">
                <label className="relative flex items-center">
                  <span className="sr-only">Search the library</span>
                  <Icon name="search" size={16} className="pointer-events-none absolute left-3 text-muted" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by description or file name…"
                    className="min-h-11 w-full min-w-0 rounded-md border border-line bg-white pr-3 pl-9 text-base focus:border-navy focus:outline-none"
                  />
                </label>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {shown.map((m) => {
                    const small = recommended && m.width && m.height && (m.width < recommended.width || m.height < recommended.height);
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => choose(m)}
                          className="group flex w-full flex-col overflow-hidden rounded-lg border border-line text-left hover:border-navy focus-visible:border-navy"
                        >
                          <span className="relative aspect-4/3 w-full bg-paper">
                            <Image
                              src={m.url}
                              alt=""
                              fill
                              sizes="200px"
                              placeholder={m.blurDataUrl ? "blur" : "empty"}
                              blurDataURL={m.blurDataUrl ?? undefined}
                              className="object-cover"
                              style={{ objectPosition: `${m.focalX}% ${m.focalY}%` }}
                            />
                          </span>
                          <span className="p-2 text-xs">
                            <span className="line-clamp-2 font-semibold text-navy">{m.alt || <em className="text-amber-ink">No description yet</em>}</span>
                            <span className="text-muted">
                              {m.width} × {m.height}
                              {small ? " · smaller than recommended" : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {!shown.length ? <p className="text-sm text-muted">No photos match “{query}”.</p> : null}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted">The library is empty. Upload a photo on the other tab.</p>
            )}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
