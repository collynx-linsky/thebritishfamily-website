import { siteUrl } from "./seo";
import { company as defaultCompany } from "./site";

type CardCompany = {
  name: string;
  phones: { e164: string }[];
  email: string;
  address: { poBox: string; street: string; city: string; country: string };
};

/** vCard 3.0 text values escape backslashes, commas and semicolons. */
const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

/** The company's contact card, built from the (edited) company details. */
export function contactCard(company: CardCompany = defaultCompany): string {
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

export const contactCardBytes = (company?: CardCompany) =>
  new TextEncoder().encode(contactCard(company)).length;
