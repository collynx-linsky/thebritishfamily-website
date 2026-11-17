"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { jumpToSection } from "@/lib/admin/jump-to-section";
import { isCurrent, type NavEntry, type NavSection } from "@/lib/admin/navigation";
import { Icon } from "../../Icon";
import { ShortcutHint } from "./ShortcutHint";

type Props = {
  sections: NavSection[];
  logo: { src: string };
  /** Icon-only rail (desktop "Collapse sidebar") */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onOpenSearch: () => void;
  /** Called after a link is followed (closes the phone drawer) */
  onNavigate?: () => void;
};

/**
 * The navy admin sidebar: brand, search, grouped navigation and the
 * collapse control. Used as the desktop sidebar and inside the phone drawer.
 */
export function Sidebar({ sections, logo, collapsed = false, onToggleCollapsed, onOpenSearch, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-navy-deep text-on-navy">
      {/* Brand */}
      <Link
        href="/admin"
        onClick={onNavigate}
        className={`flex min-h-18 shrink-0 items-center gap-3 border-b border-white/10 ${collapsed ? "justify-center px-2" : "px-5"}`}
      >
        <Image src={logo.src} alt="" width={44} height={36} style={{ width: 44, height: 36 }} />
        <span className={collapsed ? "sr-only" : "flex min-w-0 flex-col leading-tight"}>
          <span className="font-display font-bold text-white">The British Family</span>
          <span className="text-[0.6875rem] font-bold tracking-[0.14em] text-gold uppercase">Website admin</span>
        </span>
      </Link>

      {/* Search */}
      <div className={`shrink-0 pt-4 pb-2 ${collapsed ? "px-2" : "px-4"}`}>
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label={collapsed ? "Search or jump to a page" : undefined}
          title={collapsed ? "Search or jump to… (Ctrl K)" : undefined}
          className={`flex min-h-11 w-full items-center gap-2.5 rounded-md border border-white/12 bg-white/5 text-sm text-on-navy/85 transition-colors hover:border-white/25 hover:bg-white/10 ${collapsed ? "justify-center" : "px-3"}`}
        >
          <Icon name="search" size={17} />
          {collapsed ? null : (
            <>
              <span className="min-w-0 flex-1 truncate text-left whitespace-nowrap">Search or jump to…</span>
              <ShortcutHint className="border-white/20 text-on-navy/70" />
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Admin sections" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-color:rgb(255_255_255/0.2)_transparent] scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label} className="mt-4 first:mt-2">
            <p className={collapsed ? "sr-only" : "px-3 pb-1.5 text-[0.6875rem] font-bold tracking-[0.12em] text-on-navy/65 uppercase"}>
              {section.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.entries.map((entry) => (
                <li key={entry.href}>
                  <SidebarEntry entry={entry} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse control (desktop only) */}
      {onToggleCollapsed ? (
        <div className={`shrink-0 border-t border-white/10 py-3 ${collapsed ? "px-2" : "px-3"}`}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : undefined}
            title={collapsed ? "Expand sidebar" : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-md text-sm text-on-navy/85 transition-colors hover:bg-white/8 hover:text-white ${collapsed ? "justify-center" : "px-3"}`}
          >
            <Icon name="sidebar" size={18} className={collapsed ? "rotate-180" : undefined} />
            {collapsed ? null : <span>Collapse sidebar</span>}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SidebarEntry({
  entry,
  pathname,
  collapsed,
  onNavigate,
}: {
  entry: NavEntry;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const hasChildren = !!entry.children?.length && !collapsed;
  const inGroup = isCurrent(pathname, entry.href);
  const exact = isCurrent(pathname, entry.href, true);
  // A group opens by itself when the current page is inside it; the admin can still toggle it
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? inGroup;
  const listId = useId();

  return (
    <>
      <div className="relative flex items-center">
        <Link
          href={entry.href}
          onClick={onNavigate}
          aria-current={exact ? "page" : undefined}
          aria-label={collapsed ? entry.label + (entry.soon ? " (coming soon)" : "") : undefined}
          title={collapsed ? entry.label : undefined}
          className={`group flex min-h-11 flex-1 items-center gap-3 rounded-md text-sm font-semibold transition-colors ${
            collapsed ? "justify-center px-0" : "px-3"
          } ${inGroup ? "bg-white/10 text-white" : "text-on-navy hover:bg-white/6 hover:text-white"}`}
        >
          {/* Gold marker on the current area */}
          <span
            aria-hidden="true"
            className={`absolute top-2 bottom-2 left-0 w-1 rounded-full transition-colors ${inGroup ? "bg-gold" : "bg-transparent"}`}
          />
          <Icon name={entry.icon} size={18} className={inGroup ? "text-gold" : "text-on-navy/80 group-hover:text-white"} />
          {collapsed ? null : (
            <>
              <span className="min-w-0 flex-1 truncate">{entry.label}</span>
              {entry.soon ? (
                <span className="rounded-sm bg-white/10 px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wide text-on-navy/85 uppercase">
                  Soon
                </span>
              ) : null}
            </>
          )}
        </Link>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setToggled(!open)}
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`${open ? "Hide" : "Show"} ${entry.label.toLowerCase()} items`}
            className="ml-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-on-navy/80 transition-colors hover:bg-white/8 hover:text-white"
          >
            <Icon name="chevron" size={16} className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`} />
          </button>
        ) : null}
      </div>
      {hasChildren ? (
        <ul
          id={listId}
          hidden={!open}
          className="mt-0.5 mb-1 ml-[1.375rem] flex flex-col gap-0.5 border-l border-white/12 pl-3"
        >
          {entry.children!.map((child) => {
            const current = !child.href.includes("#") && isCurrent(pathname, child.href, true);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={(e) => {
                    // Same page, another section (e.g. Page text and SEO groups): a plain
                    // hash change, so the section opens itself and comes into view
                    const [path, hash] = child.href.split("#");
                    if (hash && path === pathname) {
                      e.preventDefault();
                      jumpToSection(hash);
                    }
                    onNavigate?.();
                  }}
                  aria-current={current ? "page" : undefined}
                  className={`relative flex min-h-11 items-center rounded-md px-3 text-[0.8125rem] transition-colors ${
                    current ? "font-semibold text-white" : "text-on-navy/85 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {current ? <span aria-hidden="true" className="absolute top-1/2 -left-[1.0625rem] size-2 -translate-y-1/2 rounded-full bg-gold" /> : null}
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}
