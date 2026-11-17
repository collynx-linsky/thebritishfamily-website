"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../../Icon";

export type PreviewStatus = "loading" | "ready" | "updating" | "paused" | "error";
type Device = "desktop" | "mobile";
const WIDTH: Record<Device, number> = { desktop: 1280, mobile: 390 };

const STATUS_TEXT: Record<PreviewStatus, string> = {
  loading: "Loading the preview…",
  ready: "Showing your unsaved changes",
  updating: "Updating…",
  paused: "Paused until the highlighted fields are fixed",
  error: "The preview could not be updated",
};

/**
 * The real public page in a frame, scaled to fit, at desktop or phone width.
 * It reloads when `refreshToken` changes, keeping the scroll position, and
 * hides the site's own "Preview" bar inside the frame.
 */
function PreviewFrame({ path, device, refreshToken, onLoaded, title }: { path: string; device: Device; refreshToken: number; onLoaded: () => void; title: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const scrollY = useRef(0);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reload on request, remembering where the editor was looking
  useEffect(() => {
    if (!refreshToken) return;
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    try {
      scrollY.current = win.scrollY;
      win.location.reload();
    } catch {
      // Not loaded yet: the next load shows the latest anyway
    }
  }, [refreshToken]);

  const width = WIDTH[device];
  const scale = box.w ? Math.min(1, box.w / width) : 1;

  return (
    <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-paper-line bg-white">
      <iframe
        ref={frameRef}
        src={path}
        title={title}
        onLoad={() => {
          const win = frameRef.current?.contentWindow;
          try {
            win?.document.querySelector("[data-preview-indicator]")?.remove();
            if (scrollY.current) win?.scrollTo({ top: scrollY.current, behavior: "instant" });
          } catch {
            // Cross-origin would block this; the preview is same-origin
          }
          onLoaded();
        }}
        style={{
          width,
          height: box.h ? box.h / scale : "100%",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginLeft: device === "mobile" && box.w > width * scale ? (box.w - width * scale) / 2 : 0,
        }}
        className="block border-0 bg-white"
      />
    </div>
  );
}

export function PreviewPane({
  path,
  refreshToken,
  status,
  onLoaded,
  onRefresh,
  defaultDevice = "desktop",
}: {
  path: string;
  refreshToken: number;
  status: PreviewStatus;
  onLoaded: () => void;
  onRefresh: () => void;
  /** Phone size on phones and tablets, desktop size beside the form on wide screens */
  defaultDevice?: Device;
}) {
  const [device, setDevice] = useState<Device>(defaultDevice);
  const fullRef = useRef<HTMLDialogElement>(null);
  const [full, setFull] = useState(false);

  const toolbarButton = "inline-flex size-11 items-center justify-center rounded-md text-navy hover:bg-paper aria-pressed:bg-navy aria-pressed:text-white";

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex min-w-0 items-center gap-2 text-sm">
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${status === "ready" ? "bg-green-600" : status === "paused" || status === "error" ? "bg-gold-deep" : "animate-pulse bg-navy/50"}`}
        />
        <span role="status" aria-live="polite" className="truncate font-medium text-muted">
          {STATUS_TEXT[status]}
        </span>
      </p>
      <div className="flex items-center gap-1" role="group" aria-label="Preview size">
        <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} className={toolbarButton} title="Desktop">
          <Icon name="building" size={17} />
          <span className="sr-only">Desktop size</span>
        </button>
        <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")} className={toolbarButton} title="Phone">
          <Icon name="phone" size={17} />
          <span className="sr-only">Phone size</span>
        </button>
        <button type="button" onClick={onRefresh} className={toolbarButton} title="Refresh">
          <Icon name="spark" size={17} />
          <span className="sr-only">Refresh the preview</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setFull(true);
            fullRef.current?.showModal();
          }}
          className={toolbarButton}
          title="Full screen"
        >
          <Icon name="external" size={17} />
          <span className="sr-only">Show the preview full screen</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {toolbar}
      <PreviewFrame path={path} device={device} refreshToken={refreshToken} onLoaded={onLoaded} title="Live preview of the page" />
      <dialog
        ref={fullRef}
        aria-label="Live preview, full screen"
        onClose={() => setFull(false)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-3 backdrop:bg-navy-deep/60 sm:p-5"
      >
        {full ? (
          <div className="flex h-full flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-extrabold text-navy">Live preview</p>
              <button
                type="button"
                onClick={() => fullRef.current?.close()}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-4 font-semibold text-navy hover:border-navy"
              >
                <Icon name="close" size={16} />
                Close
              </button>
            </div>
            {toolbar}
            <PreviewFrame path={path} device={device} refreshToken={refreshToken} onLoaded={onLoaded} title="Live preview of the page, full screen" />
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
