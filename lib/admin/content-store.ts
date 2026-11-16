/**
 * Read, write, snapshot and undo admin-editable content.
 *
 * Everything the editors change is an "entity": a content section, one
 * sector, one leader, or the hero slideshow as a whole list. Each save runs
 * in one transaction that first copies the current version of every changed
 * entity into `content_history`, then writes the new one. Postgres `now()`
 * is fixed for the whole transaction, so every snapshot of one save shares
 * one `saved_at`: "Undo last change" restores exactly that group.
 */
import "server-only";
import { createHash } from "node:crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { requireDb, schema } from "../db";
import type { Database } from "../db/client";
import type { HistoryEntity, SectionKey } from "../db/schema";
import { TAGS } from "../content/site-content";
import {
  heroSlidesSchema,
  leaderSchema,
  parseSection,
  sectionDefaults,
  sectorSchema,
  type ImageRef,
  type LeaderItem,
  type SectionData,
  type SectorItem,
} from "../content/sections";
import { heroSlides as defaultHeroSlides } from "../media";
import { leaders as defaultLeaders, sectors as defaultSectors } from "../site";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type EntityRef =
  | { type: "section"; id: SectionKey }
  | { type: "sector"; id: string }
  | { type: "leader"; id: string }
  | { type: "hero_slides"; id: "all" };

export type EntityValue<R extends EntityRef> = R extends { type: "section"; id: infer K extends SectionKey }
  ? SectionData[K]
  : R extends { type: "sector" }
    ? SectorItem
    : R extends { type: "leader" }
      ? LeaderItem
      : ImageRef[];

/** How many previous versions to keep per entity */
const HISTORY_DEPTH = 20;

const image = (r: { imageUrl: string | null; imageAlt: string | null; imageWidth: number | null; imageHeight: number | null }): ImageRef | null =>
  r.imageUrl && r.imageAlt && r.imageWidth && r.imageHeight
    ? { src: r.imageUrl, alt: r.imageAlt, width: r.imageWidth, height: r.imageHeight }
    : null;

const imageColumns = (img: ImageRef | null) => ({
  imageUrl: img?.src ?? null,
  imageAlt: img?.alt ?? null,
  imageWidth: img?.width ?? null,
  imageHeight: img?.height ?? null,
});

/* ------------------------------------------------------------------
   Per-entity read / write / defaults / cache tags
   ------------------------------------------------------------------ */

export class UnknownItemError extends Error {
  constructor() {
    super("That item no longer exists. Reload the page.");
  }
}

async function read(tx: Tx, ref: EntityRef): Promise<unknown> {
  switch (ref.type) {
    case "section": {
      const [row] = await tx
        .select({ data: schema.contentSections.data })
        .from(schema.contentSections)
        .where(eq(schema.contentSections.key, ref.id));
      return parseSection(ref.id, row?.data);
    }
    case "sector": {
      const [r] = await tx.select().from(schema.sectors).where(eq(schema.sectors.slug, ref.id));
      if (!r) throw new UnknownItemError();
      const value: SectorItem = {
        name: r.name,
        shortName: r.shortName,
        icon: r.icon as SectorItem["icon"],
        summary: r.summary,
        headline: r.headline,
        overview: r.overview,
        focus: r.focus,
        image: image(r),
      };
      return value;
    }
    case "leader": {
      const [r] = await tx.select().from(schema.leaders).where(eq(schema.leaders.slug, ref.id));
      if (!r) throw new UnknownItemError();
      const value: LeaderItem = {
        name: r.name,
        role: r.role,
        summary: r.summary,
        bio: r.bio,
        email: r.email,
        photo: { src: r.imageUrl, alt: r.imageAlt, width: r.imageWidth, height: r.imageHeight },
      };
      return value;
    }
    case "hero_slides": {
      const rows = await tx.select().from(schema.heroSlides).orderBy(asc(schema.heroSlides.sortOrder), asc(schema.heroSlides.id));
      return rows.length ? rows.map((r) => ({ src: r.imageUrl, alt: r.imageAlt, width: r.imageWidth, height: r.imageHeight })) : defaultsFor(ref);
    }
  }
}

async function write(tx: Tx, ref: EntityRef, value: unknown): Promise<void> {
  const now = new Date();
  switch (ref.type) {
    case "section": {
      const data = value as Record<string, unknown>;
      await tx
        .insert(schema.contentSections)
        .values({ key: ref.id, data })
        .onConflictDoUpdate({ target: schema.contentSections.key, set: { data, updatedAt: now } });
      return;
    }
    case "sector": {
      const v = sectorSchema.parse(value);
      const { image: img, ...fields } = v;
      await tx.update(schema.sectors).set({ ...fields, ...imageColumns(img), updatedAt: now }).where(eq(schema.sectors.slug, ref.id));
      return;
    }
    case "leader": {
      const v = leaderSchema.parse(value);
      const { photo, ...fields } = v;
      await tx
        .update(schema.leaders)
        .set({ ...fields, imageUrl: photo.src, imageAlt: photo.alt, imageWidth: photo.width, imageHeight: photo.height, updatedAt: now })
        .where(eq(schema.leaders.slug, ref.id));
      return;
    }
    case "hero_slides": {
      const slides = heroSlidesSchema.parse(value);
      await tx.delete(schema.heroSlides);
      await tx.insert(schema.heroSlides).values(
        slides.map((s, i) => ({ sortOrder: i, imageUrl: s.src, imageAlt: s.alt, imageWidth: s.width, imageHeight: s.height })),
      );
      return;
    }
  }
}

/** The original (built-in) version of an entity, for "Restore original". */
export function defaultsFor(ref: EntityRef): unknown {
  switch (ref.type) {
    case "section":
      return sectionDefaults[ref.id];
    case "sector": {
      const s = defaultSectors.find((x) => x.slug === ref.id);
      if (!s) throw new UnknownItemError();
      const value: SectorItem = {
        name: s.name,
        shortName: s.shortName,
        icon: s.icon as SectorItem["icon"],
        summary: s.summary,
        headline: s.headline,
        overview: [...s.overview],
        focus: [...s.focus],
        image: null,
      };
      return value;
    }
    case "leader": {
      const l = defaultLeaders.find((x) => x.slug === ref.id);
      if (!l) throw new UnknownItemError();
      const value: LeaderItem = {
        name: l.name,
        role: l.role,
        summary: l.summary,
        bio: l.bio,
        email: l.email,
        photo: { src: l.photo.src, alt: l.photo.alt, width: l.photo.width, height: l.photo.height },
      };
      return value;
    }
    case "hero_slides":
      return defaultHeroSlides.map((s) => ({ src: s.src, alt: s.alt, width: s.width, height: s.height }));
  }
}

/** Public-site cache tags to expire when an entity changes. */
export function tagsFor(ref: EntityRef): string[] {
  switch (ref.type) {
    case "section":
      return [TAGS.section(ref.id)];
    case "sector":
      return [TAGS.sectors];
    case "leader":
      return [TAGS.leaders];
    case "hero_slides":
      return [TAGS.heroSlides];
  }
}

/** Current value of one entity (outside an editor page load). */
export function readEntity<R extends EntityRef>(ref: R): Promise<EntityValue<R>> {
  return requireDb().transaction((tx) => read(tx, ref)) as Promise<EntityValue<R>>;
}

/* ------------------------------------------------------------------
   Loading for an editor page
   ------------------------------------------------------------------ */

/** Key-order-independent JSON, for comparing versions. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]))
      : v,
  );
}

/**
 * History rows of any of these entities. Wrapped in parentheses: it is an
 * OR chain, and and() does not parenthesise its arguments, so without them
 * `a or b and newest` would match every row of `a`.
 */
const refFilter = (refs: EntityRef[]) =>
  sql`(${sql.join(
    refs.map((r) => sql`(${schema.contentHistory.entityType} = ${r.type} and ${schema.contentHistory.entityId} = ${r.id})`),
    sql` or `,
  )})`;

export type EditorState<V extends unknown[]> = {
  values: V;
  /** Changes whenever the stored content changes; the form remounts on it */
  version: string;
  canUndo: boolean;
  lastSavedAt: string | null;
  /** True when every entity matches its original (built-in) version */
  isOriginal: boolean;
};

/** Current values of the given entities, plus undo and "last saved" info. */
export async function loadEditor<const R extends EntityRef[]>(
  refs: R,
): Promise<EditorState<{ [I in keyof R]: EntityValue<R[I]> }>> {
  return requireDb().transaction(async (tx) => {
    const values = await Promise.all(refs.map((r) => read(tx, r)));
    const [info] = await tx
      .select({ count: sql<number>`count(*)::int`, last: sql<Date | null>`max(${schema.contentHistory.savedAt})` })
      .from(schema.contentHistory)
      .where(refFilter(refs));
    const serialized = values.map(stable);
    return {
      values: values as { [I in keyof R]: EntityValue<R[I]> },
      version: createHash("sha256").update(serialized.join("\n")).digest("base64url").slice(0, 16),
      canUndo: info.count > 0,
      lastSavedAt: info.last ? new Date(info.last).toISOString() : null,
      isOriginal: refs.every((r, i) => serialized[i] === stable(defaultsFor(r))),
    };
  });
}

/* ------------------------------------------------------------------
   Saving and undoing
   ------------------------------------------------------------------ */

/**
 * Save new versions in one transaction, snapshotting each changed entity
 * first. Unchanged entities are skipped. Returns the refs that changed.
 */
export async function saveEntities(changes: { ref: EntityRef; value: unknown }[]): Promise<EntityRef[]> {
  const changed: EntityRef[] = [];
  await requireDb().transaction(async (tx) => {
    for (const { ref, value } of changes) {
      const current = await read(tx, ref);
      if (stable(current) === stable(value)) continue;
      await tx.insert(schema.contentHistory).values({ entityType: ref.type, entityId: ref.id, snapshot: current });
      await write(tx, ref, value);
      changed.push(ref);
    }
    for (const ref of changed) await pruneHistory(tx, ref.type, ref.id);
  });
  return changed;
}

async function pruneHistory(tx: Tx, type: HistoryEntity, id: string) {
  const h = schema.contentHistory;
  await tx.execute(sql`
    delete from ${h}
    where ${h.entityType} = ${type} and ${h.entityId} = ${id}
      and ${h.id} not in (
        select ${h.id} from ${h}
        where ${h.entityType} = ${type} and ${h.entityId} = ${id}
        order by ${h.savedAt} desc, ${h.id} desc
        limit ${HISTORY_DEPTH}
      )`);
}

/**
 * Undo the most recent save that touched any of these entities: restore
 * every snapshot written by that save, then drop those snapshots, so the
 * next undo goes one save further back. Returns the refs restored.
 */
export async function undoLastSave(refs: EntityRef[]): Promise<EntityRef[]> {
  return requireDb().transaction(async (tx) => {
    const h = schema.contentHistory;
    // Compare timestamps inside Postgres: they have microsecond precision,
    // which a JavaScript Date would round away
    const rows = await tx
      .select({ id: h.id, entityType: h.entityType, entityId: h.entityId, snapshot: h.snapshot })
      .from(h)
      .where(and(refFilter(refs), eq(h.savedAt, sql`(select max(${h.savedAt}) from ${h} where ${refFilter(refs)})`)))
      .for("update");
    const restored: EntityRef[] = [];
    for (const row of rows) {
      const ref = refs.find((r) => r.type === row.entityType && r.id === row.entityId);
      if (!ref || row.snapshot === null) continue;
      await write(tx, ref, row.snapshot);
      restored.push(ref);
    }
    if (rows.length) await tx.delete(h).where(inArray(h.id, rows.map((r) => r.id)));
    return restored;
  });
}
