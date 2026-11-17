"use client";

import { useEffect, useRef, useState } from "react";

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

const cut = (text: string, limit: number) => (text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text);

/**
 * How a page will look as a Google result and as a shared link, updating
 * as the editor types in the title and description fields (by name).
 */
export function SearchPreview({
  titleField,
  descriptionField,
  path,
  siteHost,
  titleSuffix = "",
  image,
}: {
  titleField: string;
  descriptionField: string;
  path: string;
  siteHost: string;
  /** Added after the title on the website, e.g. " | The British Family Limited" */
  titleSuffix?: string;
  image?: { src: string };
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState({ title: "", description: "" });

  useEffect(() => {
    const form = anchor.current?.closest("form");
    if (!form) return;
    const read = () => {
      const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "";
      setValues({ title: get(titleField), description: get(descriptionField) });
    };
    read();
    form.addEventListener("input", read);
    return () => form.removeEventListener("input", read);
  }, [titleField, descriptionField]);

  const fullTitle = values.title + titleSuffix;
  const url = `${siteHost}${path === "/" ? "" : path}`;
  const guide = (n: number, limit: number) =>
    n > limit ? `${n} characters: Google will cut it after about ${limit}.` : `${n} characters: fits (Google shows about ${limit}).`;

  return (
    <div ref={anchor} className="flex flex-col gap-4 rounded-lg bg-paper p-4">
      <p className="text-xs font-bold tracking-[0.12em] text-muted uppercase">How it will look</p>

      <figure className="rounded-lg bg-white p-4 shadow-card">
        <figcaption className="sr-only">As a Google search result</figcaption>
        <p className="truncate text-xs text-ink">{url}</p>
        <p className="mt-1 text-lg leading-snug [overflow-wrap:anywhere] text-[#1a0dab]">{cut(fullTitle, TITLE_LIMIT) || "Page title"}</p>
        <p className="mt-1 text-sm leading-snug [overflow-wrap:anywhere] text-[#4d5156]">{cut(values.description, DESCRIPTION_LIMIT) || "Page description"}</p>
      </figure>

      <figure className="overflow-hidden rounded-lg border border-line bg-white sm:flex">
        <figcaption className="sr-only">As a link shared on WhatsApp or social media</figcaption>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- small preview of the page's own image
          <img src={image.src} alt="" className="aspect-[1.91/1] w-full object-cover sm:w-44 sm:shrink-0" />
        ) : null}
        <div className="min-w-0 p-3">
          <p className="text-xs text-muted uppercase">{siteHost.replace(/^https?:\/\//, "")}</p>
          <p className="mt-0.5 line-clamp-2 font-semibold [overflow-wrap:anywhere] text-ink">{values.title || "Page title"}</p>
          <p className="mt-0.5 line-clamp-2 text-sm [overflow-wrap:anywhere] text-muted">{values.description || "Page description"}</p>
        </div>
      </figure>

      <ul className="text-xs text-muted">
        <li className={fullTitle.length > TITLE_LIMIT ? "font-semibold text-amber-ink" : ""}>Title (with the company name): {guide(fullTitle.length, TITLE_LIMIT)}</li>
        <li className={values.description.length > DESCRIPTION_LIMIT ? "font-semibold text-amber-ink" : ""}>Description: {guide(values.description.length, DESCRIPTION_LIMIT)}</li>
      </ul>
    </div>
  );
}
