"use server";

/**
 * Save, undo and restore actions for the content editors.
 *
 * Every action checks the session first, validates the submitted fields
 * with the same Zod schema the public site parses with, saves through the
 * content store (which snapshots the previous version for undo), expires
 * the public pages' cache tags with updateTag so the change is live
 * immediately, and refreshes the editor so it shows what is now stored.
 */
import { refresh, updateTag } from "next/cache";
import type { z } from "zod";
import { requireAdmin, UnauthorizedError } from "@/lib/auth/dal";
import type { AdminSession } from "@/lib/auth/session";
import { recordActivity } from "@/lib/admin/activity";
import {
  defaultsFor,
  readEntity,
  saveEntities,
  tagsFor,
  undoLastSave,
  UnknownItemError,
  type EntityRef,
} from "@/lib/admin/content-store";
import { fieldErrors, formToObject, overlay, type EditorResult, type FieldErrors, type FormObject } from "@/lib/admin/form-data";
import {
  heroSlidesSchema,
  leaderSchema,
  sectionSchemas,
  sectorSchema,
  type ImageRef,
} from "@/lib/content/sections";
import type { SectionKey } from "@/lib/db/schema";

/* ------------------------------------------------------------------
   Which entities each editor covers
   ------------------------------------------------------------------ */

const FORMS = {
  home: () => [{ type: "section", id: "home" }, { type: "hero_slides", id: "all" }],
  about: () => [{ type: "section", id: "about" }],
  contact: () => [{ type: "section", id: "company" }],
  pages: () => [{ type: "section", id: "pages" }],
  sector: (slug: string) => [{ type: "sector", id: slug }],
  leader: (slug: string) => [{ type: "leader", id: slug }],
} satisfies Record<string, (slug: string) => EntityRef[]>;

export type EditorKey = keyof typeof FORMS;

function refsFor(form: string, slug: string): EntityRef[] {
  // Actions can be called with any arguments, so check them
  if (!Object.hasOwn(FORMS, form)) throw new UnknownItemError();
  if ((form === "sector" || form === "leader") && !/^[a-z0-9-]{1,80}$/.test(slug)) throw new UnknownItemError();
  return FORMS[form as EditorKey](slug) as EntityRef[];
}

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

/** Who is acting, and on which editor, for history and the activity log */
type Actor = { session: AdminSession; form: EditorKey; slug?: string };

/** "the Home page", "Construction", … and the admin page it lives on */
async function describe(form: EditorKey, slug = ""): Promise<{ label: string; href: string }> {
  switch (form) {
    case "home":
      return { label: "the Home page", href: "/admin/home" };
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

async function saveAll(changes: { ref: EntityRef; value: unknown }[], actor: Actor): Promise<EditorResult> {
  const { label, href } = await describe(actor.form, actor.slug);
  const summary = `Saved ${label}`;
  const changed = await saveEntities(changes, { userId: actor.session.userId, summary });
  if (!changed.length) return { status: "unchanged", message: "Nothing to save: you haven't changed anything." };
  publish(changed);
  await recordActivity({ userId: actor.session.userId, action: "content.save", summary, href });
  return { status: "saved", message: "Saved. The website now shows your changes." };
}

/** Validate and save one content section from the submitted fields. */
async function sectionChange(key: SectionKey, raw: FormObject, adjust?: (candidate: Record<string, unknown>) => void) {
  const ref = { type: "section", id: key } as const;
  const candidate = overlay(await readEntity(ref), raw) as Record<string, unknown>;
  adjust?.(candidate);
  return { ref, value: validate(sectionSchemas[key], candidate) as unknown };
}

/* ------------------------------------------------------------------
   Save actions (one per editor)
   ------------------------------------------------------------------ */

export async function saveHome(formData: FormData): Promise<EditorResult> {
  return run(async (session) => {
    const { slides: rawSlides, ...raw } = formToObject(formData);
    const errors: FieldErrors = {};

    let home: { ref: EntityRef; value: unknown } | undefined;
    try {
      home = await sectionChange("home", raw, (c) => {
        // "No icon" arrives as an empty choice
        for (const fact of (c.facts as Record<string, unknown>[] | undefined) ?? []) if (fact.icon === "") delete fact.icon;
      });
    } catch (e) {
      if (!(e instanceof InvalidInput)) throw e;
      Object.assign(errors, e.fields);
    }

    // Slides can be reordered, removed and re-described here; each must be
    // one of the photos already in the slideshow (new photos come with uploads)
    const slidesRef = { type: "hero_slides", id: "all" } as const;
    const current = await readEntity(slidesRef);
    const unused = [...current];
    const slides: ImageRef[] = [];
    (Array.isArray(rawSlides) ? rawSlides : []).forEach((item, i) => {
      const s = item as { src?: string; alt?: string };
      const at = unused.findIndex((c) => c.src === s.src);
      if (at === -1) {
        errors[`slides.${i}.alt`] = "This photo is no longer in the slideshow. Reload the page.";
        return;
      }
      slides.push({ ...unused[at], alt: s.alt ?? "" });
      unused.splice(at, 1);
    });
    const slideCheck = heroSlidesSchema.safeParse(slides);
    if (!slideCheck.success) Object.assign(errors, fieldErrors(slideCheck.error.issues, "slides"));

    if (Object.keys(errors).length || !home || !slideCheck.success) throw new InvalidInput(errors);
    return saveAll([home, { ref: slidesRef, value: slideCheck.data }], { session, form: "home" });
  });
}

export async function saveAbout(formData: FormData): Promise<EditorResult> {
  return run(async (session) => saveAll([await sectionChange("about", formToObject(formData))], { session, form: "about" }));
}

export async function saveContact(formData: FormData): Promise<EditorResult> {
  return run(async (session) =>
    saveAll(
      [
        await sectionChange("company", formToObject(formData), (c) => {
          if (typeof c.established === "string") c.established = c.established.trim() === "" ? Number.NaN : Number(c.established);
        }),
      ],
      { session, form: "contact" },
    ),
  );
}

export async function savePages(formData: FormData): Promise<EditorResult> {
  return run(async (session) => saveAll([await sectionChange("pages", formToObject(formData))], { session, form: "pages" }));
}

export async function saveSector(slug: string, formData: FormData): Promise<EditorResult> {
  return run(async (session) => {
    const [ref] = refsFor("sector", slug);
    const value = validate(sectorSchema, overlay(await readEntity(ref), formToObject(formData)));
    return saveAll([{ ref, value }], { session, form: "sector", slug });
  });
}

export async function saveLeader(slug: string, formData: FormData): Promise<EditorResult> {
  return run(async (session) => {
    const [ref] = refsFor("leader", slug);
    const value = validate(leaderSchema, overlay(await readEntity(ref), formToObject(formData)));
    return saveAll([{ ref, value }], { session, form: "leader", slug });
  });
}

/* ------------------------------------------------------------------
   Undo and restore (shared by every editor)
   ------------------------------------------------------------------ */

export async function undoLastChange(form: EditorKey, slug = ""): Promise<EditorResult> {
  return run(async (session) => {
    const restored = await undoLastSave(refsFor(form, slug));
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
    const { label, href } = await describe(form, slug);
    const summary = `Restored the original ${label.replace(/^the /, "")}`;
    const changed = await saveEntities(
      refs.map((ref) => ({ ref, value: defaultsFor(ref) })),
      { userId: session.userId, summary },
    );
    if (!changed.length) return { status: "unchanged", message: "This is already the original content." };
    publish(changed);
    await recordActivity({ userId: session.userId, action: "content.restore", summary, href });
    return { status: "saved", message: "The original content is back. Use “Undo last change” to return to your version." };
  });
}
