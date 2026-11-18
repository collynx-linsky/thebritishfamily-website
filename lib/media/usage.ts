/**
 * Where each file is used on the website, worked out from the content
 * itself by URL (so it can never drift out of date). No server-only
 * imports: the clean-up script uses this too.
 */
import { parseSection, PAGE_KEYS } from "../content/sections";
import type { Database } from "../db/client";
import * as schema from "../db/schema";

export type Usage = { label: string; href: string };

const ABOUT_IMAGE_LABELS: Record<string, string> = {
  intro: "About page: introduction photo",
  philosophy: "About page: philosophy photo",
  missionBackground: "About page: mission background",
  approach: "About page: “How we work” photo",
  homeCollageTall: "Home page: tall about photo",
  homeCollageSmall: "Home page: small about photo",
};

/** Every place each URL appears, keyed by URL. */
export async function findUsage(db: Database): Promise<Map<string, Usage[]>> {
  const [sections, sectors, leaders, slides, gallery, news, downloads] = await Promise.all([
    db.select({ key: schema.contentSections.key, data: schema.contentSections.data }).from(schema.contentSections),
    db.select({ slug: schema.sectors.slug, name: schema.sectors.name, url: schema.sectors.imageUrl }).from(schema.sectors),
    db.select({ slug: schema.leaders.slug, name: schema.leaders.name, url: schema.leaders.imageUrl }).from(schema.leaders),
    db.select({ url: schema.heroSlides.imageUrl }).from(schema.heroSlides),
    db.select({ url: schema.galleryPhotos.imageUrl }).from(schema.galleryPhotos),
    db.select({ title: schema.newsArticles.title, url: schema.newsArticles.imageUrl }).from(schema.newsArticles),
    db.select({ title: schema.downloads.title, url: schema.downloads.fileUrl }).from(schema.downloads),
  ]);
  const map = new Map<string, Usage[]>();
  const add = (url: string | null | undefined, usage: Usage) => {
    if (!url) return;
    map.set(url, [...(map.get(url) ?? []), usage]);
  };

  const about = parseSection("about", sections.find((s) => s.key === "about")?.data);
  for (const [key, img] of Object.entries(about.images)) add(img.src, { label: ABOUT_IMAGE_LABELS[key] ?? "About page", href: "/admin/about#photos" });
  const pages = parseSection("pages", sections.find((s) => s.key === "pages")?.data);
  for (const key of PAGE_KEYS) add(pages[key].bannerImage?.src, { label: `${key[0].toUpperCase()}${key.slice(1)} page banner`, href: `/admin/pages#page-${key}` });

  for (const s of sectors) add(s.url, { label: `${s.name}: sector photo`, href: `/admin/sectors/${s.slug}` });
  for (const l of leaders) add(l.url, { label: `${l.name}: portrait`, href: `/admin/leadership/${l.slug}` });
  for (const s of slides) add(s.url, { label: "Home page slideshow", href: "/admin/home/slideshow" });
  for (const g of gallery) add(g.url, { label: "Gallery", href: "/admin/gallery" });
  for (const n of news) add(n.url, { label: `News: ${n.title}`, href: "/admin/news" });
  for (const d of downloads) add(d.url, { label: `Download: ${d.title}`, href: "/admin/downloads" });
  return map;
}
