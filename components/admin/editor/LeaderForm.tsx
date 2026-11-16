"use client";

import { restoreOriginal, saveLeader, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { leaderSchema, type LeaderItem } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, ImageAltField, Row, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(leaderSchema, path);

export function LeaderForm({ slug, values: [leader], ...state }: EditorProps<[LeaderItem]> & { slug: string }) {
  return (
    <EditorShell
      {...state}
      save={saveLeader.bind(null, slug)}
      undo={() => undoLastChange("leader", slug)}
      restore={() => restoreOriginal("leader", slug)}
    >
      <Group title="Name and role">
        <Row>
          <TextField name="name" label="Full name" defaultValue={leader.name} max={m("name")} />
          <TextField name="role" label="Role" defaultValue={leader.role} max={m("role")} hint="For example Managing Director." />
        </Row>
        <TextField name="email" label="Email address" type="email" inputMode="email" defaultValue={leader.email} max={m("email")} />
      </Group>

      <Group title="Biography">
        <TextField
          name="summary"
          label="Short summary"
          defaultValue={leader.summary}
          max={m("summary")}
          rows={3}
          hint="Shown on the home page card."
        />
        <TextField name="bio" label="Full biography" defaultValue={leader.bio} max={m("bio")} rows={8} hint="Shown on the Leadership page." />
      </Group>

      <Group title="Portrait" description="Replacing the portrait arrives with photo uploads.">
        <ImageAltField name="photo" label="Portrait description" image={leader.photo} max={m("photo.alt")} />
      </Group>
    </EditorShell>
  );
}
