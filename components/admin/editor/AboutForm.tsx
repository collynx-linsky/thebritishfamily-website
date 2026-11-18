"use client";

import { restoreOriginal, saveAbout, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { aboutSchema, ICONS, type AboutSection } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, IconField, ImageField, ListField, Row, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(aboutSchema, path);

const LANDSCAPE = { width: 1200, height: 900, shape: "landscape (4:3)" };
const IMAGES: { key: keyof AboutSection["images"]; label: string; where: string; recommended: { width: number; height: number; shape: string } }[] = [
  { key: "intro", label: "Introduction photo description", where: "About page, beside the introduction", recommended: LANDSCAPE },
  { key: "philosophy", label: "Philosophy photo description", where: "About page, beside the philosophy", recommended: LANDSCAPE },
  { key: "missionBackground", label: "Background photo description", where: "About page, faintly behind the mission and vision", recommended: { width: 1920, height: 1080, shape: "wide (16:9)" } },
  { key: "approach", label: "“How we work” photo description", where: "About page, beside “How we work”", recommended: LANDSCAPE },
  { key: "homeCollageTall", label: "Tall photo description", where: "Home page about section, the tall photo", recommended: { width: 800, height: 1200, shape: "portrait (2:3)" } },
  { key: "homeCollageSmall", label: "Small photo description", where: "Home page about section, the small photo", recommended: { width: 900, height: 600, shape: "landscape (3:2)" } },
];

export function AboutForm({ values: [about], ...state }: EditorProps<[AboutSection]>) {
  return (
    <EditorShell {...state} save={saveAbout} undo={() => undoLastChange("about")} restore={() => restoreOriginal("about")}>
      <Group title="Introduction" description="Who the company is: the first section of the About page.">
        <ListField
          name="introduction"
          label="Paragraphs"
          itemLabel="Paragraph"
          initial={about.introduction}
          min={1}
          max={6}
          newItem=""
          renderItem={(prefix, text, i) => <TextField name={prefix} label={`Paragraph ${i + 1}`} defaultValue={text} max={m("introduction.0")} rows={4} />}
        />
        <TextField
          name="summary"
          label="Short summary"
          defaultValue={about.summary}
          max={m("summary")}
          rows={3}
          hint="Used where the company is described in a sentence or two, such as the home page about section."
        />
      </Group>

      <Group title="Mission and vision">
        <TextField name="mission" label="Mission (full, About page)" defaultValue={about.mission} max={m("mission")} rows={4} />
        <TextField name="missionShort" label="Mission (short, home page)" defaultValue={about.missionShort} max={m("missionShort")} rows={3} />
        <TextField name="vision" label="Vision (full, About page)" defaultValue={about.vision} max={m("vision")} rows={4} />
        <TextField name="visionShort" label="Vision (short, home page)" defaultValue={about.visionShort} max={m("visionShort")} rows={3} />
      </Group>

      <Group title="Philosophy">
        <ListField
          name="philosophy"
          label="Paragraphs"
          itemLabel="Paragraph"
          initial={about.philosophy}
          min={1}
          max={5}
          newItem=""
          renderItem={(prefix, text, i) => <TextField name={prefix} label={`Paragraph ${i + 1}`} defaultValue={text} max={m("philosophy.0")} rows={4} />}
        />
        <TextField name="philosophyPullQuote" label="Highlighted quote" defaultValue={about.philosophyPullQuote} max={m("philosophyPullQuote")} rows={2} />
      </Group>

      <Group title="Our values" description="The four values, shown on the About page and the home page.">
        <ListField
          name="values"
          label="Values, in order"
          itemLabel="Value"
          initial={about.values}
          min={4}
          max={4}
          renderItem={(prefix, v) => (
            <>
              <Row>
                <TextField name={`${prefix}.name`} label="Name" defaultValue={v.name} max={m("values.0.name")} />
                <IconField name={`${prefix}.icon`} label="Icon" defaultValue={v.icon} icons={ICONS} />
              </Row>
              <TextField name={`${prefix}.description`} label="Description" defaultValue={v.description} max={m("values.0.description")} rows={2} />
            </>
          )}
        />
      </Group>

      <Group title="How we work" description="The four steps on the About page.">
        <ListField
          name="approach"
          label="Steps, in order"
          itemLabel="Step"
          initial={about.approach}
          min={4}
          max={4}
          renderItem={(prefix, a) => (
            <>
              <Row>
                <TextField name={`${prefix}.title`} label="Title" defaultValue={a.title} max={m("approach.0.title")} />
                <IconField name={`${prefix}.icon`} label="Icon" defaultValue={a.icon} icons={ICONS} />
              </Row>
              <TextField name={`${prefix}.description`} label="Description" defaultValue={a.description} max={m("approach.0.description")} rows={3} />
            </>
          )}
        />
      </Group>

      <Group id="photos" icon="image" title="Photos" description="Replace a photo or edit its description. Photos are resized automatically." collapsible>
        {IMAGES.map(({ key, label, where, recommended }) => (
          <ImageField
            key={key}
            name={`images.${key}`}
            label={label}
            image={about.images[key]}
            max={m(`images.${key}.alt`)}
            recommended={recommended}
            where={where}
            pickerTitle="Choose a photo"
          />
        ))}
      </Group>
    </EditorShell>
  );
}
