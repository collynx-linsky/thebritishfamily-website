"use client";

import Image from "next/image";
import { restoreOriginal, saveSector, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { ICONS, sectorSchema, type SectorItem } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, IconField, ImageAltField, ListField, Row, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(sectorSchema, path);

export function SectorForm({
  slug,
  sample,
  values: [sector],
  ...state
}: EditorProps<[SectorItem]> & { slug: string; sample: { src: string; alt: string } }) {
  return (
    <EditorShell
      {...state}
      save={saveSector.bind(null, slug)}
      undo={() => undoLastChange("sector", slug)}
      restore={() => restoreOriginal("sector", slug)}
    >
      <Group title="Name and card" description="Shown on the sector cards on the home page and the Sectors page.">
        <TextField name="name" label="Sector name" defaultValue={sector.name} max={m("name")} />
        <Row>
          <TextField name="shortName" label="Short name" defaultValue={sector.shortName} max={m("shortName")} hint="Used in menus and photo captions." />
          <IconField name="icon" label="Icon" defaultValue={sector.icon} icons={ICONS} />
        </Row>
        <TextField name="summary" label="Card summary" defaultValue={sector.summary} max={m("summary")} rows={3} />
      </Group>

      <Group title="Sector page" description="The page for this sector.">
        <TextField name="headline" label="Headline" defaultValue={sector.headline} max={m("headline")} rows={2} />
        <ListField
          name="overview"
          label="Overview paragraphs"
          itemLabel="Paragraph"
          initial={sector.overview}
          min={1}
          max={5}
          newItem=""
          renderItem={(prefix, text, i) => <TextField name={prefix} label={`Paragraph ${i + 1}`} defaultValue={text} max={m("overview.0")} rows={4} />}
        />
        <ListField
          name="focus"
          label="Areas of focus"
          description="The ticked list on the sector page."
          itemLabel="Focus area"
          initial={sector.focus}
          min={1}
          max={8}
          newItem=""
          renderItem={(prefix, text, i) => <TextField name={prefix} label={`Focus area ${i + 1}`} defaultValue={text} max={m("focus.0")} />}
        />
      </Group>

      <Group title="Photo">
        {sector.image ? (
          <ImageAltField name="image" label="Photo description" image={sector.image} max={m("image.alt")} />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-md bg-navy sm:w-40">
              <Image src={sample.src} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
            </div>
            <p className="text-sm text-muted">
              A sample photo is shown for this sector until a real one is uploaded. Photo uploads are coming soon.
            </p>
          </div>
        )}
      </Group>
    </EditorShell>
  );
}
