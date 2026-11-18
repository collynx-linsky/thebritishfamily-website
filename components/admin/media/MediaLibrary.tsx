"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteMedia, updateMediaDetails } from "@/lib/admin/actions/media";
import type { LibraryItem } from "@/lib/media/library";
import { formatBytes, SITE_TIME_ZONE } from "@/lib/format";
import { Icon } from "../../Icon";
import { Dropzone } from "./Dropzone";

type Filter = "all" | "unused" | "undescribed";
const uploadedOn = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: SITE_TIME_ZONE });

/** The media library: every uploaded photo, where it is used, its description and framing. */
export function MediaLibrary({ items }: { items: LibraryItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [uploading, setUploading] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const images = items.filter((i) => i.kind === "image");
  const shown = useMemo(
    () =>
      images.filter((m) => {
        if (filter === "unused" && m.usage.length) return false;
        if (filter === "undescribed" && m.alt.trim()) return false;
        const q = query.trim().toLowerCase();
        return !q || `${m.alt} ${m.originalName}`.toLowerCase().includes(q);
      }),
    [images, filter, query],
  );
  const current = images.find((m) => m.id === openId) ?? null;
  const counts = { all: images.length, unused: images.filter((m) => !m.usage.length).length, undescribed: images.filter((m) => !m.alt.trim()).length };

  const open = (id: number) => {
    setOpenId(id);
    dialogRef.current?.showModal();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-paper-line bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex min-w-0 flex-1 items-center sm:max-w-xs">
            <span className="sr-only">Search photos</span>
            <Icon name="search" size={16} className="pointer-events-none absolute left-3 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos…"
              className="min-h-11 w-full min-w-0 rounded-md border border-line bg-white pr-3 pl-9 text-base focus:border-navy focus:outline-none"
            />
          </label>
          <div role="group" aria-label="Show" className="flex flex-wrap gap-1">
            {(
              [
                ["all", "All"],
                ["unused", "Not used"],
                ["undescribed", "Needs a description"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-navy hover:bg-paper aria-pressed:bg-navy aria-pressed:text-white"
              >
                {label}
                <span className="rounded-full bg-black/10 px-1.5 text-xs">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setUploading(!uploading)}
          aria-expanded={uploading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-bold text-white hover:bg-navy-deep"
        >
          {uploading ? "Close uploads" : "+ Upload photos"}
        </button>
      </div>

      {uploading ? (
        <div className="rounded-xl border border-paper-line bg-white p-4">
          <Dropzone multiple status="library" hint="Add a description to each afterwards." onUploaded={() => {}} onAllDone={() => router.refresh()} />
        </div>
      ) : null}

      {shown.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => open(m.id)} className="flex w-full flex-col overflow-hidden rounded-xl border border-paper-line bg-white text-left hover:border-navy/40 hover:shadow-card">
                <span className="relative aspect-4/3 w-full bg-paper">
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 220px, 45vw"
                    placeholder={m.blurDataUrl ? "blur" : "empty"}
                    blurDataURL={m.blurDataUrl ?? undefined}
                    className="object-cover"
                    style={{ objectPosition: `${m.focalX}% ${m.focalY}%` }}
                  />
                </span>
                <span className="flex flex-col gap-1 p-3 text-sm">
                  <span className="line-clamp-2 font-semibold [overflow-wrap:anywhere] text-navy">
                    {m.alt || <span className="text-amber-ink">Needs a description</span>}
                  </span>
                  <span className="text-xs text-muted">{m.usage.length ? `Used in ${m.usage.length} ${m.usage.length === 1 ? "place" : "places"}` : "Not used yet"}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-paper-line bg-white p-8 text-center">
          <p className="font-semibold text-navy">{images.length ? "No photos match." : "No photos yet."}</p>
          <p className="mt-1 text-sm text-muted">
            {images.length ? "Try another word or filter." : "Upload BFL's own photos here, then use them anywhere on the website."}
          </p>
          {!images.length ? (
            <button type="button" onClick={() => setUploading(true)} className="mt-4 inline-flex min-h-11 items-center rounded-md bg-navy px-5 font-bold text-white hover:bg-navy-deep">
              Upload the first photos
            </button>
          ) : null}
        </div>
      )}
      <p className="text-sm text-muted">
        {images.length} {images.length === 1 ? "photo" : "photos"}. Photos uploaded in an editor but never saved are removed after a day.
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby="media-detail-title"
        onClose={() => setOpenId(null)}
        className="m-auto max-h-[94dvh] w-[min(56rem,calc(100vw-1.5rem))] max-w-none overflow-y-auto rounded-xl bg-white p-0 backdrop:bg-navy-deep/55"
      >
        {current ? <MediaDetail key={current.id} item={current} onClose={() => dialogRef.current?.close()} /> : null}
      </dialog>
    </div>
  );
}

function MediaDetail({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [focal, setFocal] = useState({ x: item.focalX, y: item.focalY });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const frameRef = useRef<HTMLDivElement>(null);
  const changed = alt !== item.alt || focal.x !== item.focalX || focal.y !== item.focalY;
  const position = `${focal.x}% ${focal.y}%`;

  const setFromPointer = (clientX: number, clientY: number) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
    setFocal({ x: clamp(((clientX - r.left) / r.width) * 100), y: clamp(((clientY - r.top) / r.height) * 100) });
  };

  const save = () =>
    startTransition(async () => {
      const r = await updateMediaDetails(item.id, { alt, focalX: focal.x, focalY: focal.y });
      setMessage({ ok: r.ok, text: r.message });
    });
  const remove = () => {
    if (!window.confirm("Delete this photo from the library? This cannot be undone.")) return;
    startTransition(async () => {
      const r = await deleteMedia(item.id);
      if (r.ok) onClose();
      else setMessage({ ok: false, text: r.message });
    });
  };

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="media-detail-title" className="font-display text-xl font-extrabold text-navy">
            Photo details
          </h2>
          <p className="mt-1 text-sm [overflow-wrap:anywhere] text-muted">
            {item.originalName || "Uploaded photo"} · {item.width} × {item.height} · {formatBytes(item.sizeBytes)} · uploaded {uploadedOn.format(new Date(item.createdAt))}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-navy hover:bg-paper">
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-navy">Framing</p>
          <p className="text-xs text-muted">Select the most important part of the photo. Cards and banners keep that part in view. Arrow keys move it too.</p>
          <div
            ref={frameRef}
            role="slider"
            tabIndex={0}
            aria-label="Focal point"
            aria-valuetext={`${focal.x}% from the left, ${focal.y}% from the top`}
            aria-valuenow={focal.x}
            onPointerDown={(e) => setFromPointer(e.clientX, e.clientY)}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 10 : 5;
              const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
              const m = moves[e.key];
              if (!m) return;
              e.preventDefault();
              setFocal((f) => ({ x: Math.max(0, Math.min(100, f.x + m[0])), y: Math.max(0, Math.min(100, f.y + m[1])) }));
            }}
            className="relative mx-auto cursor-crosshair overflow-hidden rounded-lg bg-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-navy"
            // Never taller than 55% of the screen; the width follows the photo's shape so
            // the marker still lines up with the photo (tall portraits stay usable)
            style={{ aspectRatio: `${item.width ?? 4} / ${item.height ?? 3}`, width: `min(100%, calc(55vh * ${(item.width ?? 4) / (item.height ?? 3)}))` }}
          >
            <Image src={item.url} alt={item.alt} fill sizes="(min-width: 1024px) 480px, 90vw" className="object-contain" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute size-8 -translate-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(20,33,61,0.6)]"
              style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2" aria-label="How it will be cropped">
            {[
              ["Banner", "16 / 7"],
              ["Card", "4 / 3"],
              ["Square", "1 / 1"],
            ].map(([label, ratio]) => (
              <figure key={label} className="flex flex-col gap-1">
                <div className="relative w-full overflow-hidden rounded-md bg-navy" style={{ aspectRatio: ratio }}>
                  <Image src={item.url} alt="" fill sizes="160px" className="object-cover" style={{ objectPosition: position }} />
                </div>
                <figcaption className="text-center text-xs text-muted">{label}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="media-alt" className="text-sm font-semibold text-navy">
              Description
            </label>
            <textarea
              id="media-alt"
              rows={3}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              aria-describedby="media-alt-hint"
              className="w-full min-w-0 rounded-sm border border-line bg-white px-4 py-3 text-base focus:border-navy focus:outline-none"
            />
            <div className="flex justify-between gap-3">
              <p id="media-alt-hint" className="text-xs text-muted">
                What the photo shows, for visitors who can&apos;t see it and for search engines. Used when the photo is chosen somewhere.
              </p>
              <p className={`shrink-0 text-xs tabular-nums ${alt.length > 160 ? "font-semibold text-error" : "text-muted"}`}>{alt.length}/160</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-navy">Where it&apos;s used</p>
            {item.usage.length ? (
              <ul className="mt-1 flex flex-col">
                {item.usage.map((u) => (
                  <li key={`${u.href}-${u.label}`}>
                    <Link href={u.href} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-navy underline-offset-4 hover:underline">
                      {u.label}
                      <Icon name="arrow" size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted">Not used anywhere yet. Choose it from any photo field on the website.</p>
            )}
          </div>

          {message ? (
            <p role="status" className={`rounded-md px-3 py-2 text-sm font-medium ${message.ok ? "bg-paper text-navy" : "bg-error/5 text-error"}`}>
              {message.text}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled={pending || item.usage.length > 0}
              onClick={remove}
              title={item.usage.length ? "Replace it where it is used before deleting" : undefined}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-error hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete photo
            </button>
            <button
              type="button"
              disabled={pending || !changed}
              onClick={save}
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 font-bold text-white hover:bg-navy-deep disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
