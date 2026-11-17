"use server";

/**
 * Save, preview, undo, restore and version actions for the content editors,
 * and the slideshow list actions.
 *
 * Every action checks the session first. Each editor has one "builder" that
 * turns submitted fields into validated new values; Save stores them (with
 * a snapshot of the previous version for undo and history), expires the
 * public pages' cache tags with updateTag so the change is live
 * immediately, and refreshes the editor. Live preview runs the same builder
 * but only writes a preview draft, which the public pages show to an admin
 * in Draft Mode and to nobody else.
 */
import { refresh, updateTag } from "next/cache";
import { draftMode } from "next/headers";
import type { z } from "zod";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/dal";
import type { AdminSession } from "@/lib/auth/session";
import { recordActivity } from "@/lib/admin/activity";
import {
  clearPreviewDrafts,
  clearStalePreviewDrafts,
  defaultsFor,
  readEntity,
  saveEntities,
  tagsFor,
  undoLastSave,
  UnknownItemError,
  versionSnapshots,
  writePreviewDrafts,
  type EntityRef,
} from "@/lib/admin/content-store";
import { fieldErrors, formToObject, overlay, type EditorResult, type FieldErrors, type FormObject } from "@/lib/admin/form-data";
import { heroSlidesSchema, leaderSchema, sectionSchemas, sectorSchema, type SlideItem } from "@/lib/content/sections";
import type { SectionKey } from "@/lib/db/schema";
import { refsFor, type EditorKey } from "@/lib/admin/editor-forms";

/* ------------------------------------------------------------------
   Which entities each editor covers: see lib/admin/editor-forms.ts
   ------------------------------------------------------------------ */

export type { EditorKey } from "@/lib/admin/editor-forms";

/* ------------------------------------------------------------------
   Shared plumbing
   ------------------------------------------------------------------ */

class InvalidInput extends Error {
  constructor(public fields: FieldErrors) {
    super("invalid");
  }
}

async function run(task: (session: AdminSession) => Promise<EditorResult>): Promise<EditorResult> {
  try {
    const session = await requireAdmin();
    return await task(session);
  } catch (error) {
    if (error instanceof InvalidInput) {
      const n = Object.keys(error.fields).length;
      return { status: "error", message: `Please fix the ${n === 1 ? "field" : `${n} fields`} marked below.`, fields: error.fields };
    }
    if (error instanceof UnauthorizedError || error instanceof UnknownItemError) return { status: "error", message: error.message };
    console.error("[admin] content action failed", error);
    return { status: "error", message: "Something went wrong and nothing was saved. Please try again." };
  }
}

/** Make the changes visible on the public site and in the editor. */
function publish(changed: EntityRef[]) {
  for (const tag of new Set(changed.flatMap(tagsFor))) updateTag(tag);
  refresh();
}

function validate<S extends z.ZodType>(schema: S, value: unknown, prefix = ""): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw new InvalidInput(fieldErrors(result.error.issues, prefix));
  return result.data;
}

/** "the Home page", "Construction", … and the admin page it lives on */
async function describe(form: EditorKey, slug = ""): Promise<{ label: string; href: string }> {
  switch (form) {
    case "home":
      return { label: "the Home page", href: "/admin/home" };
    case "slideshow":
      return { label: "the home slideshow", href: "/admin/home/slideshow" };
    case "about":
      return { label: "the About page", href: "/admin/about" };
    case "contact":
      return { label: "the contact details", href: "/admin/contact" };
    case "pages":
      return { label: "the page text and SEO", href: "/admin/pages" };
    case "sector":
      return { label: (await readEntity({ type: "sector", id: slug })).name, href: `/admin/sectors/${slug}` };
    case "leader":
      return { label: (await readEntity({ type: "leader", id: slug })).name, href: `/admin/leadership/${slug}` };
  }
}

type Change = { ref: EntityRef; value: unknown };

/** Store changes (snapshotting the previous version), publish them and log them. */
async function commit(changes: Change[], session: AdminSession, form: EditorKey, slug: string, summary: string, action: "content.save" | "content.restore" = "content.save") {
  const { href } = await describe(form, slug);
  const changed = await saveEntities(changes, { userId: session.userId, summary });
  await clearPreviewDrafts(changes.map((c) => c.ref));
  if (!changed.length) return changed;
  publish(changed);
  await recordActivity({ userId: session.userId, action, summary, href });
  return changed;
}

async function saveAll(changes: Change[], session: AdminSession, form: EditorKey, slug = ""): Promise<EditorResult> {
  const { label } = await describe(form, slug);
  const changed = await commit(changes, session, form, slug, `Saved ${label}`);
  if (!changed.length) return { status: "unchanged", message: "Nothing to save: you haven't changed anything." };
  return { status: "saved", message: "Saved. The website now shows your changes." };
}

/** Validate one content section from the submitted fields. */
async function sectionChange(key: SectionKey, raw: FormObject, adjust?: (candidate: Record<string, unknown>) => void): Promise<Change> {
  const ref = { type: "section", id: key } as const;
  const candidate = overlay(await readEntity(ref), raw) as Record<string, unknown>;
  adjust?.(candidate);
  return { ref, value: validate(sectionSchemas[key], candidate) as unknown };
}

/* ------------------------------------------------------------------
   Builders: submitted fields -> validated changes (shared by Save and preview)
   ------------------------------------------------------------------ */

const BUILDERS: Partial<Record<EditorKey, (fields: FormObject, slug: string) => Promise<Change[]>>> = {
  home: async (fields) => [
    await sectionChange("home", fields, (c) => {
      // "No icon" arrives as an empty choice
      for (const fact of (c.facts as Record<string, unknown>[] | undefined) ?? []) if (fact.icon === "") delete fact.icon;
    }),
  ],
  about: async (fields) => [await sectionChange("about", fields)],
  contact: async (fields) => [
    await sectionChange("company", fields, (c) => {
      if (typeof c.established === "string") c.established = c.established.trim() === "" ? Number.NaN : Number(c.established);
    }),
  ],
  pages: async (fields) => [await sectionChange("pages", fields)],
  sector: async (fields, slug) => {
    const [ref] = refsFor("sector", slug);
    return [{ ref, value: validate(sectorSchema, overlay(await readEntity(ref), fields)) }];
  },
  leader: async (fields, slug) => {
    const [ref] = refsFor("leader", slug);
    return [{ ref, value: validate(leaderSchema, overlay(await readEntity(ref), fields)) }];
  },
};

function builderFor(form: string): (fields: FormObject, slug: string) => Promise<Change[]> {
  const builder = Object.hasOwn(BUILDERS, form) ? BUILDERS[form as EditorKey] : undefined;
  if (!builder) throw new UnknownItemError();
  return builder;
}

/* ------------------------------------------------------------------
   Save (one action per editor, so each form can bind its own)
   ------------------------------------------------------------------ */

const saveWith = (form: EditorKey, formData: FormData, slug = "") =>
  run(async (session) => saveAll(await builderFor(form)(formToObject(formData), slug), session, form, slug));

export async function saveHome(formData: FormData): Promise<EditorResult> {
  return saveWith("home", formData);
}
export async function saveAbout(formData: FormData): Promise<EditorResult> {
  return saveWith("about", formData);
}
export async function saveContact(formData: FormData): Promise<EditorResult> {
  return saveWith("contact", formData);
}
export async function savePages(formData: FormData): Promise<EditorResult> {
  return saveWith("pages", formData);
}
export async function saveSector(slug: string, formData: FormData): Promise<EditorResult> {
  return saveWith("sector", formData, slug);
}
export async function saveLeader(slug: string, formData: FormData): Promise<EditorResult> {
  return saveWith("leader", formData, slug);
}

/* ------------------------------------------------------------------
   Live preview
   ------------------------------------------------------------------ */

export type PreviewResult = { ok: true } | { ok: false; reason: "invalid" | "error"; message: string };

/** Turn on Draft Mode for this admin's browser so the preview frame shows drafts. */
export async function startPreview(): Promise<PreviewResult> {
  try {
    await requireAdmin();
    (await draftMode()).enable();
    await clearStalePreviewDrafts();
    return { ok: true };
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, reason: "error", message: error.message };
    console.error("[admin] could not start preview", error);
    return { ok: false, reason: "error", message: "The preview could not start." };
  }
}

/** Store the editor's unsaved values as a preview draft (nothing is published). */
export async function updatePreview(form: EditorKey, slug: string, formData: FormData): Promise<PreviewResult> {
  try {
    await requireAdmin();
    refsFor(form, slug);
    // Re-assert Draft Mode on every update (cheap, and robust to a reload in between)
    (await draftMode()).enable();
    const changes = await builderFor(form)(formToObject(formData), slug);
    await writePreviewDrafts(changes);
    return { ok: true };
  } catch (error) {
    if (error instanceof InvalidInput) return { ok: false, reason: "invalid", message: "The preview is paused until the highlighted fields are fixed." };
    if (error instanceof UnauthorizedError || error instanceof UnknownItemError) return { ok: false, reason: "error", message: error.message };
    console.error("[admin] preview update failed", error);
    return { ok: false, reason: "error", message: "The preview could not be updated." };
  }
}

/* ------------------------------------------------------------------
   Undo, restore original, restore an earlier version (every editor)
   ------------------------------------------------------------------ */

export async function undoLastChange(form: EditorKey, slug = ""): Promise<EditorResult> {
  return run(async (session) => {
    const refs = refsFor(form, slug);
    const restored = await undoLastSave(refs);
    await clearPreviewDrafts(refs);
    if (!restored.length) return { status: "unchanged", message: "There is no earlier saved version to go back to." };
    publish(restored);
    const { label, href } = await describe(form, slug);
    await recordActivity({ userId: session.userId, action: "content.undo", summary: `Undid the last change to ${label}`, href });
    return { status: "saved", message: "Your last saved change was undone. The website shows the previous version again." };
  });
}

export async function restoreOriginal(form: EditorKey, slug = ""): Promise<EditorResult> {
  return run(async (session) => {
    const refs = refsFor(form, slug);
    const { label } = await describe(form, slug);
    const changed = await commit(
      refs.map((ref) => ({ ref, value: defaultsFor(ref) })),
      session,
      form,
      slug,
      `Restored the original ${label.replace(/^the /, "")}`,
      "content.restore",
    );
    if (!changed.length) return { status: "unchanged", message: "This is already the original content." };
    return { status: "saved", message: "The original content is back. Use “Undo last change” to return to your version." };
  });
}

export async function restoreVersion(form: EditorKey, slug: string, historyId: number): Promise<EditorResult> {
  return run(async (session) => {
    const refs = refsFor(form, slug);
    if (!Number.isInteger(historyId) || historyId <= 0) throw new UnknownItemError();
    const snapshots = await versionSnapshots(refs, historyId);
    if (!snapshots.length) throw new UnknownItemError();
    const { label } = await describe(form, slug);
    const changed = await commit(snapshots, session, form, slug, `Restored an earlier version of ${label.replace(/^the /, "")}`, "content.restore");
    if (!changed.length) return { status: "unchanged", message: "That version is the same as the current one." };
    return { status: "saved", message: "That earlier version is back on the website. Use “Undo last change” to return." };
  });
}

/* ------------------------------------------------------------------
   Slideshow list
   ------------------------------------------------------------------ */

const SLIDES: EntityRef = { type: "hero_slides", id: "all" };

async function changeSlides(session: AdminSession, summary: string, edit: (slides: SlideItem[]) => SlideItem[]): Promise<EditorResult> {
  const current = (await readEntity(SLIDES)) as SlideItem[];
  const next = edit(current.map((s) => ({ ...s })));
  const value = validate(heroSlidesSchema, next);
  const changed = await commit([{ ref: SLIDES, value }], session, "slideshow", "", summary);
  if (!changed.length) return { status: "unchanged", message: "Nothing changed." };
  return { status: "saved", message: "Saved. The website now shows the slideshow as listed." };
}

const findSlide = (slides: SlideItem[], id: number) => {
  const index = slides.findIndex((s) => s.id === id);
  if (index === -1) throw new UnknownItemError();
  return index;
};

export async function setSlideVisible(id: number, visible: boolean): Promise<EditorResult> {
  return run((session) =>
    changeSlides(session, `${visible ? "Showed" : "Hid"} a slideshow photo`, (slides) => {
      slides[findSlide(slides, id)].visible = visible;
      return slides;
    }),
  );
}

export async function describeSlide(id: number, alt: string): Promise<EditorResult> {
  return run((session) =>
    changeSlides(session, "Changed a slideshow photo description", (slides) => {
      slides[findSlide(slides, id)].alt = typeof alt === "string" ? alt : "";
      return slides;
    }),
  );
}

export async function reorderSlides(ids: number[]): Promise<EditorResult> {
  return run((session) =>
    changeSlides(session, "Reordered the slideshow", (slides) => {
      if (!Array.isArray(ids) || ids.length !== slides.length || new Set(ids).size !== ids.length) throw new UnknownItemError();
      return ids.map((id) => slides[findSlide(slides, id)]);
    }),
  );
}

export async function deleteSlide(id: number): Promise<EditorResult> {
  return run((session) =>
    changeSlides(session, "Removed a slideshow photo", (slides) => {
      slides.splice(findSlide(slides, id), 1);
      return slides;
    }),
  );
}
