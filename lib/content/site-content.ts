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
import { asc, count, eq, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { getDb, schema } from "../db";
import type { SectionKey } from "../db/schema";
import { galleryPhotos as defaultGallery, heroSlides as defaultHeroSlides, homeGallery } from "../media";
import { leaders as defaultLeaders, sectors as defaultSectors, type IconName, type ImageAsset, type Leader, type Sector } from "../site";
import { readPreviewDraft } from "./preview";
import { readWithFallback } from "./read";
import { heroSlidesSchema, parseSection, sectionDefaults, type SectionData } from "./sections";

/** Cache tags. The admin panel calls updateTag() with these after a save. */
export const TAGS = {
  section: (key: SectionKey) => `content:${key}`,
  sectors: "content:sectors",
  leaders: "content:leaders",
  heroSlides: "content:hero-slides",
  gallery: "content:gallery",
  /** Media library details used on public pages (focal points) */
  media: "content:media",
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
   Focal points from the media library
   ------------------------------------------------------------------ */

type FocalMap = Record<string, { x: number; y: number }>;

/** Photos whose focal point is not the centre, by URL (one small cached query). */
async function mediaFocals(): Promise<FocalMap> {
  "use cache";
  cacheTag(TAGS.media);
  return readWithFallback("media focal points", () => ({}), async (db) => {
    const rows = await db
      .select({ url: schema.media.url, x: schema.media.focalX, y: schema.media.focalY })
      .from(schema.media)
      .where(sql`${schema.media.focalX} <> 50 or ${schema.media.focalY} <> 50`);
    return Object.fromEntries(rows.map((r) => [r.url, { x: r.x, y: r.y }]));
  });
}

/** Copy of `value` where every image (an object with a `src`) carries its focal point. */
function withFocals<T>(value: T, focals: FocalMap): T {
  if (!Object.keys(focals).length) return value;
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, child] of Object.entries(v)) out[k] = walk(child);
      const src = (v as { src?: unknown }).src;
      if (typeof src === "string" && focals[src]) out.focal = focals[src];
      return out;
    }
    return v;
  };
  return walk(value) as T;
}

/* ------------------------------------------------------------------
   Sections
   ------------------------------------------------------------------ */

async function readSection<K extends SectionKey>(key: K): Promise<SectionData[K]> {
  "use cache";
  cacheTag(TAGS.section(key), TAGS.media);
  const focals = await mediaFocals();
  // Live preview: an admin in Draft Mode sees their unsaved values. Draft
  // Mode re-runs this function per request without caching the result.
  if ((await draftMode()).isEnabled) {
    const draft = await readPreviewDraft(`section:${key}`);
    if (draft) return withFocals(parseSection(key, draft), focals);
  }
  const section = await readWithFallback(
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
  return withFocals(section, focals);
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
  cacheTag(TAGS.sectors, TAGS.media);
  const focals = await mediaFocals();
  return withFocals(await readSectors(), focals);
}

function readSectors(): Promise<Sector[]> {
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
  cacheTag(TAGS.leaders, TAGS.media);
  const focals = await mediaFocals();
  return withFocals(await readLeaders(), focals);
}

function readLeaders(): Promise<Leader[]> {
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
  cacheTag(TAGS.heroSlides, TAGS.media);
  const focals = await mediaFocals();
  if ((await draftMode()).isEnabled) {
    const draft = heroSlidesSchema.safeParse(await readPreviewDraft("hero_slides:all"));
    if (draft.success) return withFocals(draft.data.filter((s) => s.visible).map(({ src, alt, width, height }) => ({ src, alt, width, height })), focals);
  }
  return withFocals(await readHeroSlides(), focals);
}

function readHeroSlides(): Promise<ImageAsset[]> {
  return readWithFallback("hero slides", () => defaultHeroSlides, async (db) => {
    const rows = (await db.select().from(schema.heroSlides).orderBy(asc(schema.heroSlides.sortOrder))).filter((r) => r.visible);
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
  cacheTag(TAGS.gallery, TAGS.media);
  const focals = await mediaFocals();
  return withFocals(await readGallery(), focals);
}

function readGallery(): Promise<GalleryItem[]> {
  return readWithFallback("gallery", defaultGalleryItems, async (db) => {
    const rows = await db.select().from(schema.galleryPhotos).orderBy(asc(schema.galleryPhotos.sortOrder));
    if (!rows.length && !(await isSeeded())) return defaultGalleryItems();
    return rows.map((r) => ({ image: toImage(r), sectorSlug: r.sectorSlug, showOnHome: r.showOnHome }));
  });
}
