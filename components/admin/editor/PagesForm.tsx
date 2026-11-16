"use client";

import { restoreOriginal, savePages, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { PAGE_KEYS, pagesSchema, type PageKey, type PagesSection } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, ImageAltField, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(pagesSchema, path);

export const PAGE_LABELS: Record<PageKey, { label: string; path: string }> = {
  about: { label: "About", path: "/about" },
  sectors: { label: "Sectors", path: "/sectors" },
  leadership: { label: "Leadership", path: "/leadership" },
  gallery: { label: "Gallery", path: "/gallery" },
  news: { label: "News", path: "/news" },
  downloads: { label: "Downloads", path: "/downloads" },
  contact: { label: "Contact", path: "/contact" },
};

const TITLE_HINT = "The clickable headline in Google results and the browser tab. The company name is added after it automatically.";
const DESCRIPTION_HINT = "The grey text under the headline in Google results. One or two sentences.";

export function PagesForm({ values: [pages], ...state }: EditorProps<[PagesSection]>) {
  return (
    <EditorShell {...state} save={savePages} undo={() => undoLastChange("pages")} restore={() => restoreOriginal("pages")}>
      <Group title="Home page" description="How the home page appears in Google and when shared." collapsible open>
        <TextField
          name="home.title"
          label="Title in search results"
          defaultValue={pages.home.title}
          max={m("home.title")}
          rows={2}
          hint="The full title for the home page, including the company name."
        />
        <TextField name="home.description" label="Description in search results" defaultValue={pages.home.description} max={m("home.description")} rows={3} hint={DESCRIPTION_HINT} />
      </Group>

      {PAGE_KEYS.map((key) => {
        const page = pages[key];
        const { label, path } = PAGE_LABELS[key];
        return (
          <Group key={key} title={`${label} page`} description={path} collapsible>
            <h3 className="text-sm font-bold tracking-wide text-muted uppercase">Banner at the top of the page</h3>
            <TextField name={`${key}.eyebrow`} label="Small label above the heading" defaultValue={page.eyebrow} max={m(`${key}.eyebrow`)} />
            <TextField name={`${key}.heading`} label="Heading" defaultValue={page.heading} max={m(`${key}.heading`)} rows={2} />
            <TextField name={`${key}.lead`} label="Text under the heading" defaultValue={page.lead} max={m(`${key}.lead`)} rows={3} />
            {page.bannerImage ? (
              <ImageAltField name={`${key}.bannerImage`} label="Banner photo description" image={page.bannerImage} max={m(`${key}.bannerImage.alt`)} />
            ) : null}
            <h3 className="mt-2 text-sm font-bold tracking-wide text-muted uppercase">Search engines</h3>
            <TextField name={`${key}.title`} label="Title in search results" defaultValue={page.title} max={m(`${key}.title`)} hint={TITLE_HINT} />
            <TextField name={`${key}.description`} label="Description in search results" defaultValue={page.description} max={m(`${key}.description`)} rows={3} hint={DESCRIPTION_HINT} />
          </Group>
        );
      })}
    </EditorShell>
  );
}
