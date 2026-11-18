/**
 * The admin's structure, used by the sidebar, the phone drawer and the
 * command palette, so all three always agree. Grouped the way the public
 * site is grouped: an editor finds a page by thinking about where its
 * content appears on the website.
 */
import type { IconName } from "../site";
import { PAGE_KEYS, type PageKey } from "../content/sections";

/** Remembers the collapsed desktop sidebar (a convenience cookie, read by the panel layout) */
export const SIDEBAR_COOKIE = "bfl_admin_sidebar";

export type NavLink = {
  href: string;
  label: string;
  icon?: IconName;
  /** Extra words the command palette matches, e.g. "slideshow" for the home page */
  keywords?: string[];
  /** Not built yet: shown with a "Soon" badge */
  soon?: boolean;
};

export type NavEntry = NavLink & {
  icon: IconName;
  /** Sub-items shown when the entry is expanded (e.g. each sector) */
  children?: NavLink[];
};

export type NavSection = { label: string; entries: NavEntry[] };

export const PAGE_LABELS: Record<"home" | PageKey, string> = {
  home: "Home",
  about: "About",
  sectors: "Sectors",
  leadership: "Leadership",
  gallery: "Gallery",
  news: "News",
  downloads: "Downloads",
  contact: "Contact",
};

/** Anchor of a page's group in the Page text and SEO editor */
export const pageSeoAnchor = (key: "home" | PageKey) => `page-${key}`;

export function buildNavigation(input: {
  sectors: { slug: string; name: string }[];
  leaders: { slug: string; name: string }[];
}): NavSection[] {
  return [
    {
      label: "Overview",
      entries: [
        { href: "/admin", label: "Dashboard", icon: "spark", keywords: ["home", "start", "overview", "attention", "launch"] },
        { href: "/admin/activity", label: "Activity", icon: "calendar", keywords: ["history", "log", "changes", "timeline", "who"] },
      ],
    },
    {
      label: "Website",
      entries: [
        {
          href: "/admin/home",
          label: "Home page",
          icon: "home",
          keywords: ["headline", "hero", "facts", "call to action"],
          children: [
            { href: "/admin/home", label: "Page text", keywords: ["headline", "hero", "facts"] },
            { href: "/admin/home/slideshow", label: "Slideshow photos", keywords: ["slides", "photos", "hero images"] },
          ],
        },
        { href: "/admin/about", label: "About", icon: "compass", keywords: ["mission", "vision", "values", "philosophy", "introduction"] },
        {
          href: "/admin/sectors",
          label: "Sectors",
          icon: "building",
          keywords: ["services", "business"],
          children: input.sectors.map((s) => ({ href: `/admin/sectors/${s.slug}`, label: s.name, keywords: ["sector"] })),
        },
        {
          href: "/admin/leadership",
          label: "Leadership",
          icon: "users",
          keywords: ["directors", "team", "people"],
          children: input.leaders.map((l) => ({ href: `/admin/leadership/${l.slug}`, label: l.name, keywords: ["director", "biography"] })),
        },
        { href: "/admin/contact", label: "Contact details", icon: "pin", keywords: ["phone", "email", "address", "whatsapp", "company name"] },
      ],
    },
    {
      label: "Media and news",
      entries: [
        { href: "/admin/media", label: "Media library", icon: "image", keywords: ["photos", "pictures", "upload", "images", "files"] },
        { href: "/admin/gallery", label: "Gallery", icon: "image", keywords: ["photos", "pictures"], soon: true },
        { href: "/admin/news", label: "News", icon: "news", keywords: ["articles", "stories"], soon: true },
        { href: "/admin/downloads", label: "Downloads", icon: "download", keywords: ["documents", "pdf", "files", "profile"], soon: true },
      ],
    },
    {
      label: "Search and settings",
      entries: [
        {
          href: "/admin/pages",
          label: "Page text and SEO",
          icon: "search",
          keywords: ["google", "title", "description", "banner"],
          children: (["home", ...PAGE_KEYS] as const).map((key) => ({
            href: `/admin/pages#${pageSeoAnchor(key)}`,
            label: `${PAGE_LABELS[key]} page`,
            keywords: ["seo", "banner", "google"],
          })),
        },
        { href: "/admin/account", label: "Account", icon: "key", keywords: ["password", "sign out", "devices"] },
      ],
    },
  ];
}

/** True when `href` is the current page or contains it (hash links match their page). */
export function isCurrent(pathname: string, href: string, exact = false): boolean {
  const path = href.split("#")[0];
  if (path === "/admin" || exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}
