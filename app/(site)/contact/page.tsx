import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { EmailText } from "@/components/EmailText";
import { Icon } from "@/components/Icon";
import { PageMotion } from "@/components/motion/PageMotion";
import { RevealImage } from "@/components/motion/RevealImage";
import { PageBanner } from "@/components/PageBanner";
import { ButtonLink, Container, Section } from "@/components/ui";
import { metadataForPage } from "@/lib/content/metadata";
import { getAbout, getCompany, getLeaders, getPages, getSectors } from "@/lib/content/site-content";
import { telHref, whatsappGreeting, whatsappHref, type IconName } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("contact", "/contact");
}


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

export default async function ContactPage() {
  const [about, company, leaders, pages, sectors] = await Promise.all([
    getAbout(),
    getCompany(),
    getLeaders(),
    getPages(),
    getSectors(),
  ]);
  const page = pages.contact;
  const { approach } = about;
  const { address } = company;
  const primaryPhone = company.phones[0];
  const whatsapp = whatsappHref(company.whatsappE164, whatsappGreeting(company.name));
  const sectorOptions = [
    ...sectors.map((s) => ({ value: s.slug, label: s.name })),
    { value: "general", label: "General enquiry" },
  ];

  const quickContacts: { icon: IconName; label: string; value: string; href: string; external?: boolean }[] = [
    { icon: "phone", label: "Call us", value: primaryPhone.display, href: telHref(primaryPhone) },
    { icon: "mail", label: "Email us", value: "General enquiries", href: `mailto:${company.email}` },
    { icon: "whatsapp", label: "WhatsApp", value: "Quick message", href: whatsapp, external: true },
    { icon: "pin", label: "Visit us", value: address.city, href: "#details-title" },
  ];

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "Contact" }]}
          image={page.bannerImage}
        />

        {/* Quick contact tiles, overlapping the banner */}
        <div className="bg-mist">
          <Container className="relative z-10 -mt-10 md:-mt-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickContacts.map((item, i) => (
                <li key={item.label} className="hero-rise" style={{ "--delay": `${450 + i * 110}ms` } as React.CSSProperties}>
                  <a
                    href={item.href}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group lift flex h-full items-center gap-4 rounded-lg bg-white p-5 shadow-card"
                  >
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-transform duration-500 ease-premium motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6">
                      <Icon name={item.icon} size={22} strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-display text-lg font-bold text-navy">{item.label}</span>
                      <span className="truncate text-sm text-muted">{item.value}</span>
                    </span>
                    <Icon
                      name="arrow"
                      size={18}
                      strokeWidth={2.4}
                      className="ml-auto shrink-0 text-gold-deep transition-transform duration-500 ease-premium motion-safe:group-hover:translate-x-1"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </div>

      <Section tone="mist">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr] lg:gap-10">
          {/* Contact details */}
          <aside
            aria-labelledby="details-title"
            data-reveal="left"
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
              <ButtonLink href={whatsapp} icon="whatsapp" external fx className="w-full sm:w-auto">
                Chat on WhatsApp
              </ButtonLink>
            </div>
          </aside>

          {/* Enquiry form */}
          <section
            id="enquiry"
            aria-labelledby="enquiry-title"
            data-reveal="up"
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            className="relative min-w-0 scroll-mt-28 overflow-hidden rounded-lg bg-white p-7 shadow-card md:p-10"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-gold via-gold-bright to-gold" />
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

        {/* Closing band */}
        <section aria-labelledby="serving-title" className="bg-white py-16 md:py-20">
          <Container>
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <RevealImage
                image={about.images.approach}
                sizes="(min-width: 768px) 560px, 100vw"
                className="aspect-16/10"
                parallax
                decorative
              />
              <div data-reveal="right" className="flex flex-col items-start gap-4">
                <p className="eyebrow text-amber-ink">Nationwide service</p>
                <h2 id="serving-title" className="text-section font-extrabold text-navy">
                  Serving clients across Tanzania
                </h2>
                <p className="text-muted">{approach[3].description}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <ButtonLink href="/sectors" variant="navy" fx>
                    Explore our sectors
                  </ButtonLink>
                  <ButtonLink href="/gallery" variant="outline" fx>
                    View the gallery
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </PageMotion>
    </main>
  );
}
