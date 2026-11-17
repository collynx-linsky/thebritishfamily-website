"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SIDEBAR_COOKIE, type NavSection } from "@/lib/admin/navigation";
import { Icon } from "../../Icon";
import { CommandPalette } from "./CommandPalette";
import { ShortcutHint } from "./ShortcutHint";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

type Props = {
  sections: NavSection[];
  logo: { src: string };
  user: { displayName: string; email: string };
  /** Read from a cookie on the server, so the page never flickers between widths */
  initiallyCollapsed: boolean;
  children: React.ReactNode;
};

/**
 * Frame of every signed-in admin page: navy sidebar (a drawer on phones and
 * tablets), top bar with search, "View website" and the user menu, and the
 * command palette on Ctrl K / Cmd K.
 */
export function AdminShell({ sections, logo, user, initiallyCollapsed, children }: Props) {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const openPalette = useCallback(() => {
    drawerRef.current?.close();
    setPaletteOpen(true);
  }, []);

  // Ctrl K / Cmd K anywhere in the admin
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A followed link closes the drawer (also covers back/forward)
  useEffect(() => {
    drawerRef.current?.close();
  }, [pathname]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "open"}; path=/admin; max-age=31536000; samesite=strict`;
  };

  return (
    <div className={`grid min-h-dvh lg:grid-cols-[var(--sidebar)] ${collapsed ? "[--sidebar:4.75rem_1fr]" : "[--sidebar:16.5rem_1fr]"}`}>
      <a
        href="#main"
        className="fixed top-3 left-3 z-100 -translate-y-24 rounded-sm bg-gold px-5 py-3 font-bold text-ink transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside aria-label="Admin menu" className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar sections={sections} logo={logo} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} onOpenSearch={openPalette} />
      </aside>

      {/* Phone and tablet drawer */}
      <dialog
        ref={drawerRef}
        aria-label="Admin menu"
        onClick={(e) => {
          if (e.target === e.currentTarget) drawerRef.current?.close();
        }}
        onClose={() => menuButtonRef.current?.focus()}
        className="m-0 h-dvh max-h-none w-[min(19rem,86vw)] max-w-none bg-transparent p-0 backdrop:bg-navy-deep/55 open:animate-[drawer-in_200ms_ease-out] motion-reduce:open:animate-none lg:hidden"
      >
        <div className="relative h-full">
          <Sidebar sections={sections} logo={logo} onOpenSearch={openPalette} onNavigate={() => drawerRef.current?.close()} />
          <button
            type="button"
            onClick={() => drawerRef.current?.close()}
            aria-label="Close menu"
            className="absolute top-3.5 right-2 inline-flex size-11 items-center justify-center rounded-md text-on-navy hover:bg-white/10"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </dialog>

      <div className="flex min-w-0 flex-col bg-paper">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-paper-line bg-paper/90 backdrop-blur">
          <div className="flex min-h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => drawerRef.current?.showModal()}
              aria-label="Open menu"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-navy hover:bg-white lg:hidden"
            >
              <Icon name="menu" size={22} />
            </button>
            <button
              type="button"
              onClick={openPalette}
              aria-label="Find a page or section"
              className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-md border border-paper-line bg-white text-sm text-muted transition-colors hover:border-navy/40 max-sm:size-11 max-sm:justify-center sm:w-full sm:max-w-sm sm:px-3"
            >
              <Icon name="search" size={17} className="shrink-0" />
              <span className="hidden flex-1 truncate text-left sm:inline">Find a page or section…</span>
              <ShortcutHint className="border-line text-muted" />
            </button>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy/25 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-navy max-sm:size-11 max-sm:justify-center max-sm:px-0"
              >
                <Icon name="external" size={16} />
                <span className="max-sm:sr-only">View website</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <UserMenu displayName={user.displayName} email={user.email} />
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} sections={sections} />
    </div>
  );
}
