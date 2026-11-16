"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from "react";
import type { EditorResult, FieldErrors } from "@/lib/admin/form-data";
import { useHydrated } from "../useHydrated";

const ErrorsContext = createContext<FieldErrors>({});
const ChangeContext = createContext<() => void>(() => {});

/** The server's error message for a field, by its dotted name. */
export const useFieldError = (name: string) => useContext(ErrorsContext)[name];
/** Tell the editor the form changed in a way that fires no input event (list add, remove, move). */
export const useFormChanged = () => useContext(ChangeContext);

const serialize = (form: HTMLFormElement) =>
  new URLSearchParams(Array.from(new FormData(form), ([k, v]) => [k, typeof v === "string" ? v : ""])).toString();

type Props = {
  /** Changes whenever the stored content changes; the fields reload from it */
  version: string;
  canUndo: boolean;
  isOriginal: boolean;
  save: (formData: FormData) => Promise<EditorResult>;
  undo: () => Promise<EditorResult>;
  restore: () => Promise<EditorResult>;
  children: React.ReactNode;
};

/**
 * The frame around every content editor: the form, and a save bar that
 * stays on screen with Save, Undo last change and Restore original.
 *
 * - Fields are uncontrolled; after a save, undo or restore the page is
 *   refreshed with what is now stored and the form remounts on `version`.
 * - Unsaved changes are detected by comparing the form's fields with how
 *   they were when it loaded; leaving the page then asks for confirmation.
 * - Server validation errors are keyed by field name; the first invalid
 *   field is opened, scrolled into view and focused.
 */
export function EditorShell({ version, canUndo, isOriginal, save, undo, restore, children }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const initial = useRef<{ version: string; value: string } | null>(null);
  const [dirtyFor, setDirtyFor] = useState<string | null>(null);
  const [result, setResult] = useState<(EditorResult & { at: number }) | null>(null);
  const [busy, setBusy] = useState<"save" | "undo" | "restore" | null>(null);
  const [, startTransition] = useTransition();
  const hydrated = useHydrated();
  const dirty = dirtyFor === version;

  // Remember the loaded state of this version's fields
  useEffect(() => {
    if (formRef.current) initial.current = { version, value: serialize(formRef.current) };
  }, [version]);

  const checkDirty = useCallback(() => {
    const form = formRef.current;
    if (!form || initial.current?.version !== version) return;
    setDirtyFor(serialize(form) !== initial.current.value ? version : null);
  }, [version]);

  // Warn before closing the tab or following a link with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(link.href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      if (!window.confirm("You have unsaved changes. Leave this page without saving them?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  // Bring the first invalid field into view
  useEffect(() => {
    if (result?.status !== "error" || !result.fields) return;
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!first) return;
    for (let d = first.closest("details"); d; d = d.parentElement?.closest("details") ?? null) d.open = true;
    first.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    first.focus({ preventScroll: true });
  }, [result]);

  const perform = (kind: "save" | "undo" | "restore", task: () => Promise<EditorResult>) => {
    setBusy(kind);
    startTransition(async () => {
      let r: EditorResult;
      try {
        r = await task();
      } catch {
        r = { status: "error", message: "The server could not be reached. Check your connection and try again." };
      }
      startTransition(() => {
        setResult({ ...r, at: Date.now() });
        setBusy(null);
        // Unless refused, the form now shows exactly what is stored. (Undo can
        // bring back an earlier version whose fields were edited before, so
        // the old "unsaved" mark must not come back with it.)
        if (r.status !== "error") setDirtyFor(null);
      });
    });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Submitted by hand (not through the form's action prop) so React does
    // not reset the fields afterwards: on a validation error they keep the
    // admin's text
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    perform("save", () => save(data));
  };

  const onUndo = () => {
    const ask = dirty
      ? "Undo your last saved change? Your unsaved edits on this page will also be discarded."
      : "Undo your last saved change? The website will go back to the version before it.";
    if (window.confirm(ask)) perform("undo", undo);
  };

  const onRestore = () => {
    const ask = `Put back the original content for this page?${dirty ? " Your unsaved edits will be discarded." : ""} You can undo this afterwards.`;
    if (window.confirm(ask)) perform("restore", restore);
  };

  const errors = result?.status === "error" ? (result.fields ?? {}) : {};
  const message = busy
    ? { save: "Saving…", undo: "Undoing…", restore: "Restoring…" }[busy]
    : result && !(dirty && result.status !== "error")
      ? result.message
      : dirty
        ? "You have unsaved changes."
        : "All changes saved.";
  const tone =
    !busy && result?.status === "error" ? "text-error" : !busy && dirty ? "text-amber-ink" : "text-muted";
  const disabled = !hydrated || busy !== null;

  return (
    <ErrorsContext value={errors}>
      <ChangeContext value={checkDirty}>
        <form
          key={version}
          ref={formRef}
          onSubmit={onSubmit}
          onInput={checkDirty}
          onChange={checkDirty}
          noValidate
          className="flex flex-col gap-6"
        >
          {children}

          <div className="sticky bottom-0 z-20 mt-2 rounded-t-lg border border-b-0 border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(20,33,61,0.25)] backdrop-blur sm:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <p role="status" aria-live="polite" data-updated={result?.at} className={`min-h-5 text-sm font-medium ${tone}`}>
                {message}
              </p>
              {/* Phones: one row with short labels; the full names stay as accessible names */}
              <div className="grid grid-cols-[auto_auto_1fr] gap-2 md:flex md:shrink-0 md:items-center">
                <button
                  type="button"
                  onClick={onUndo}
                  aria-label="Undo last change"
                  disabled={disabled || !canUndo}
                  title={canUndo ? undefined : "Nothing has been saved here yet"}
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-line px-3 text-sm font-semibold whitespace-nowrap text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-50 md:min-h-11"
                >
                  Undo<span className="hidden md:inline"> last change</span>
                </button>
                <button
                  type="button"
                  onClick={onRestore}
                  aria-label="Restore original"
                  disabled={disabled || isOriginal}
                  title={isOriginal ? "This already is the original content" : undefined}
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-line px-3 text-sm font-semibold whitespace-nowrap text-navy hover:border-navy disabled:cursor-not-allowed disabled:opacity-50 md:min-h-11"
                >
                  Restore<span className="hidden md:inline"> original</span>
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  aria-label={busy === "save" ? "Saving" : "Save changes"}
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-navy px-4 font-bold whitespace-nowrap md:px-6 text-white hover:bg-navy-deep disabled:cursor-wait disabled:opacity-70 md:order-last md:min-h-11"
                >
                  {busy === "save" ? (
                    "Saving…"
                  ) : (
                    <>
                      Save<span className="hidden min-[400px]:inline"> changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </ChangeContext>
    </ErrorsContext>
  );
}
