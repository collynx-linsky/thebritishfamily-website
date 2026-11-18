"use client";

import { restoreOriginal, saveSector, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { ICONS, sectorSchema, type SectorItem } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, IconField, ImageField, ListField, Row, TextField } from "./fields";
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

      <Group icon="image" title="Photo" description="Shown on the sector card and at the top of the sector page.">
        <ImageField
          name="image"
          label="Photo description"
          image={sector.image}
          sample={sample}
          max={m("image.alt")}
          recommended={{ width: 1200, height: 900, shape: "landscape (4:3)" }}
          where="Sector cards and the sector page"
          pickerTitle={`Choose a photo for ${sector.name}`}
        />
      </Group>
    </EditorShell>
  );
}
