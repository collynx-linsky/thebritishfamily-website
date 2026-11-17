"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { restoreVersion, startPreview, updatePreview, type EditorKey } from "@/lib/admin/actions/content";
import type { VersionEntry } from "@/lib/admin/content-store";
import { SITE_TIME_ZONE } from "@/lib/format";
import { Icon } from "../../Icon";
import { EditorHooksContext, type EditorHooks } from "./preview-context";
import { PreviewPane, type PreviewStatus } from "./PreviewPane";

const wideQuery = "(min-width: 1280px)";
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia(wideQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: SITE_TIME_ZONE });

type Props = {
  form: EditorKey;
  slug?: string;
  crumbs: { label: string; href: string }[];
  title: string;
  /** One line under the title, in everyday language */
  help: string;
  viewHref: string;
  /** Public page shown in the live preview; omit for no preview */
  previewPath?: string;
  versions: VersionEntry[];
  children: React.ReactNode;
};

/**
 * The editor screen: header (breadcrumbs, title, status, last saved,
 * actions), the form, and the live preview beside it on wide screens or
 * behind a "Preview" button on smaller ones. Also the version history.
 */
export function EditorWorkspace({ form, slug = "", crumbs, title, help, viewHref, previewPath, versions, children }: Props) {
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches, () => true);
  const [showPreview, setShowPreview] = useState(true);
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const [refreshToken, setRefreshToken] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const historyRef = useRef<HTMLDialogElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Draft Mode for this browser while the editor is open. On leaving (or
  // closing the tab) a keepalive request drops the drafts and ends Draft
  // Mode; it completes even though the page is going away.
  useEffect(() => {
    if (!previewPath) return;
    void startPreview();
    const end = () =>
      fetch("/admin/preview/end", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ form, slug }),
      }).catch(() => {});
    window.addEventListener("pagehide", end);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("pagehide", end);
      void end();
    };
  }, [previewPath, form, slug]);

  const hooks = useMemo<EditorHooks>(
    () => ({
      onFormChange: (data) => {
        if (!previewPath) return;
        if (timer.current) clearTimeout(timer.current);
        setStatus("updating");
        // A short pause after typing, then the preview catches up
        timer.current = setTimeout(async () => {
          const r = await updatePreview(form, slug, data);
          if (r.ok) setRefreshToken((t) => t + 1);
          else setStatus(r.reason === "invalid" ? "paused" : "error");
        }, 600);
      },
      onSettled: () => {
        if (previewPath) setRefreshToken((t) => t + 1);
      },
    }),
    [previewPath, form, slug],
  );

  const onLoaded = useCallback(() => setStatus("ready"), []);
  const refreshNow = useCallback(() => {
    setStatus("updating");
    setRefreshToken((t) => t + 1);
  }, []);
  const last = versions[0];
  const previewInColumn = !!previewPath && wide && showPreview;

  const pane = previewPath ? (
    <PreviewPane path={previewPath} refreshToken={refreshToken} status={status} onLoaded={onLoaded} onRefresh={refreshNow} defaultDevice={wide ? "desktop" : "mobile"} />
  ) : null;

  const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-navy/25 bg-white px-4 text-sm font-semibold text-navy hover:border-navy";

  return (
    <EditorHooksContext value={hooks}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              {crumbs.map((c) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <Link href={c.href} className="inline-flex min-h-11 items-center hover:text-navy hover:underline">
                    {c.label}
                  </Link>
                  <Icon name="chevron" size={13} />
                </li>
              ))}
              <li aria-current="page" className="font-semibold text-navy">
                {title}
              </li>
            </ol>
          </nav>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-extrabold [overflow-wrap:anywhere] text-navy sm:text-4xl">{title}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800 ring-1 ring-green-700/20">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-green-600" />
                  Live on the website
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-muted">{help}</p>
              <p className="mt-1 text-sm text-muted">
                {last ? (
                  <>
                    Last saved {when.format(new Date(last.replacedAt))}
                    {last.who ? ` by ${last.who}` : ""}.
                  </>
                ) : (
                  "Not changed since the website was set up."
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:shrink-0">
              {previewPath && wide ? (
                <button type="button" onClick={() => setShowPreview(!showPreview)} aria-pressed={!showPreview} className={button}>
                  <Icon name="image" size={16} />
                  {showPreview ? "Hide preview" : "Show preview"}
                </button>
              ) : null}
              {previewPath && !wide ? (
                <button
                  type="button"
                  onClick={() => {
                    setSheetOpen(true);
                    sheetRef.current?.showModal();
                  }}
                  className={`${button} border-navy bg-navy text-white hover:bg-navy-deep`}
                >
                  <Icon name="image" size={16} />
                  Preview
                </button>
              ) : null}
              <button type="button" onClick={() => historyRef.current?.showModal()} className={button}>
                <Icon name="calendar" size={16} />
                History
              </button>
              <a href={viewHref} target="_blank" rel="noopener" className={button}>
                View on site
                <Icon name="external" size={15} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </header>

        <div className={previewInColumn ? "grid grid-cols-[minmax(0,1fr)_minmax(26rem,38%)] items-start gap-6" : ""}>
          <div className="min-w-0">{children}</div>
          {previewInColumn ? (
            <aside aria-label="Live preview" className="sticky top-20 h-[calc(100dvh-6.5rem)] min-h-[28rem] rounded-xl border border-paper-line bg-white p-3">
              {pane}
            </aside>
          ) : null}
        </div>
      </div>

      {/* Smaller screens: the preview opens on top, full size */}
      {previewPath && !wide ? (
        <dialog
          ref={sheetRef}
          aria-label="Live preview"
          onClose={() => setSheetOpen(false)}
          className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-3 backdrop:bg-navy-deep/60"
        >
          {sheetOpen ? (
            <div className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-lg font-extrabold text-navy">Live preview</p>
                <button type="button" onClick={() => sheetRef.current?.close()} className={button}>
                  <Icon name="close" size={16} />
                  Back to editing
                </button>
              </div>
              <div className="min-h-0 flex-1">{pane}</div>
            </div>
          ) : null}
        </dialog>
      ) : null}

      <VersionHistory dialogRef={historyRef} form={form} slug={slug} versions={versions} title={title} />
    </EditorHooksContext>
  );
}

function VersionHistory({
  dialogRef,
  form,
  slug,
  versions,
  title,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  form: EditorKey;
  slug: string;
  versions: VersionEntry[];
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const restore = (v: VersionEntry) => {
    if (!window.confirm(`Put back the version from before ${when.format(new Date(v.replacedAt))}? The website changes straight away, and you can undo it.`)) return;
    setBusyId(v.id);
    startTransition(async () => {
      const r = await restoreVersion(form, slug, v.id);
      setBusyId(null);
      setMessage({ ok: r.status !== "error", text: r.message });
    });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="history-title"
      onClose={() => setMessage(null)}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-[min(30rem,100vw)] max-w-none bg-white p-0 backdrop:bg-navy-deep/50"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div>
            <h2 id="history-title" className="font-display text-xl font-extrabold text-navy">
              History
            </h2>
            <p className="mt-1 text-sm text-muted">Earlier versions of {title}. Restoring one puts it back on the website, and can be undone.</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close history"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-navy hover:bg-paper"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {message ? (
          <p role="status" className={`mx-5 mt-4 rounded-md px-4 py-3 text-sm font-medium ${message.ok ? "bg-paper text-navy" : "bg-error/5 text-error"}`}>
            {message.text}
          </p>
        ) : null}
        <ol className="min-h-0 flex-1 overflow-y-auto p-5">
          <li className="mb-3 rounded-lg border border-gold/50 bg-gold/5 p-4">
            <p className="font-semibold text-navy">Current version</p>
            <p className="text-sm text-muted">What the website shows now.</p>
          </li>
          {versions.length ? (
            versions.map((v) => (
              <li key={v.id} className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">Before {when.format(new Date(v.replacedAt))}</p>
                  <p className="text-sm text-muted">
                    Replaced when {v.who ?? "someone"} {v.replacedBy ? v.replacedBy.charAt(0).toLowerCase() + v.replacedBy.slice(1) : "saved a change"}.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => restore(v)}
                  className="inline-flex min-h-11 items-center rounded-md border border-navy/25 px-4 text-sm font-semibold text-navy hover:border-navy disabled:opacity-60"
                >
                  {busyId === v.id ? "Restoring…" : "Restore this version"}
                </button>
              </li>
            ))
          ) : (
            <li className="rounded-lg bg-paper p-4 text-sm text-muted">No earlier versions yet. Each time you save, the version before is kept here.</li>
          )}
        </ol>
      </div>
    </dialog>
  );
}
