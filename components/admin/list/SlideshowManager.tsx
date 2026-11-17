"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { deleteSlide, describeSlide, reorderSlides, setSlideVisible, undoLastChange } from "@/lib/admin/actions/content";
import { Icon } from "../../Icon";
import { ManagedList, type ManagedItem } from "./ManagedList";

type Slide = ManagedItem & { width: number; height: number };

const MAX_ALT = 160;

/** The home slideshow on the shared list pattern, with a small dialog to edit a description. */
export function SlideshowManager({ slides, canUndo }: { slides: Slide[]; canUndo: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openEditor = (item: ManagedItem) => {
    const slide = slides.find((s) => s.id === item.id) ?? null;
    setEditing(slide);
    setText(slide?.title ?? "");
    setError(null);
    dialogRef.current?.showModal();
  };

  const saveDescription = () => {
    if (!editing) return;
    startTransition(async () => {
      const r = await describeSlide(editing.id, text);
      if (r.status === "error") setError(r.fields ? Object.values(r.fields)[0] : r.message);
      else dialogRef.current?.close();
    });
  };

  return (
    <>
      <ManagedList
        items={slides}
        noun={["photo", "photos"]}
        minVisible={1}
        setVisible={setSlideVisible}
        reorder={reorderSlides}
        remove={deleteSlide}
        onEdit={openEditor}
        undo={() => undoLastChange("slideshow")}
        canUndo={canUndo}
        newButton={
          <button
            type="button"
            disabled
            title="Adding photos arrives with photo uploads, the next stage"
            className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md bg-navy/50 px-4 text-sm font-bold text-white"
          >
            + New photo
            <span className="sr-only"> (arrives with photo uploads)</span>
          </button>
        }
      />

      <dialog
        ref={dialogRef}
        aria-labelledby="slide-edit-title"
        onClose={() => setEditing(null)}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] max-w-none rounded-xl bg-white p-0 backdrop:bg-navy-deep/55"
      >
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveDescription();
            }}
            className="flex flex-col gap-4 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="slide-edit-title" className="font-display text-xl font-extrabold text-navy">
                Edit slideshow photo
              </h2>
              <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close" className="inline-flex size-11 items-center justify-center rounded-md text-navy hover:bg-paper">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-navy">
              <Image src={editing.thumb!.src} alt="" fill sizes="(min-width: 640px) 32rem, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slide-alt" className="text-sm font-semibold text-navy">
                Photo description
              </label>
              <textarea
                id="slide-alt"
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby="slide-alt-hint slide-alt-count"
                className={`w-full min-w-0 rounded-sm border bg-white px-4 py-3 text-base text-ink focus:border-navy focus:outline-none ${error ? "border-error" : "border-line"}`}
              />
              <div className="flex items-start justify-between gap-3">
                <div>
                  {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                  <p id="slide-alt-hint" className="text-xs text-muted">
                    Describe what the photo shows, for visitors who can&apos;t see it and for search engines.
                  </p>
                </div>
                <p id="slide-alt-count" className={`shrink-0 text-xs tabular-nums ${text.length > MAX_ALT ? "font-semibold text-error" : "text-muted"}`}>
                  {text.length}/{MAX_ALT}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => dialogRef.current?.close()} className="inline-flex min-h-11 items-center rounded-md border border-line px-4 font-semibold text-navy hover:border-navy">
                Cancel
              </button>
              <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 font-bold text-white hover:bg-navy-deep disabled:opacity-70">
                {pending ? "Saving…" : "Save description"}
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </>
  );
}
