"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { IconName } from "@/lib/site";
import { Icon } from "../Icon";

export type AdminNavItem = { href: string; label: string; icon: IconName };

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

/**
 * Admin navigation: a vertical list in the desktop sidebar, a horizontally
 * scrolling row on small screens. The current area is marked with
 * aria-current and a gold bar.
 */
export function AdminNav({ items, account }: { items: AdminNavItem[]; account: AdminNavItem }) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  // On small screens the menu is a sideways-scrolling row: bring the current
  // area into view (centred), so the admin can always see where they are.
  // Scrolls only the row itself, never the page.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const target = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: "instant" });
  }, [pathname]);

  const link = (item: AdminNavItem) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`group flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-semibold whitespace-nowrap transition-colors ${
          active ? "bg-white text-navy shadow-card lg:shadow-none" : "text-muted hover:bg-white/70 hover:text-navy"
        }`}
      >
        <span
          aria-hidden="true"
          className={`hidden h-5 w-1 shrink-0 rounded-full lg:block ${active ? "bg-gold" : "bg-transparent"}`}
        />
        <Icon name={item.icon} size={18} className={active ? "text-gold-deep" : "text-muted group-hover:text-navy"} />
        {item.label}
      </Link>
    );
  };

  return (
    <nav aria-label="Admin sections">
      <ul ref={listRef} className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 scrollbar-thin lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item) => (
          <li key={item.href}>{link(item)}</li>
        ))}
        <li className="lg:mt-4 lg:border-t lg:border-line lg:pt-4">{link(account)}</li>
      </ul>
    </nav>
  );
}
