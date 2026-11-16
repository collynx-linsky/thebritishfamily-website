import Link from "next/link";
import {
  headerNavigation,
  navigation,
  primaryPhone,
  quoteCta,
  telHref,
  whatsappGreeting,
  whatsappHref,
} from "@/lib/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { buttonClasses, Container } from "./ui";

export function SiteHeader() {
  return (
    <header className="header-raise sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md supports-backdrop-filter:bg-white/90">
      <Container className="flex min-h-20 items-center justify-between gap-6 py-2 lg:min-h-21">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={headerNavigation} />
        </nav>

        <div className="flex items-center gap-2">
          {/* Wrapper carries the visibility, so it never conflicts with the button's own display */}
          <div className="hidden sm:block">
            <Link href={quoteCta.href} className={buttonClasses("gold")}>
              {quoteCta.label}
            </Link>
          </div>
          <MobileMenu
            items={navigation}
            quote={quoteCta}
            phone={{ display: primaryPhone.display, href: telHref(primaryPhone) }}
            whatsappHref={whatsappHref(whatsappGreeting)}
          />
        </div>
      </Container>
    </header>
  );
}
