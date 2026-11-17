"use client";

import { Command } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { logout } from "@/lib/admin/actions/auth";
import { jumpToSection } from "@/lib/admin/jump-to-section";
import type { NavSection } from "@/lib/admin/navigation";
import type { IconName } from "@/lib/site";
import { Icon } from "../../Icon";

type PaletteItem = {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  keywords: string[];
  href?: string;
  external?: boolean;
  run?: "logout";
  hint?: string;
};

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Predictable matching for people typing a page or item name: every word
 * typed must start a word of the item's name or keywords; whole-name
 * matches rank first. (cmdk's default fuzzy match accepts scattered
 * letters, so "constr" matched "Contact details".) keywords[0] is the label.
 */
function scoreItem(_value: string, search: string, keywords?: string[]): number {
  const query = words(search);
  if (!query.length) return 1;
  const [label = "", ...extra] = keywords ?? [];
  const labelText = label.toLowerCase();
  const labelWords = words(label);
  const extraWords = extra.flatMap(words);
  const startsALabelWord = (q: string) => labelWords.some((w) => w.startsWith(q));
  if (labelText.startsWith(search.trim().toLowerCase())) return 1;
  if (query.every(startsALabelWord)) return 0.9;
  if (query.every((q) => startsALabelWord(q) || extraWords.some((w) => w.startsWith(q)))) return 0.6;
  return 0;
}

/** Editors mark the page while it has unsaved changes (see EditorShell). */
const confirmLeave = () =>
  document.documentElement.dataset.unsavedChanges !== "true" ||
  window.confirm("You have unsaved changes. Leave this page without saving them?");

/**
 * Jump to any section, item or action. Opens with Ctrl K / Cmd K or the
 * search buttons. Built on a native <dialog> (focus stays inside, Esc
 * closes, the page behind is inert) with cmdk for the accessible list.
 */
export function CommandPalette({ open, onClose, sections }: { open: boolean; onClose: () => void; sections: NavSection[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const logoutRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    for (const section of sections) {
      for (const entry of section.entries) {
        list.push({
          id: entry.href,
          label: entry.label,
          group: "Go to",
          icon: entry.icon,
          keywords: [section.label, ...(entry.keywords ?? [])],
          href: entry.href,
          hint: entry.soon ? "Coming soon" : section.label,
        });
        for (const child of entry.children ?? []) {
          list.push({
            id: child.href,
            label: child.label,
            group: entry.label,
            icon: entry.icon,
            keywords: [entry.label, ...(child.keywords ?? [])],
            href: child.href,
            hint: entry.label,
          });
        }
      }
    }
    list.push(
      { id: "action:site", label: "View the website", group: "Actions", icon: "external", keywords: ["open", "public", "live"], href: "/", external: true, hint: "Opens in a new tab" },
      { id: "action:password", label: "Change password", group: "Actions", icon: "key", keywords: ["account", "security"], href: "/admin/account" },
      { id: "action:logout", label: "Sign out", group: "Actions", icon: "logout", keywords: ["log out", "exit"], run: "logout" },
    );
    return list;
  }, [sections]);

  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of items) map.set(item.group, [...(map.get(item.group) ?? []), item]);
    return [...map];
  }, [items]);

  const select = (item: PaletteItem) => {
    onClose();
    if (item.external && item.href) {
      window.open(item.href, "_blank", "noopener");
      return;
    }
    if (!confirmLeave()) return;
    if (item.run === "logout") {
      logoutRef.current?.requestSubmit();
      return;
    }
    if (!item.href) return;
    const [path, hash] = item.href.split("#");
    // Same page, different section: move to it (and let collapsed groups open themselves)
    if (hash && path === pathname) {
      jumpToSection(hash);
      return;
    }
    router.push(item.href);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search the admin"
      onClose={() => {
        setSearch("");
        onClose();
      }}
      onClick={(e) => {
        // A click on the backdrop (outside the panel) closes the palette
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 mx-auto mt-[8vh] w-[min(40rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-xl bg-white p-0 text-ink shadow-[0_24px_64px_-16px_rgba(20,39,77,0.45)] backdrop:bg-navy-deep/55 backdrop:backdrop-blur-[2px] open:animate-[palette-in_160ms_ease-out] motion-reduce:open:animate-none"
    >
      <Command label="Search the admin" loop filter={scoreItem} className="flex max-h-[min(34rem,80dvh)] flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" size={18} className="shrink-0 text-muted" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            autoFocus
            placeholder="Search pages, sectors, directors or actions…"
            className="min-h-14 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted/80 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 shrink-0 items-center rounded-sm border border-line px-2 text-xs font-semibold text-muted hover:border-navy hover:text-navy"
          >
            Esc
          </button>
        </div>
        <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:uppercase">
          <Command.Empty className="px-4 py-10 text-center text-sm text-muted">
            Nothing matches “{search}”. Try a page name, “photo”, “phone” or “password”.
          </Command.Empty>
          {groups.map(([group, groupItems]) => (
            <Command.Group key={group} heading={group}>
              {groupItems.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  keywords={[item.label, ...item.keywords]}
                  onSelect={() => select(item)}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-3 text-sm text-ink data-[selected=true]:bg-mist data-[selected=true]:text-navy"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-paper text-navy">
                    <Icon name={item.icon} size={16} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{item.label}</span>
                  {item.hint ? <span className="hidden shrink-0 text-xs text-muted sm:inline">{item.hint}</span> : null}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <p className="hidden border-t border-line px-4 py-2.5 text-xs text-muted sm:block">
          <kbd className="font-sans font-semibold">↑</kbd> <kbd className="font-sans font-semibold">↓</kbd> to move,{" "}
          <kbd className="font-sans font-semibold">Enter</kbd> to open, <kbd className="font-sans font-semibold">Esc</kbd> to close
        </p>
      </Command>
      <form ref={logoutRef} action={logout} hidden />
    </dialog>
  );
}
