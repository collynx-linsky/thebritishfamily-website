"use client";

import { useId, useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, uploadImage } from "@/lib/media/client-upload";
import type { MediaRecord } from "@/lib/media/library";
import { Icon } from "../../Icon";

type Item = { key: number; name: string; progress: number; error?: string; done?: boolean };

/**
 * Drop photos here or choose them; each uploads with its own progress bar.
 * On phones the button opens the camera or photo gallery.
 */
export function Dropzone({
  multiple = false,
  status,
  hint,
  onUploaded,
  onAllDone,
}: {
  multiple?: boolean;
  status: "library" | "pending";
  hint?: string;
  onUploaded: (media: MediaRecord) => void;
  onAllDone?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const nextKey = useRef(0);
  const labelId = useId();
  const busy = items.some((i) => !i.done && !i.error);

  const start = async (files: File[]) => {
    const list = multiple ? files : files.slice(0, 1);
    if (!list.length) return;
    const fresh = list.map((f) => ({ key: nextKey.current++, name: f.name, progress: 0 }));
    setItems((prev) => [...prev.filter((p) => !p.done), ...fresh]);
    // One at a time: kinder to mobile connections, and progress stays readable
    for (const [i, file] of list.entries()) {
      const key = fresh[i].key;
      try {
        const media = await uploadImage(file, {
          status,
          onProgress: (p) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, progress: p } : it))),
        });
        setItems((prev) => prev.map((it) => (it.key === key ? { ...it, progress: 1, done: true } : it)));
        onUploaded(media);
      } catch (error) {
        const message = error instanceof Error ? error.message : "The upload failed.";
        setItems((prev) => prev.map((it) => (it.key === key ? { ...it, error: message } : it)));
      }
    }
    onAllDone?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void start([...e.dataTransfer.files]);
        }}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          over ? "border-gold bg-gold/10" : "border-navy/25 bg-paper"
        }`}
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-gold-deep">
          <Icon name="image" size={22} />
        </span>
        <p id={labelId} className="font-semibold text-navy">
          {multiple ? "Drop photos here" : "Drop a photo here"}
          <span className="font-normal text-muted"> or</span>
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 font-bold text-white hover:bg-navy-deep disabled:opacity-70"
        >
          {multiple ? "Choose photos" : "Choose a photo"}
        </button>
        <p className="text-xs text-muted">JPEG, PNG or WebP. Large photos are made smaller automatically.{hint ? ` ${hint}` : ""}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple={multiple}
          aria-labelledby={labelId}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            void start([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
      </div>
      {items.length ? (
        <ul aria-live="polite" className="flex flex-col gap-2">
          {items.map((it) => (
            <li key={it.key} className="rounded-md border border-line bg-white px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate font-medium text-navy">{it.name}</span>
                <span className={`shrink-0 text-xs font-semibold ${it.error ? "text-error" : it.done ? "text-green-700" : "text-muted"}`}>
                  {it.error ? "Not uploaded" : it.done ? "Uploaded" : `${Math.round(it.progress * 100)}%`}
                </span>
              </div>
              {it.error ? (
                <p className="mt-1 text-xs text-error">{it.error}</p>
              ) : (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper" aria-hidden="true">
                  <div className={`h-full rounded-full transition-[width] ${it.done ? "bg-green-600" : "bg-navy"}`} style={{ width: `${Math.round(it.progress * 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
