import { siteUrl } from "./seo";
import { company } from "./site";

/** vCard 3.0 text values escape backslashes, commas and semicolons. */
const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** The company's contact card, built from the content module. */
export function contactCard(): string {
  const { address } = company;
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(company.name)}`,
    `ORG:${esc(company.name)}`,
    ...company.phones.map((phone) => `TEL;TYPE=WORK,VOICE:+${phone.e164}`),
    `EMAIL;TYPE=INTERNET,WORK:${company.email}`,
    `ADR;TYPE=WORK:${esc(address.poBox)};;${esc(address.street)};${esc(address.city)};;;${esc(address.country)}`,
    `URL:${siteUrl}`,
    "END:VCARD",
    "",
  ].join("\r\n");
}

export const contactCardBytes = () => new TextEncoder().encode(contactCard()).length;
