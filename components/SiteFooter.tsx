import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  company,
  navigation,
  sectorHref,
  sectors,
  telHref,
  whatsappGreeting,
  whatsappHref,
} from "@/lib/site";
import { EmailText } from "./EmailText";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { Container } from "./ui";

/** Captured once at build time so the footer stays fully static. */
async function CopyrightYear() {
  "use cache";
  cacheLife("max");
  return <>{new Date().getFullYear()}</>;
}

const footerLink =
  "inline-flex min-h-11 items-center text-on-navy transition-colors hover:text-gold sm:min-h-9";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-[1.0625rem] font-bold text-white">{children}</h2>;
}

export function SiteFooter() {
  const { address } = company;
  return (
    <footer className="on-dark bg-navy-deep text-[0.9375rem] text-on-navy">
      <Container className="pt-16 pb-8 md:pt-20">
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.2fr_1.4fr]">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Logo onDark size="sm" />
            <p className="max-w-88">{company.tagline}</p>
            <a
              href={whatsappHref(whatsappGreeting)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-sm border border-navy-line px-4 font-semibold text-white transition-colors hover:border-gold hover:text-gold"
            >
              <Icon name="whatsapp" size={18} strokeWidth={2} className="text-gold" />
              Chat on WhatsApp
            </a>
          </div>

          <nav aria-labelledby="footer-company" className="flex flex-col gap-2">
            <FooterHeading>
              <span id="footer-company">Company</span>
            </FooterHeading>
            <ul className="flex flex-col">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-sectors" className="flex flex-col gap-2">
            <FooterHeading>
              <span id="footer-sectors">Sectors</span>
            </FooterHeading>
            <ul className="flex flex-col">
              {sectors.map((sector) => (
                <li key={sector.slug}>
                  <Link href={sectorHref(sector)} prefetch className={footerLink}>
                    {sector.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-2">
            <FooterHeading>Contact</FooterHeading>
            <address className="flex flex-col gap-3 not-italic">
              <p className="pt-1.5">
                {address.poBox}, {address.street},
                <br />
                {address.city}, {address.country}
              </p>
              <ul className="flex flex-col">
                {company.phones.map((phone) => (
                  <li key={phone.e164}>
                    <a href={telHref(phone)} className={footerLink}>
                      {phone.display}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${company.email}`}
                    className="inline-block py-2.5 text-gold transition-colors hover:text-white sm:py-1.5"
                  >
                    <EmailText email={company.email} />
                  </a>
                </li>
              </ul>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-navy-line pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {company.name}. All rights reserved.
          </p>
          <p>
            Established {company.established} · {company.headquarters}
          </p>
        </div>
      </Container>
    </footer>
  );
}
