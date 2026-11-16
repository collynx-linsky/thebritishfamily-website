/**
 * Helpers shared by the admin editors (client) and their actions (server).
 *
 * Field names use dotted paths that mirror the content shape, for example
 * `hero.eyebrow` or `facts.2.label`. The server turns the submitted fields
 * back into an object with `formToObject`, validates it with the section's
 * Zod schema, and reports problems by the same dotted path, so each error
 * lands next to the field it belongs to.
 */
import type { z } from "zod";

/** Marks a list field, so an emptied list arrives as [] instead of missing. */
export const LIST_MARKER = "__list";

export type FormObject = { [key: string]: FormValue };
export type FormValue = string | FormObject | FormValue[];

/** Turn dotted-path form fields into a nested object (numeric parts become arrays). */
export function formToObject(formData: FormData): FormObject {
  const root: FormObject = {};
  for (const [name, raw] of formData.entries()) {
    if (typeof raw !== "string" || name.startsWith("$")) continue;
    const parts = name.split(".");
    const isMarker = parts.at(-1) === LIST_MARKER;
    if (isMarker) parts.pop();
    let node: FormObject | FormValue[] = root;
    parts.forEach((part, i) => {
      const last = i === parts.length - 1;
      const nextIsIndex = !last && /^\d+$/.test(parts[i + 1]);
      const key: string | number = Array.isArray(node) ? Number(part) : part;
      const container = node as Record<string | number, FormValue>;
      if (last) {
        if (isMarker) container[key] ??= [];
        else container[key] = raw;
        return;
      }
      container[key] ??= nextIsIndex ? [] : {};
      node = container[key] as FormObject | FormValue[];
    });
  }
  return compact(root) as FormObject;
}

/** Remove holes left in arrays (indexes are contiguous in practice). */
function compact(value: FormValue): FormValue {
  if (Array.isArray(value)) return value.filter((v) => v !== undefined).map(compact);
  if (typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, compact(v)]));
  return value;
}

/**
 * Lay submitted fields over the current stored value: objects merge key by
 * key (so fields the form doesn't show, like an image's file address, are
 * kept), while lists and text replace the stored value entirely.
 */
export function overlay<T>(current: T, submitted: unknown): T {
  if (submitted === undefined) return current;
  if (Array.isArray(submitted) || typeof submitted !== "object" || submitted === null) return submitted as T;
  if (typeof current !== "object" || current === null || Array.isArray(current)) return submitted as T;
  const out: Record<string, unknown> = { ...(current as Record<string, unknown>) };
  for (const [k, v] of Object.entries(submitted)) out[k] = overlay(out[k], v);
  return out as T;
}

export type FieldErrors = Record<string, string>;

/** Zod issues keyed by dotted field path (first message per field). */
export function fieldErrors(issues: z.core.$ZodIssue[], prefix = ""): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const path = [prefix, ...issue.path.map(String)].filter(Boolean).join(".");
    out[path] ??= issue.message;
  }
  return out;
}

/**
 * The maximum length a schema allows at a dotted path, for character
 * counters. Index parts (`facts.2.label`) step into list items.
 */
export function maxLengthAt(schema: z.ZodType, path: string): number | undefined {
  let node: unknown = schema;
  for (const part of path.split(".")) {
    node = unwrap(node);
    const def = (node as { def?: { type?: string; items?: unknown[] } }).def;
    if (def?.type === "object") node = (node as { shape: Record<string, unknown> }).shape[part];
    else if (def?.type === "array") node = (node as { element: unknown }).element;
    else if (def?.type === "tuple") node = def.items?.[Number(part)];
    else return undefined;
    if (!node) return undefined;
  }
  const max = (unwrap(node) as { maxLength?: number | null }).maxLength;
  return typeof max === "number" ? max : undefined;
}

function unwrap(node: unknown): unknown {
  let n = node as { def?: { type?: string }; unwrap?: () => unknown };
  while (n?.def && (n.def.type === "optional" || n.def.type === "nullable") && n.unwrap) n = n.unwrap() as typeof n;
  return n;
}

/** What every editor action returns. */
export type EditorResult =
  | { status: "saved"; message: string }
  | { status: "unchanged"; message: string }
  | { status: "error"; message: string; fields?: FieldErrors };
