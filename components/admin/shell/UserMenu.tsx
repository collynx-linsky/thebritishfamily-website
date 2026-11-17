"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { logout } from "@/lib/admin/actions/auth";
import { Icon } from "../../Icon";

const MENU_ID = "admin-user-menu";

/**
 * Signed-in name with a small menu (Account, View website, Sign out).
 * Uses the browser's popover: it sits above everything, and Esc or a click
 * outside closes it.
 */
export function UserMenu({ displayName, email }: { displayName: string; email: string }) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Place the menu under the button just before it opens (works in every browser)
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const place = (e: Event) => {
      const button = buttonRef.current;
      if ((e as ToggleEvent).newState !== "open" || !button) return;
      const r = button.getBoundingClientRect();
      menu.style.top = `${Math.round(r.bottom + 8)}px`;
      menu.style.right = `${Math.max(8, Math.round(document.documentElement.clientWidth - r.right))}px`;
    };
    menu.addEventListener("beforetoggle", place);
    return () => menu.removeEventListener("beforetoggle", place);
  }, []);
  const close = () => document.getElementById(MENU_ID)?.hidePopover();
  const item =
    "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-mist hover:text-navy";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={MENU_ID}
        aria-haspopup="true"
        className="flex min-h-11 items-center gap-2.5 rounded-full border border-paper-line bg-white py-1 pr-3 pl-1 text-sm font-semibold text-navy transition-colors hover:border-navy/40"
      >
        <span aria-hidden="true" className="inline-flex size-8 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate md:inline">{displayName}</span>
        <span className="sr-only md:hidden">{displayName}: account menu</span>
        <Icon name="chevron" size={14} className="hidden rotate-90 text-muted md:block" />
      </button>

      <div
        ref={menuRef}
        id={MENU_ID}
        popover="auto"
        className="fixed m-0 w-64 max-w-[calc(100vw-1rem)] rounded-lg border border-paper-line bg-white p-2 text-ink shadow-[0_16px_40px_-12px_rgba(20,39,77,0.35)] [inset:auto]"
      >
        <div className="border-b border-line px-3 pt-1 pb-3">
          <p className="font-semibold text-navy">{displayName}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
        <ul className="pt-2">
          <li>
            <Link href="/admin/account" onClick={close} className={item}>
              <Icon name="key" size={16} className="text-muted" />
              Account and password
            </Link>
          </li>
          <li>
            <a href="/" target="_blank" rel="noopener" onClick={close} className={item}>
              <Icon name="external" size={16} className="text-muted" />
              View website
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
          <li>
            <form action={logout}>
              <button type="submit" className={item}>
                <Icon name="logout" size={16} className="text-muted" />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
