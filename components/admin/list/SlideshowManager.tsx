"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { addSlide, deleteSlide, describeSlide, reorderSlides, replaceSlidePhoto, setSlideVisible, undoLastChange } from "@/lib/admin/actions/content";
import type { MediaRecord } from "@/lib/media/library";
import { Icon } from "../../Icon";
import { MediaPicker } from "../media/MediaPicker";
import { ManagedList, type ManagedItem } from "./ManagedList";

type Slide = ManagedItem & { width: number; height: number };

const MAX_ALT = 160;
const MAX_SLIDES = 10;
const RECOMMENDED = { width: 1920, height: 1080, shape: "wide (16:9)" };
const WHERE = "Behind the headline at the top of the home page";

/**
 * The home slideshow on the shared list pattern. "New photo" and "Replace
 * photo" open the photo picker; a small dialog asks for the description.
 */
export function SlideshowManager({ slides, canUndo }: { slides: Slide[]; canUndo: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Editing an existing slide (slide set) or adding a new one (slide null)
  const [editing, setEditing] = useState<{ slide: Slide | null; photo: { src: string; width: number; height: number; mediaId?: number } } | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<"new" | "replace" | null>(null);
  const [pending, startTransition] = useTransition();

  const openEditor = (item: ManagedItem) => {
    const slide = slides.find((s) => s.id === item.id) ?? null;
    if (!slide) return;
    setEditing({ slide, photo: { src: slide.thumb!.src, width: slide.width, height: slide.height } });
    setText(slide.title);
    setError(null);
    dialogRef.current?.showModal();
  };

  const onPicked = (media: MediaRecord) => {
    const photo = { src: media.url, width: media.width ?? 0, height: media.height ?? 0, mediaId: media.id };
    if (picker === "new") {
      setEditing({ slide: null, photo });
      setText(media.alt);
      setError(null);
      setTimeout(() => dialogRef.current?.showModal(), 0);
    } else if (editing) {
      setEditing({ ...editing, photo });
      setText(media.alt || "");
    }
  };

  const save = () => {
    if (!editing) return;
    startTransition(async () => {
      const { slide, photo } = editing;
      const r = !slide
        ? await addSlide(photo.mediaId!, text)
        : photo.mediaId
          ? await replaceSlidePhoto(slide.id, photo.mediaId, text)
          : await describeSlide(slide.id, text);
      if (r.status === "error") setError(r.fields ? Object.values(r.fields)[0] : r.message);
      else dialogRef.current?.close();
    });
  };

  const small = editing && (editing.photo.width < RECOMMENDED.width || editing.photo.height < RECOMMENDED.height);

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
            disabled={slides.length >= MAX_SLIDES}
            title={slides.length >= MAX_SLIDES ? `The slideshow holds up to ${MAX_SLIDES} photos` : undefined}
            onClick={() => setPicker("new")}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy px-4 text-sm font-bold text-white hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            + New photo
          </button>
        }
      />

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={onPicked}
        title={picker === "new" ? "Add a slideshow photo" : "Replace the slideshow photo"}
        recommended={RECOMMENDED}
        where={WHERE}
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
              save();
            }}
            className="flex flex-col gap-4 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="slide-edit-title" className="font-display text-xl font-extrabold text-navy">
                {editing.slide ? "Edit slideshow photo" : "Add slideshow photo"}
              </h2>
              <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close" className="inline-flex size-11 items-center justify-center rounded-md text-navy hover:bg-paper">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-navy">
              <Image src={editing.photo.src} alt="" fill sizes="(min-width: 640px) 32rem, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>
                {editing.photo.width} × {editing.photo.height} pixels. Best: {RECOMMENDED.shape}, at least {RECOMMENDED.width} × {RECOMMENDED.height}.
              </span>
              {editing.slide ? (
                <button type="button" onClick={() => setPicker("replace")} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 px-3 text-sm font-semibold text-navy hover:border-navy">
                  <Icon name="image" size={15} />
                  Replace photo
                </button>
              ) : null}
            </div>
            {small ? <p className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-amber-ink">This photo is smaller than recommended, so it may look soft on large screens.</p> : null}
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
                {pending ? "Saving…" : editing.slide ? "Save" : "Add to the slideshow"}
              </button>
            </div>
          </form>
        ) : null}
      </dialog>
    </>
  );
}
