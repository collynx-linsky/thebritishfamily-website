"use client";

import { restoreOriginal, saveContact, undoLastChange } from "@/lib/admin/actions/content";
import { maxLengthAt } from "@/lib/admin/form-data";
import { companySchema, type CompanySection } from "@/lib/content/sections";
import { EditorShell } from "./EditorShell";
import { Group, ListField, Row, TextField } from "./fields";
import type { EditorProps } from "./types";

const m = (path: string) => maxLengthAt(companySchema, path);
const DIGITS_HINT = "Digits only, starting with the country code, no plus sign or spaces. For example 255655701421.";

export function CompanyDetailsForm({ values: [company], ...state }: EditorProps<[CompanySection]>) {
  return (
    <EditorShell {...state} save={saveContact} undo={() => undoLastChange("contact")} restore={() => restoreOriginal("contact")}>
      <Group title="How to reach the company" description="Shown on the Contact page, in the top bar and footer of every page, and in the downloadable contact card.">
        <TextField name="email" label="Email address" type="email" inputMode="email" defaultValue={company.email} max={m("email")} />
        <TextField name="whatsappE164" label="WhatsApp number" inputMode="numeric" prefix="+" defaultValue={company.whatsappE164} hint={DIGITS_HINT} />
        <ListField
          name="phones"
          label="Phone numbers"
          description="The first number is the main one."
          itemLabel="Phone"
          initial={company.phones}
          min={1}
          max={3}
          newItem={{ display: "", e164: "" }}
          renderItem={(prefix, phone) => (
            <Row>
              <TextField
                name={`${prefix}.display`}
                label="Number as shown to visitors"
                type="tel"
                inputMode="tel"
                defaultValue={phone.display}
                max={m("phones.0.display")}
                hint="For example +255 655 701 421."
              />
              <TextField name={`${prefix}.e164`} label="Number for dialling" inputMode="numeric" prefix="+" defaultValue={phone.e164} hint={DIGITS_HINT} />
            </Row>
          )}
        />
      </Group>

      <Group title="Address">
        <Row>
          <TextField name="address.poBox" label="P.O. Box" defaultValue={company.address.poBox} max={m("address.poBox")} />
          <TextField name="address.street" label="Street or area" defaultValue={company.address.street} max={m("address.street")} />
        </Row>
        <Row>
          <TextField name="address.city" label="City" defaultValue={company.address.city} max={m("address.city")} />
          <TextField name="address.country" label="Country" defaultValue={company.address.country} max={m("address.country")} />
        </Row>
        <TextField
          name="address.countryCode"
          label="Country code"
          defaultValue={company.address.countryCode}
          hint="Two capital letters, for example TZ. Used by search engines."
        />
      </Group>

      <Group title="Company name and description" description="The name appears in page titles, the footer and search results.">
        <TextField name="name" label="Full company name" defaultValue={company.name} max={m("name")} />
        <Row>
          <TextField name="shortName" label="Short name" defaultValue={company.shortName} max={m("shortName")} hint="For example BFL." />
          <TextField name="established" label="Year established" type="number" inputMode="numeric" defaultValue={company.established} />
        </Row>
        <Row>
          <TextField name="wordmark.0" label="Logo text, first line" defaultValue={company.wordmark[0]} max={m("wordmark.0")} />
          <TextField name="wordmark.1" label="Logo text, second line" defaultValue={company.wordmark[1]} max={m("wordmark.1")} />
        </Row>
        <TextField name="headquarters" label="Headquarters" defaultValue={company.headquarters} max={m("headquarters")} hint="For example Dar es Salaam, Tanzania." />
        <TextField name="tagline" label="Footer tagline" defaultValue={company.tagline} max={m("tagline")} rows={2} />
        <TextField
          name="description"
          label="Company description"
          defaultValue={company.description}
          max={m("description")}
          rows={3}
          hint="Used by search engines and when the site is shared on social media."
        />
        <ListField
          name="alternateNames"
          label="Other names the company is known by"
          description="Optional. Helps search engines connect the names."
          itemLabel="Name"
          initial={company.alternateNames}
          max={4}
          newItem=""
          renderItem={(prefix, name, i) => <TextField name={prefix} label={`Other name ${i + 1}`} defaultValue={name} max={m("alternateNames.0")} />}
        />
      </Group>
    </EditorShell>
  );
}
