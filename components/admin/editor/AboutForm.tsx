"use client";

import { restoreOriginal, saveAbout, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { aboutSchema, ICONS, type AboutSection } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, IconField, ImageAltField, ListField, Row, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(aboutSchema, path);

const IMAGES: { key: keyof AboutSection["images"]; label: string }[] = [
  { key: "intro", label: "About page: introduction photo" },
  { key: "philosophy", label: "About page: philosophy photo" },
  { key: "missionBackground", label: "About page: background behind mission and vision" },
  { key: "approach", label: "About page: “How we work” photo" },
  { key: "homeCollageTall", label: "Home page: tall photo in the about section" },
  { key: "homeCollageSmall", label: "Home page: small photo in the about section" },
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

      <Group title="Photos" description="Edit each photo's description. Replacing the photos themselves arrives with photo uploads." collapsible>
        {IMAGES.map(({ key, label }) => (
          <ImageAltField key={key} name={`images.${key}`} label={label} image={about.images[key]} max={m(`images.${key}.alt`)} />
        ))}
      </Group>
    </EditorShell>
  );
}
