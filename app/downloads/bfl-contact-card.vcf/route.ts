import { contactCard } from "@/lib/vcard";

/**
 * The company contact card, generated from the content module so it always
 * matches the contact details on the site. Uses no request data, so it is
 * prerendered at build time.
 */
export function GET() {
  return new Response(contactCard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="The-British-Family-Limited.vcf"',
    },
  });
}
