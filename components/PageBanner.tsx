import Link from "next/link";
import { Icon } from "./Icon";
import { Container } from "./ui";

export type Crumb = { label: string; href?: string };

/** Compact navy banner that opens every inner page. */
export function PageBanner({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  children?: React.ReactNode;
}) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...crumbs];
  return (
    <section
      aria-labelledby="page-title"
      className="on-dark relative isolate overflow-hidden bg-navy text-white"
    >
      {/* Logo-arc motif */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 -right-40 -z-10 aspect-square w-[26rem] -translate-y-1/2 rounded-full border-[36px] border-gold/90 max-md:-right-64 max-md:opacity-40"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -right-16 -z-10 aspect-square w-[34rem] -translate-y-1/2 rounded-full border border-white/10 max-md:hidden"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-linear-110 from-navy-deep via-navy to-navy-soft"
      />

      <Container className="py-14 md:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-navy">
            {trail.map((crumb, index) => {
              const last = index === trail.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-2">
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="inline-flex min-h-11 items-center transition-colors hover:text-gold sm:min-h-8"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-semibold text-white">
                      {crumb.label}
                    </span>
                  )}
                  {!last ? (
                    <Icon name="arrow" size={12} strokeWidth={2.4} className="text-gold" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-6 flex max-w-3xl flex-col gap-4">
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 id="page-title" className="text-banner font-extrabold">
            {title}
          </h1>
          {lead ? <p className="max-w-2xl text-lg text-on-navy">{lead}</p> : null}
          {children}
        </div>
      </Container>
    </section>
  );
}
