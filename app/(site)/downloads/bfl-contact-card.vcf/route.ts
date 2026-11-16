import { getCompany } from "@/lib/content/site-content";
import { contactCard } from "@/lib/vcard";

/**
 * The company contact card, generated from the edited company details so it
 * always matches the contact details on the site. Its data is cached and
 * tagged, so it is prerendered and refreshed when the admin saves.
 */
export async function GET() {
  const company = await getCompany();
  const fileName = `${company.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.vcf`;
  return new Response(contactCard(company), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
