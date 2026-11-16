/**
 * The areas of the admin panel, organised the way the public site is, so the
 * administrator finds a field by thinking about where it appears on the site.
 * This one list drives the navigation, the dashboard and "last updated".
 */
import type { SectionKey } from "../db/schema";
import type { IconName } from "../site";

export type AdminArea = {
  key: string;
  label: string;
  /** One line in everyday language: what you can change here */
  description: string;
  href: string;
  icon: IconName;
  /** Public page to open with "View on site" */
  viewOnSite: string;
  /** What this area edits, for the "last updated" time */
  sources: { sections?: SectionKey[]; tables?: ("sectors" | "leaders" | "hero_slides" | "gallery_photos" | "news_articles" | "downloads")[] };
};

export const ADMIN_AREAS: AdminArea[] = [
  {
    key: "home",
    label: "Home page",
    description: "Main headline, slideshow photos, highlight cards, key facts and the call-to-action band.",
    href: "/admin/home",
    icon: "home",
    viewOnSite: "/",
    sources: { sections: ["home"], tables: ["hero_slides"] },
  },
  {
    key: "about",
    label: "About",
    description: "Introduction, mission, vision, philosophy, values, how we work, and the About photos.",
    href: "/admin/about",
    icon: "compass",
    viewOnSite: "/about",
    sources: { sections: ["about"] },
  },
  {
    key: "sectors",
    label: "Sectors",
    description: "The text and photo of each of the four sectors.",
    href: "/admin/sectors",
    icon: "building",
    viewOnSite: "/sectors",
    sources: { tables: ["sectors"] },
  },
  {
    key: "leadership",
    label: "Leadership",
    description: "Each director's name, role, biography, email and portrait.",
    href: "/admin/leadership",
    icon: "users",
    viewOnSite: "/leadership",
    sources: { tables: ["leaders"] },
  },
  {
    key: "gallery",
    label: "Gallery",
    description: "Add, replace, reorder and remove photos, and choose which appear on the home page.",
    href: "/admin/gallery",
    icon: "image",
    viewOnSite: "/gallery",
    sources: { tables: ["gallery_photos"] },
  },
  {
    key: "news",
    label: "News",
    description: "Publish, edit and remove news articles.",
    href: "/admin/news",
    icon: "news",
    viewOnSite: "/news",
    sources: { tables: ["news_articles"] },
  },
  {
    key: "downloads",
    label: "Downloads",
    description: "Upload and manage the company profile, forms and other documents.",
    href: "/admin/downloads",
    icon: "download",
    viewOnSite: "/downloads",
    sources: { tables: ["downloads"] },
  },
  {
    key: "contact",
    label: "Contact details",
    description: "Company name, address, phone numbers, email, WhatsApp number and footer text.",
    href: "/admin/contact",
    icon: "pin",
    viewOnSite: "/contact",
    sources: { sections: ["company"] },
  },
  {
    key: "pages",
    label: "Page text and SEO",
    description: "Each page's banner text and photo, and the title and description shown in Google.",
    href: "/admin/pages",
    icon: "search",
    viewOnSite: "/",
    sources: { sections: ["pages"] },
  },
];

export const ACCOUNT_AREA = {
  key: "account",
  label: "Account",
  description: "Change your password and sign out of other devices.",
  href: "/admin/account",
  icon: "key" as IconName,
};
