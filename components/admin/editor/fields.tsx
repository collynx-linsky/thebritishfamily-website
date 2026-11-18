"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { LIST_MARKER } from "@/lib/admin/form-data";
import { Icon } from "../../Icon";
import { MediaPicker, type Recommended } from "../media/MediaPicker";
import type { MediaRecord } from "@/lib/media/library";
import type { IconName } from "@/lib/site";
import { useFieldError, useFormChanged } from "./EditorShell";

const fieldId = (name: string) => `f-${name.replace(/[^a-z0-9]+/gi, "-")}`;

const inputBase =
  "w-full min-w-0 rounded-sm border bg-white px-4 text-base text-ink placeholder:text-muted/70 focus:border-navy focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-navy/25";

/* ------------------------------------------------------------------
   Text
   ------------------------------------------------------------------ */

type TextFieldProps = {
  name: string;
  label: string;
  defaultValue: string | number;
  hint?: string;
  /** Maximum length (from the schema); shows a character counter */
  max?: number;
  /** Visible rows for multi-line text; omit for a single line */
  rows?: number;
  type?: "text" | "email" | "tel" | "number";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Shown before the field, e.g. "+" for phone numbers */
  prefix?: string;
};

/** A labelled text field with hint, character counter and server error. */
export function TextField({ name, label, defaultValue, hint, max, rows, type = "text", inputMode, prefix }: TextFieldProps) {
  const id = fieldId(name);
  const error = useFieldError(name);
  const [length, setLength] = useState(String(defaultValue).length);
  const over = max !== undefined && length > max;
  const near = max !== undefined && !over && length > max * 0.9;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`, over && `${id}-count`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    defaultValue,
    "aria-invalid": error || over ? true : undefined,
    "aria-describedby": describedBy,
    onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => setLength(e.currentTarget.value.length),
  } as const;
  const border = error || over ? "border-error" : "border-line";

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {rows ? (
        <textarea {...common} rows={rows} className={`${inputBase} ${border} min-h-24 resize-y py-3 leading-relaxed [field-sizing:content]`} />
      ) : (
        <div className="flex min-w-0 items-stretch">
          {prefix ? (
            <span aria-hidden="true" className="flex items-center rounded-l-sm border border-r-0 border-line bg-mist px-3 text-muted">
              {prefix}
            </span>
          ) : null}
          <input
            {...common}
            type={type}
            inputMode={inputMode}
            autoComplete="off"
            spellCheck={type === "text" ? undefined : false}
            className={`${inputBase} ${border} min-h-12 ${prefix ? "rounded-l-none" : ""}`}
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          {error ? (
            <p id={`${id}-error`} className="text-sm font-medium [overflow-wrap:anywhere] text-error">
              {error}
            </p>
          ) : null}
          {hint ? (
            <p id={`${id}-hint`} className="text-xs [overflow-wrap:anywhere] text-muted">
              {hint}
            </p>
          ) : null}
        </div>
        {max !== undefined ? (
          <p
            id={`${id}-count`}
            className={`shrink-0 text-xs tabular-nums ${over ? "font-semibold text-error" : near ? "text-amber-ink" : "text-muted"}`}
          >
            {over ? `${length - max} too many` : `${length}/${max}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Choice
   ------------------------------------------------------------------ */

export function SelectField({
  name,
  label,
  defaultValue,
  options,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  const id = fieldId(name);
  const error = useFieldError(name);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined}
        className={`${inputBase} ${error ? "border-error" : "border-line"} min-h-12 appearance-auto`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const ICON_LABELS: Record<string, string> = {
  shield: "Shield",
  spark: "Spark",
  check: "Tick",
  leaf: "Leaf",
  tag: "Price tag",
  users: "People",
  truck: "Truck",
  compass: "Compass",
  pin: "Map pin",
  flask: "Flask (chemicals)",
  building: "Building",
  plug: "Plug (electronics)",
  cap: "Graduation cap",
  news: "Newspaper",
  file: "Document",
};

export function IconField({ name, label, defaultValue, icons, allowNone }: { name: string; label: string; defaultValue?: string; icons: readonly string[]; allowNone?: boolean }) {
  return (
    <SelectField
      name={name}
      label={label}
      defaultValue={defaultValue ?? ""}
      options={[...(allowNone ? [{ value: "", label: "No icon" }] : []), ...icons.map((i) => ({ value: i, label: ICON_LABELS[i] ?? i }))]}
    />
  );
}

/* ------------------------------------------------------------------
   Layout
   ------------------------------------------------------------------ */

/** A titled card of related fields. Collapsible ones start closed unless `open`. */
export function Group({
  id,
  icon,
  title,
  description,
  children,
  collapsible,
  open,
}: {
  /** Anchor for links such as /admin/pages#page-about; a collapsible group opens itself when targeted */
  id?: string;
  /** Small icon beside the title, so cards are easy to tell apart */
  icon?: IconName;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  open?: boolean;
}) {
  const chip = icon ? (
    <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-paper text-gold-deep">
      <Icon name={icon} size={19} />
    </span>
  ) : null;
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Open and show this group when the address points at it (on load and on later jumps)
  useEffect(() => {
    if (!id || !collapsible) return;
    const reveal = () => {
      const details = detailsRef.current;
      if (!details || window.location.hash !== `#${id}`) return;
      details.open = true;
      details.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      details.querySelector("summary")?.focus({ preventScroll: true });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [id, collapsible]);

  const body = <div className="flex flex-col gap-5">{children}</div>;
  if (collapsible) {
    return (
      <details ref={detailsRef} id={id} open={open} className="group/g scroll-mt-24 rounded-lg border border-line bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 sm:px-6 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-3">
            {chip}
            <span className="flex min-w-0 flex-col">
              <span className="text-lg font-bold [overflow-wrap:anywhere] text-navy">{title}</span>
              {description ? <span className="text-sm text-muted">{description}</span> : null}
            </span>
          </span>
          <Icon name="arrow" size={20} className="shrink-0 rotate-90 text-muted transition-transform group-open/g:-rotate-90" />
        </summary>
        <div className="border-t border-line px-4 py-5 sm:px-6">{body}</div>
      </details>
    );
  }
  return (
    <section id={id} className="scroll-mt-24 rounded-lg border border-line bg-white px-4 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        {chip}
        <div className="min-w-0">
          <h2 className="text-lg font-bold [overflow-wrap:anywhere] text-navy">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5">{body}</div>
    </section>
  );
}

/** Two fields side by side on wider screens, stacked on phones. */
export function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

/* ------------------------------------------------------------------
   Lists
   ------------------------------------------------------------------ */

type ListFieldProps<T> = {
  name: string;
  label: string;
  description?: string;
  initial: T[];
  /** Name for one item, e.g. "Paragraph" */
  itemLabel: string;
  min?: number;
  max?: number;
  /** Value for a newly added item; omit to disallow adding */
  newItem?: T;
  /** Render one item's fields; `prefix` is its dotted name, e.g. "phones.1" */
  renderItem: (prefix: string, item: T, index: number) => React.ReactNode;
};

/**
 * A list the admin can add to, remove from and reorder. Items keep stable
 * React keys, so typed text moves with its item; field names follow the
 * current order, so the server receives the list as it appears on screen.
 */
export function ListField<T>({ name, label, description, initial, itemLabel, min = 0, max = 50, newItem, renderItem }: ListFieldProps<T>) {
  // Keys start at 0 in every list so server and browser render the same markup
  const [items, setItems] = useState(() => initial.map((value, key) => ({ key, value })));
  const nextKey = useRef(initial.length);
  const changed = useFormChanged();
  const listRef = useRef<HTMLOListElement>(null);
  const focusKey = useRef<number | null>(null);
  const first = useRef(true);
  const headingId = useId();
  const error = useFieldError(name);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    changed();
    if (focusKey.current !== null) {
      listRef.current?.querySelector<HTMLElement>(`[data-item="${focusKey.current}"] input, [data-item="${focusKey.current}"] textarea`)?.focus();
      focusKey.current = null;
    }
  }, [items, changed]);

  const move = (from: number, to: number) =>
    setItems((list) => {
      const next = [...list];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });

  const iconButton = "inline-flex size-11 items-center justify-center rounded-sm border border-line text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div role="group" aria-labelledby={headingId} className="flex min-w-0 flex-col gap-3">
      <div>
        <p id={headingId} className="text-sm font-semibold text-navy">
          {label}
        </p>
        {description ? <p className="text-xs text-muted">{description}</p> : null}
        {error ? <p className="mt-1 text-sm font-medium text-error">{error}</p> : null}
      </div>
      <input type="hidden" name={`${name}.${LIST_MARKER}`} value="" />
      <ol ref={listRef} className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={item.key} data-item={item.key} className="flex min-w-0 flex-col gap-3 rounded-md border border-line bg-mist/60 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-muted">
                {itemLabel} {i + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <button type="button" className={iconButton} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} up`}>
                  <Icon name="arrow" size={18} className="-rotate-90" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, i + 1)}
                  aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} down`}
                >
                  <Icon name="arrow" size={18} className="rotate-90" />
                </button>
                {newItem !== undefined || min < items.length ? (
                  <button
                    type="button"
                    className={`${iconButton} hover:border-error hover:text-error`}
                    disabled={items.length <= min}
                    onClick={() => setItems((list) => list.filter((x) => x.key !== item.key))}
                    aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
                    title={items.length <= min ? `Keep at least ${min}` : undefined}
                  >
                    <Icon name="close" size={18} />
                  </button>
                ) : null}
              </div>
            </div>
            {renderItem(`${name}.${i}`, item.value, i)}
          </li>
        ))}
      </ol>
      {newItem !== undefined ? (
        <button
          type="button"
          disabled={items.length >= max}
          onClick={() => {
            const key = nextKey.current++;
            focusKey.current = key;
            setItems((list) => [...list, { key, value: newItem }]);
          }}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-navy/40 px-4 text-sm font-semibold text-navy hover:border-navy hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
        >
          + Add {itemLabel.toLowerCase()}
          {items.length >= max ? ` (maximum ${max})` : ""}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------
   Images
   ------------------------------------------------------------------ */

type ImageValue = { src: string; alt: string; width: number; height: number };

/**
 * A photo field: the current photo (in the shape it is shown on the site),
 * "Replace photo" (upload or choose from the media library), and the
 * description, which is required. Warns, without blocking, when a photo is
 * smaller than the recommended size.
 */
export function ImageField({
  name,
  label,
  image,
  sample,
  max,
  recommended,
  where,
  pickerTitle,
}: {
  name: string;
  /** Label of the description field */
  label: string;
  image: ImageValue | null;
  /** Shown when there is no photo yet (for example a sector's sample photo) */
  sample?: { src: string };
  max?: number;
  recommended: Recommended;
  /** Where the photo appears, in everyday words */
  where: string;
  pickerTitle: string;
}) {
  const [chosen, setChosen] = useState<{ src: string; width: number; height: number } | null>(image ? { src: image.src, width: image.width, height: image.height } : null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pendingAlt = useRef<string | null>(null);
  const changed = useFormChanged();
  const altId = fieldId(`${name}.alt`);

  // After a new photo is chosen: put its library description in the field
  // (or clear it, so the old photo's description is not kept by mistake)
  useEffect(() => {
    if (pendingAlt.current === null) return;
    const input = document.getElementById(altId) as HTMLInputElement | null;
    const alt = pendingAlt.current;
    pendingAlt.current = null;
    if (input && input.value !== alt) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, alt);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      changed();
    }
  }, [chosen, altId, changed]);

  const small = chosen && (chosen.width < recommended.width || chosen.height < recommended.height);
  const shown = chosen?.src ?? sample?.src;

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-48">
        <div className="relative w-full overflow-hidden rounded-md bg-navy" style={{ aspectRatio: `${recommended.width} / ${recommended.height}` }}>
          {shown ? <Image src={shown} alt="" fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover" /> : null}
          {!chosen && sample ? <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-0.5 text-center text-[0.625rem] font-bold text-white uppercase">Sample photo</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-navy/25 px-3 text-sm font-semibold text-navy hover:border-navy"
        >
          <Icon name="image" size={16} />
          {chosen ? "Replace photo" : "Add a photo"}
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-xs text-muted">
          {where}. Best: {recommended.shape}, at least {recommended.width} × {recommended.height} pixels.
          {chosen ? ` This photo: ${chosen.width} × ${chosen.height}.` : ""}
        </p>
        {small ? (
          <p className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-amber-ink">
            This photo is smaller than recommended, so it may look soft on large screens. It can still be used.
          </p>
        ) : null}
        {chosen ? (
          <>
            <input type="hidden" name={`${name}.src`} value={chosen.src} />
            <input type="hidden" name={`${name}.width`} value={chosen.width} />
            <input type="hidden" name={`${name}.height`} value={chosen.height} />
            <TextField
              name={`${name}.alt`}
              label={label}
              defaultValue={image?.alt ?? ""}
              max={max}
              hint="Describe what the photo shows, for visitors who can't see it and for search engines."
            />
          </>
        ) : (
          <p className="text-sm text-muted">No photo of its own yet.</p>
        )}
      </div>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={pickerTitle}
        recommended={recommended}
        where={where}
        onSelect={(media: MediaRecord) => {
          pendingAlt.current = media.alt;
          setChosen({ src: media.url, width: media.width ?? recommended.width, height: media.height ?? recommended.height });
        }}
      />
    </div>
  );
}
