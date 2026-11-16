import Link from "next/link";
import { company, primaryPhone, telHref } from "@/lib/site";
import { Container } from "./ui";
import { Icon } from "./Icon";

export function TopBar() {
  const { address } = company;
  return (
    <div className="on-dark bg-navy text-sm text-on-navy">
      <Container className="flex min-h-11 items-center justify-between gap-x-8">
        <div className="flex min-w-0 items-center gap-x-7">
          <p className="hidden items-center gap-2 lg:flex">
            <Icon name="pin" size={16} strokeWidth={2} className="text-gold" />
            {address.street}, {address.city}
          </p>
          <a
            href={`mailto:${company.email}`}
            className="flex min-h-11 min-w-0 items-center gap-2 transition-colors hover:text-white"
          >
            <Icon name="mail" size={16} strokeWidth={2} className="shrink-0 text-gold" />
            <span className="hidden truncate md:inline">{company.email}</span>
            <span className="md:hidden">Email us</span>
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-x-6">
          <Link
            href="/downloads"
            className="hidden min-h-11 items-center gap-2 transition-colors hover:text-white md:flex"
          >
            <Icon name="download" size={16} strokeWidth={2} className="text-gold" />
            Downloads
          </Link>
          <a
            href={telHref(primaryPhone)}
            className="flex min-h-11 shrink-0 items-center gap-2 font-semibold text-gold transition-colors hover:text-white"
          >
            <Icon name="phone" size={16} strokeWidth={2} />
            {primaryPhone.display}
          </a>
        </div>
      </Container>
    </div>
  );
}
