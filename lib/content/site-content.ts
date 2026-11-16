/**
 * The public site's content-access layer.
 *
 * Every page, component, metadata function and route handler reads content
 * through these getters; nothing else queries the database. Each getter:
 *
 * 1. reads from the database (lib/db) when DATABASE_URL is set,
 * 2. merges over / falls back to the built-in defaults (lib/site.ts and
 *    friends), so a missing or partial record never blanks a section,
 * 3. is cached with "use cache" and tagged, so pages stay static and the
 *    admin panel refreshes exactly what changed with updateTag(tag),
 * 4. on a database error serves the defaults (see lib/content/read.ts).
 */
import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getDb, schema } from "../db";
import type { SectionKey } from "../db/schema";
import { galleryPhotos as defaultGallery, heroSlides as defaultHeroSlides, homeGallery } from "../media";
import { leaders as defaultLeaders, sectors as defaultSectors, type IconName, type ImageAsset, type Leader, type Sector } from "../site";
import { readWithFallback } from "./read";
import { parseSection, sectionDefaults, type SectionData } from "./sections";

/** Cache tags. The admin panel calls updateTag() with these after a save. */
export const TAGS = {
  section: (key: SectionKey) => `content:${key}`,
  sectors: "content:sectors",
  leaders: "content:leaders",
  heroSlides: "content:hero-slides",
  gallery: "content:gallery",
} as const;

/** True when the database has been seeded (used to tell "empty" from "never set up"). */
export async function isSeeded(): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  const [{ value }] = await db.select({ value: count() }).from(schema.contentSections);
  return value > 0;
}

const toImage = (row: { imageUrl: string; imageAlt: string; imageWidth: number; imageHeight: number }): ImageAsset => ({
  src: row.imageUrl,
  alt: row.imageAlt,
  width: row.imageWidth,
  height: row.imageHeight,
});

/* ------------------------------------------------------------------
   Sections
   ------------------------------------------------------------------ */

async function readSection<K extends SectionKey>(key: K): Promise<SectionData[K]> {
  "use cache";
  cacheTag(TAGS.section(key));
  return readWithFallback(
    `section "${key}"`,
    () => sectionDefaults[key],
    async (db) => {
      const [row] = await db
        .select({ data: schema.contentSections.data })
        .from(schema.contentSections)
        .where(eq(schema.contentSections.key, key));
      return parseSection(key, row?.data);
    },
  );
}

export const getCompany = () => readSection("company");
export const getHome = () => readSection("home");
export const getAbout = () => readSection("about");
export const getPages = () => readSection("pages");

export type Company = SectionData["company"];
export type HomeContent = SectionData["home"];
export type AboutContent = SectionData["about"];
export type PagesContent = SectionData["pages"];
export type { SectionData };

/* ------------------------------------------------------------------
   Sectors and leaders
   ------------------------------------------------------------------ */

export async function getSectors(): Promise<Sector[]> {
  "use cache";
  cacheTag(TAGS.sectors);
  return readWithFallback("sectors", () => defaultSectors, async (db) => {
    const rows = await db.select().from(schema.sectors).orderBy(asc(schema.sectors.sortOrder));
    if (!rows.length) return defaultSectors;
    return rows.map((r) => {
      const fallback = defaultSectors.find((s) => s.slug === r.slug);
      return {
        slug: r.slug,
        name: r.name,
        shortName: r.shortName,
        icon: r.icon as IconName,
        summary: r.summary,
        headline: r.headline,
        overview: r.overview.length ? r.overview : (fallback?.overview ?? []),
        focus: r.focus.length ? r.focus : (fallback?.focus ?? []),
        image:
          r.imageUrl && r.imageAlt && r.imageWidth && r.imageHeight
            ? { src: r.imageUrl, alt: r.imageAlt, width: r.imageWidth, height: r.imageHeight }
            : null,
      };
    });
  });
}

export async function getSector(slug: string): Promise<Sector | undefined> {
  return (await getSectors()).find((s) => s.slug === slug);
}

export async function getLeaders(): Promise<Leader[]> {
  "use cache";
  cacheTag(TAGS.leaders);
  return readWithFallback("leaders", () => defaultLeaders, async (db) => {
    const rows = await db.select().from(schema.leaders).orderBy(asc(schema.leaders.sortOrder));
    if (!rows.length) return defaultLeaders;
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      role: r.role,
      summary: r.summary,
      bio: r.bio,
      email: r.email,
      photo: toImage(r),
    }));
  });
}

/* ------------------------------------------------------------------
   Hero slides and gallery
   ------------------------------------------------------------------ */

export async function getHeroSlides(): Promise<ImageAsset[]> {
  "use cache";
  cacheTag(TAGS.heroSlides);
  return readWithFallback("hero slides", () => defaultHeroSlides, async (db) => {
    const rows = await db.select().from(schema.heroSlides).orderBy(asc(schema.heroSlides.sortOrder));
    return rows.length ? rows.map(toImage) : defaultHeroSlides;
  });
}

export type GalleryItem = { image: ImageAsset; sectorSlug: string | null; showOnHome: boolean };

const defaultGalleryItems = (): GalleryItem[] => {
  const onHome = new Set(homeGallery.map((g) => g.image.src));
  return defaultGallery.map((g) => ({
    image: g.image,
    sectorSlug: g.sector?.slug ?? null,
    showOnHome: onHome.has(g.image.src),
  }));
};

/** All gallery photos in order (Gallery page); filter showOnHome for the home carousel. */
export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheTag(TAGS.gallery);
  return readWithFallback("gallery", defaultGalleryItems, async (db) => {
    const rows = await db.select().from(schema.galleryPhotos).orderBy(asc(schema.galleryPhotos.sortOrder));
    if (!rows.length && !(await isSeeded())) return defaultGalleryItems();
    return rows.map((r) => ({ image: toImage(r), sectorSlug: r.sectorSlug, showOnHome: r.showOnHome }));
  });
}
