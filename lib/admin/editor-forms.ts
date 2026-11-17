/**
 * Which stored entities each editor covers. Shared by the content actions
 * and the preview-end endpoint. Arguments from the browser are checked here.
 */
import { UnknownItemError, type EntityRef } from "./content-store";

export const FORMS = {
  home: () => [{ type: "section", id: "home" }],
  slideshow: () => [{ type: "hero_slides", id: "all" }],
  about: () => [{ type: "section", id: "about" }],
  contact: () => [{ type: "section", id: "company" }],
  pages: () => [{ type: "section", id: "pages" }],
  sector: (slug: string) => [{ type: "sector", id: slug }],
  leader: (slug: string) => [{ type: "leader", id: slug }],
} satisfies Record<string, (slug: string) => EntityRef[]>;

export type EditorKey = keyof typeof FORMS;

export function refsFor(form: string, slug: string): EntityRef[] {
  if (!Object.hasOwn(FORMS, form)) throw new UnknownItemError();
  if ((form === "sector" || form === "leader") && !/^[a-z0-9-]{1,80}$/.test(slug)) throw new UnknownItemError();
  return FORMS[form as EditorKey](slug) as EntityRef[];
}
