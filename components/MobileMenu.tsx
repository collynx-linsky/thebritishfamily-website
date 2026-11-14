"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/lib/site";
import { Icon } from "./Icon";
import { isActivePath } from "./NavLinks";

type MobileMenuProps = {
  items: NavItem[];
  quote: NavItem;
  phone: { display: string; href: string };
  whatsappHref: string;
};

export function MobileMenu({ items, quote, phone, whatsappHref }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // While open: lock page scroll, move focus into the menu, close on Escape
  // and when the viewport grows to the desktop layout.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => desktop.matches && setOpen(false);

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-12 items-center justify-center rounded-sm text-navy transition-colors hover:bg-mist"
      >
        <Icon name={open ? "close" : "menu"} size={26} strokeWidth={2} />
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open ? (
        <>
          {/* Backdrop: tapping outside the panel closes the menu */}
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-x-0 top-full h-dvh bg-ink/40 transition-opacity duration-200 starting:opacity-0"
          />
          <div
            ref={panelRef}
            id={panelId}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-line bg-white shadow-lift transition duration-200 ease-out starting:-translate-y-2 starting:opacity-0"
          >
            <nav aria-label="Main" className="mx-auto w-full max-w-site px-5 pt-3 pb-6 sm:px-6">
              <ul className="flex flex-col">
                {items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <li key={item.href} className="border-b border-line">
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={active ? (pathname === item.href ? "page" : "true") : undefined}
                        className={`flex min-h-14 items-center justify-between font-display text-lg font-bold transition-colors ${active ? "text-navy" : "text-ink hover:text-navy"}`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className={`h-6 w-1 rounded-full ${active ? "bg-gold" : "bg-transparent"}`}
                          />
                          {item.label}
                        </span>
                        <Icon name="arrow" size={18} strokeWidth={2.2} className="text-gold-deep" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href={quote.href}
                  onClick={close}
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold px-6 font-bold text-ink transition-colors hover:bg-gold-bright sm:col-span-2"
                >
                  {quote.label}
                </Link>
                <a
                  href={phone.href}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border-2 border-navy px-4 font-bold text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  <Icon name="phone" size={18} strokeWidth={2} />
                  {phone.display}
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border-2 border-navy px-4 font-bold text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  <Icon name="whatsapp" size={18} strokeWidth={2} />
                  WhatsApp
                </a>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
