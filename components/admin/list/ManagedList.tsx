"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";
import type { EditorResult } from "@/lib/admin/form-data";
import { SITE_TIME_ZONE } from "@/lib/format";
import { Icon } from "../../Icon";

export type ManagedItem = {
  id: number;
  title: string;
  summary?: string;
  thumb?: { src: string; alt: string };
  updatedAt?: string;
  visible: boolean;
};

type Props = {
  items: ManagedItem[];
  /** e.g. ["photo", "photos"] */
  noun: [string, string];
  /** Leave at least this many visible (the website needs one slide, for example) */
  minVisible?: number;
  setVisible: (id: number, visible: boolean) => Promise<EditorResult>;
  reorder: (ids: number[]) => Promise<EditorResult>;
  remove: (id: number) => Promise<EditorResult>;
  /** Open the item's editor (a page or a dialog) */
  onEdit: (item: ManagedItem) => void;
  undo: () => Promise<EditorResult>;
  canUndo: boolean;
  /** The "New …" button (or a note on why it is not available yet) */
  newButton: React.ReactNode;
};

const updated = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: SITE_TIME_ZONE });

/**
 * A searchable list of items with a Visible switch, reordering (buttons,
 * keyboard and drag), edit, delete and undo. Rows on wide screens, stacked
 * cards on phones. Hiding never deletes anything.
 */
export function ManagedList({ items, noun, minVisible = 0, setVisible, reorder, remove, onEdit, undo, canUndo, newButton }: Props) {
  const [query, setQuery] = useState("");
  const [reordering, setReordering] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string; at: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const dragId = useRef<number | null>(null);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const visibleCount = items.filter((i) => i.visible).length;
  const shown = reordering
    ? order.map((id) => byId.get(id)).filter((i): i is ManagedItem => !!i)
    : items.filter((i) => !query.trim() || `${i.title} ${i.summary ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));

  const act = (key: string, task: () => Promise<EditorResult>, after?: () => void) => {
    setBusy(key);
    startTransition(async () => {
      let r: EditorResult;
      try {
        r = await task();
      } catch {
        r = { status: "error", message: "The server could not be reached. Please try again." };
      }
      setBusy(null);
      setMessage({ ok: r.status !== "error", text: r.message, at: Date.now() });
      if (r.status !== "error") after?.();
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [id] = next.splice(from, 1);
    next.splice(to, 0, id);
    setOrder(next);
  };

  const [one, many] = noun;
  const iconButton = "inline-flex size-11 items-center justify-center rounded-md text-navy hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-paper-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-xs">
          <span className="sr-only">Search {many}</span>
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 text-muted" />
          <input
            type="search"
            value={query}
            disabled={reordering}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${many}…`}
            className="min-h-11 w-full min-w-0 rounded-md border border-line bg-white pr-3 pl-9 text-base text-ink focus:border-navy focus:outline-none disabled:bg-paper"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {reordering ? (
            <>
              <button
                type="button"
                onClick={() => setReordering(false)}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => act("order", () => reorder(order), () => setReordering(false))}
                className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-70"
              >
                {busy === "order" ? "Saving…" : "Save order"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={pending || !canUndo}
                onClick={() => window.confirm("Undo the last change to this list? The website goes back to the version before it.") && act("undo", undo)}
                className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "undo" ? "Undoing…" : "Undo last change"}
              </button>
              <button
                type="button"
                disabled={items.length < 2}
                onClick={() => {
                  setQuery("");
                  setOrder(items.map((i) => i.id));
                  setReordering(true);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-navy disabled:opacity-50"
              >
                <Icon name="menu" size={16} />
                Reorder
              </button>
              {newButton}
            </>
          )}
        </div>
      </div>

      {message ? (
        <p key={message.at} role="status" className={`rounded-lg px-4 py-3 text-sm font-medium ${message.ok ? "bg-white text-navy ring-1 ring-paper-line" : "bg-error/5 text-error"}`}>
          {message.text}
        </p>
      ) : (
        <p role="status" className="sr-only" />
      )}
      {reordering ? (
        <p className="text-sm text-muted">Use the arrows (or Alt + ↑ / ↓ on a row) to change the order, or drag a row with the mouse. Then press Save order.</p>
      ) : null}

      {/* Items */}
      {shown.length ? (
        <ol className="overflow-hidden rounded-xl border border-paper-line bg-white">
          <li aria-hidden="true" className="hidden grid-cols-[6rem_minmax(0,1fr)_8rem_9rem_7rem] items-center gap-4 border-b border-line bg-paper/60 px-4 py-2 text-xs font-bold tracking-wide text-muted uppercase md:grid">
            <span>{reordering ? "Order" : "Photo"}</span>
            <span>Description</span>
            <span>Updated</span>
            <span>On the website</span>
            <span className="text-right">Actions</span>
          </li>
          {shown.map((item, index) => {
            const lastVisible = item.visible && visibleCount <= minVisible;
            return (
              <li
                key={item.id}
                draggable={reordering}
                onDragStart={() => (dragId.current = item.id)}
                onDragOver={(e) => reordering && e.preventDefault()}
                onDrop={() => {
                  if (!reordering || dragId.current === null) return;
                  move(order.indexOf(dragId.current), index);
                  dragId.current = null;
                }}
                onKeyDown={(e) => {
                  if (!reordering || !e.altKey) return;
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    move(index, index - 1);
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    move(index, index + 1);
                  }
                }}
                className={`grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-line p-4 last:border-0 md:grid-cols-[6rem_minmax(0,1fr)_8rem_9rem_7rem] md:items-center ${
                  reordering ? "cursor-grab bg-paper/40" : ""
                } ${item.visible ? "" : "bg-paper/50"}`}
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-md bg-navy">
                  {item.thumb ? (
                    <Image src={item.thumb.src} alt="" fill sizes="96px" className={`object-cover ${item.visible ? "" : "opacity-40 grayscale"}`} />
                  ) : null}
                  <span className="absolute top-1 left-1 rounded-sm bg-white/90 px-1.5 text-xs font-bold text-navy">{index + 1}</span>
                </div>
                <div className="min-w-0">
                  {reordering ? (
                    <p className="font-semibold [overflow-wrap:anywhere] text-navy">{item.title}</p>
                  ) : (
                    <button type="button" onClick={() => onEdit(item)} className="inline-flex min-h-11 items-center text-left font-semibold [overflow-wrap:anywhere] text-navy underline-offset-4 hover:underline">
                      {item.title}
                    </button>
                  )}
                  {item.summary ? <p className="mt-0.5 line-clamp-2 text-sm text-muted">{item.summary}</p> : null}
                  {!item.visible ? <p className="mt-1 text-xs font-bold tracking-wide text-amber-ink uppercase">Hidden from the website</p> : null}
                </div>
                <p className="col-span-2 text-sm text-muted md:col-span-1">
                  <span className="md:sr-only">Updated </span>
                  {item.updatedAt ? updated.format(new Date(item.updatedAt)) : "—"}
                </p>
                {reordering ? (
                  <div className="col-span-2 flex items-center gap-1 md:col-span-2 md:justify-end">
                    <span className="mr-auto text-sm text-muted md:hidden">Position {index + 1}</span>
                    <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move “${item.title}” up`}>
                      <Icon name="chevron" size={18} className="-rotate-90" />
                    </button>
                    <button
                      type="button"
                      className={iconButton}
                      disabled={index === shown.length - 1}
                      onClick={() => move(index, index + 1)}
                      aria-label={`Move “${item.title}” down`}
                    >
                      <Icon name="chevron" size={18} className="rotate-90" />
                    </button>
                  </div>
                ) : (
                  // Phones: switch and actions share one full-width row; wider screens: their own columns
                  <div className="col-span-2 flex items-center justify-between gap-3 md:contents">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.visible}
                        aria-label={`Show “${item.title}” on the website`}
                        disabled={pending || lastVisible}
                        title={lastVisible ? `Keep at least ${minVisible} ${minVisible === 1 ? one : many} visible` : undefined}
                        onClick={() => act(`vis-${item.id}`, () => setVisible(item.id, !item.visible))}
                        className="group/sw inline-flex min-h-11 shrink-0 items-center rounded-full disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {/* The visible track is smaller than the 44 px tap area around it */}
                        <span aria-hidden="true" className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${item.visible ? "bg-green-600" : "bg-line"}`}>
                          <span
                            className={`inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${item.visible ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </span>
                      </button>
                      <span className="text-sm font-semibold text-navy">{busy === `vis-${item.id}` ? "Saving…" : item.visible ? "Visible" : "Hidden"}</span>
                    </div>
                    <div className="flex items-center gap-1 md:justify-end">
                      <button type="button" onClick={() => onEdit(item)} className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm font-semibold text-navy hover:border-navy">
                        Edit
                        <span className="sr-only"> “{item.title}”</span>
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          window.confirm(`Remove “${item.title}” from the list? You can bring it back with “Undo last change”.`) && act(`del-${item.id}`, () => remove(item.id))
                        }
                        aria-label={`Remove “${item.title}”`}
                        className={`${iconButton} hover:text-error`}
                      >
                        <Icon name="close" size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-xl border border-paper-line bg-white p-8 text-center">
          <p className="font-semibold text-navy">{items.length ? `No ${many} match “${query}”.` : `No ${many} yet.`}</p>
          <p className="mt-1 text-sm text-muted">{items.length ? "Try another word, or clear the search." : `Add the first ${one} with the button above.`}</p>
        </div>
      )}

      <p className="text-sm text-muted">
        {items.length} {items.length === 1 ? one : many}, {visibleCount} shown on the website. Hidden {many} are not shown on the website, and nothing is deleted.
      </p>
    </div>
  );
}
