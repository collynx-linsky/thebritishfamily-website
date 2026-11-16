"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site";

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop navigation with the current section marked. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-x-6 text-[0.9375rem] font-semibold xl:gap-x-8">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? (pathname === item.href ? "page" : "true") : undefined}
              className={`relative inline-flex min-h-11 items-center text-navy transition-colors hover:text-navy-deep after:absolute after:inset-x-0 after:bottom-0.5 after:h-[3px] after:origin-left after:rounded-full after:bg-gold after:transition-transform after:duration-200 ${active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
