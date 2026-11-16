"use client";

import { restoreOriginal, saveHome, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { heroSlidesSchema, homeSchema, ICONS, type HomeSection, type ImageRef } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, IconField, ImageAltField, ListField, Row, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(homeSchema, path);
const PAGE_HINT = "A page on this site, starting with /, for example /contact.";

function LinkFields({ name, label, value }: { name: string; label: string; value: { label: string; href: string } }) {
  return (
    <Row>
      <TextField name={`${name}.label`} label={`${label}: text`} defaultValue={value.label} max={m(`${name}.label`)} />
      <TextField name={`${name}.href`} label={`${label}: goes to`} defaultValue={value.href} hint={PAGE_HINT} />
    </Row>
  );
}

function Heading({ name, value }: { name: "about" | "sectors" | "mission" | "leadership" | "gallery" | "news"; value: { eyebrow: string } }) {
  return (
    <TextField
      name={`${name}.eyebrow`}
      label="Small label above the heading"
      defaultValue={value.eyebrow}
      max={m(`${name}.eyebrow`)}
    />
  );
}

export function HomeForm({ values: [home, slides], ...state }: EditorProps<[HomeSection, ImageRef[]]>) {
  return (
    <EditorShell {...state} save={saveHome} undo={() => undoLastChange("home")} restore={() => restoreOriginal("home")}>
      <Group title="Main headline" description="The large text over the slideshow at the top of the page.">
        <TextField name="hero.eyebrow" label="Small label above the headline" defaultValue={home.hero.eyebrow} max={m("hero.eyebrow")} />
        <TextField name="hero.titleLead" label="Headline, first line" defaultValue={home.hero.titleLead} max={m("hero.titleLead")} />
        <Row>
          <TextField name="hero.titleAccent" label="Headline, second line in gold" defaultValue={home.hero.titleAccent} max={m("hero.titleAccent")} />
          <TextField name="hero.titleTail" label="Headline, rest of second line" defaultValue={home.hero.titleTail} max={m("hero.titleTail")} />
        </Row>
        <TextField name="hero.body" label="Text under the headline" defaultValue={home.hero.body} max={m("hero.body")} rows={3} />
        <LinkFields name="hero.primary" label="Gold button" value={home.hero.primary} />
        <LinkFields name="hero.secondary" label="Second link" value={home.hero.secondary} />
      </Group>

      <Group
        title="Slideshow photos"
        description="The photos behind the headline, in the order they appear. Change the order, remove a photo, or edit its description. Adding and replacing photos arrives with photo uploads."
      >
        <ListField
          name="slides"
          label="Photos"
          itemLabel="Photo"
          initial={slides}
          min={1}
          renderItem={(prefix, slide) => <ImageAltField name={prefix} label="Photo description" image={slide} max={maxLengthAt(heroSlidesSchema, "0.alt")} keepSrc />}
        />
      </Group>

      <Group title="Highlight cards" description="The three cards overlapping the bottom of the slideshow.">
        <TextField name="highlights.sectorsLabel" label="Gold card text (after the number of sectors)" defaultValue={home.highlights.sectorsLabel} max={m("highlights.sectorsLabel")} />
        <TextField name="highlights.projectsLabel" label="Blue card text" defaultValue={home.highlights.projectsLabel} max={m("highlights.projectsLabel")} />
        <LinkFields name="highlights.projectsLink" label="Blue card link" value={home.highlights.projectsLink} />
      </Group>

      <Group title="About summary" description="The section with the two photos and the company values.">
        <Heading name="about" value={home.about} />
        <TextField name="about.title" label="Heading" defaultValue={home.about.title} max={m("about.title")} rows={2} />
        <LinkFields name="about.link" label="Button" value={home.about.link} />
      </Group>

      <Group title="Sectors heading" description="Above the four sector cards.">
        <Heading name="sectors" value={home.sectors} />
        <Row>
          <TextField name="sectors.titleLead" label="Heading" defaultValue={home.sectors.titleLead} max={m("sectors.titleLead")} />
          <TextField name="sectors.titleAccent" label="Heading ending in gold" defaultValue={home.sectors.titleAccent} max={m("sectors.titleAccent")} />
        </Row>
      </Group>

      <Group title="Gallery heading" description="Above the “Our work in pictures” photo strip. Choose which photos appear there in the Gallery area.">
        <Heading name="gallery" value={home.gallery} />
        <TextField name="gallery.title" label="Heading" defaultValue={home.gallery.title} max={m("gallery.title")} />
        <TextField name="gallery.linkLabel" label="Link to the full gallery" defaultValue={home.gallery.linkLabel} max={m("gallery.linkLabel")} />
      </Group>

      <Group title="Mission heading" description="The dark section with the mission and vision. The mission and vision text itself is edited in the About area.">
        <Heading name="mission" value={home.mission} />
        <TextField name="mission.title" label="Heading" defaultValue={home.mission.title} max={m("mission.title")} rows={2} />
      </Group>

      <Group title="Leadership heading" description="Above the directors' cards. Their details are edited in the Leadership area.">
        <Heading name="leadership" value={home.leadership} />
        <TextField name="leadership.title" label="Heading" defaultValue={home.leadership.title} max={m("leadership.title")} />
        <LinkFields name="leadership.link" label="Link" value={home.leadership.link} />
      </Group>

      <Group title="News heading" description="Above the latest three news articles (shown only when there is news).">
        <Heading name="news" value={home.news} />
        <TextField name="news.title" label="Heading" defaultValue={home.news.title} max={m("news.title")} />
        <TextField name="news.linkLabel" label="Link to all news" defaultValue={home.news.linkLabel} max={m("news.linkLabel")} />
      </Group>

      <Group title="Key facts" description="The four circles of figures. If you choose an icon, the circle shows the icon instead of the figure.">
        <ListField
          name="facts"
          label="Facts, in order"
          itemLabel="Fact"
          initial={home.facts}
          min={4}
          max={4}
          renderItem={(prefix, fact) => (
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr_12rem]">
              <TextField name={`${prefix}.value`} label="Figure" defaultValue={fact.value} max={m("facts.0.value")} />
              <TextField name={`${prefix}.label`} label="Label" defaultValue={fact.label} max={m("facts.0.label")} />
              <IconField name={`${prefix}.icon`} label="Icon" defaultValue={fact.icon} icons={ICONS} allowNone />
            </div>
          )}
        />
      </Group>

      <Group title="Call to action band" description="The gold band at the bottom of most pages, inviting visitors to get in touch.">
        <TextField name="cta.title" label="Heading" defaultValue={home.cta.title} max={m("cta.title")} />
        <TextField name="cta.body" label="Text" defaultValue={home.cta.body} max={m("cta.body")} rows={2} />
        <TextField name="cta.emailLabel" label="Email button text" defaultValue={home.cta.emailLabel} max={m("cta.emailLabel")} />
      </Group>
    </EditorShell>
  );
}
