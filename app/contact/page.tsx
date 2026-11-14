import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { EmailText } from "@/components/EmailText";
import { Icon } from "@/components/Icon";
import { PageBanner } from "@/components/PageBanner";
import { ButtonLink, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import {
  company,
  leaders,
  pages,
  sectors,
  telHref,
  whatsappGreeting,
  whatsappHref,
  type IconName,
} from "@/lib/site";

const page = pages.contact;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: "/contact",
});

const sectorOptions = [
  ...sectors.map((s) => ({ value: s.slug, label: s.name })),
  { value: "general", label: "General enquiry" },
];

function DetailBlock({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-gold text-ink">
        <Icon name={icon} size={22} strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {children}
      </div>
    </div>
  );
}

const detailLink =
  "inline-flex min-h-11 w-fit items-center text-on-navy transition-colors hover:text-gold";

export default function ContactPage() {
  const { address } = company;
  const whatsapp = whatsappHref(whatsappGreeting);

  return (
    <main id="main">
      <PageBanner
        eyebrow={page.eyebrow}
        title={page.heading}
        lead={page.lead}
        crumbs={[{ label: "Contact" }]}
      />

      <Section tone="mist">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr] lg:gap-10">
          {/* Contact details */}
          <aside
            aria-labelledby="details-title"
            className="on-dark flex min-w-0 flex-col gap-8 self-start rounded-lg bg-navy p-7 text-white md:p-9"
          >
            <h2 id="details-title" className="text-2xl font-extrabold">
              Contact details
            </h2>

            <DetailBlock icon="pin" title="Head office">
              <address className="text-on-navy not-italic">
                {company.name}
                <br />
                {address.poBox}
                <br />
                {address.street}
                <br />
                {address.city}, {address.country}
              </address>
            </DetailBlock>

            <DetailBlock icon="phone" title="Call us">
              <ul>
                {company.phones.map((phone) => (
                  <li key={phone.e164}>
                    <a href={telHref(phone)} className={detailLink}>
                      {phone.display}
                    </a>
                  </li>
                ))}
              </ul>
            </DetailBlock>

            <DetailBlock icon="mail" title="Email us">
              <p className="text-sm text-on-navy">General enquiries</p>
              <a href={`mailto:${company.email}`} className={`${detailLink} font-semibold text-gold`}>
                <span>
                  <EmailText email={company.email} />
                </span>
              </a>
              <dl className="mt-2 flex flex-col gap-2">
                {leaders.map((leader) => (
                  <div key={leader.slug}>
                    <dt className="text-sm text-on-navy">{leader.role}</dt>
                    <dd>
                      <a href={`mailto:${leader.email}`} className={detailLink}>
                        <EmailText email={leader.email} />
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </DetailBlock>

            <div className="border-t border-navy-line pt-7">
              <p className="mb-4 text-on-navy">Prefer a quick message?</p>
              <ButtonLink href={whatsapp} icon="whatsapp" external className="w-full sm:w-auto">
                Chat on WhatsApp
              </ButtonLink>
            </div>
          </aside>

          {/* Enquiry form */}
          <section
            id="enquiry"
            aria-labelledby="enquiry-title"
            className="min-w-0 scroll-mt-28 rounded-lg bg-white p-7 shadow-card md:p-10"
          >
            <p className="eyebrow text-amber-ink">Enquiry form</p>
            <h2 id="enquiry-title" className="mt-2 text-section font-extrabold text-navy">
              Send us an enquiry
            </h2>
            <p className="mt-3 mb-8 text-muted">
              Tell us what you need and which sector it relates to, and our team will get back to
              you.
            </p>
            <ContactForm
              sectorOptions={sectorOptions}
              inboxEmail={company.email}
              whatsappHref={whatsapp}
            />
          </section>
        </div>
      </Section>
    </main>
  );
}
