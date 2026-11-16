import Image from "next/image";
import Link from "next/link";
import type { ImageAsset } from "@/lib/site";
import { Icon } from "./Icon";
import { Container } from "./ui";

export type Crumb = { label: string; href?: string };

const rise = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

/**
 * Compact banner that opens every inner page: an optional photo under a navy
 * overlay (with gentle parallax), the logo arc, breadcrumbs, and text that
 * rises in on load. All motion is CSS and switches off with reduced motion.
 */
export function PageBanner({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  /** Background photo, shown under the navy overlay */
  image?: ImageAsset;
  children?: React.ReactNode;
}) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...crumbs];
  return (
    <section
      aria-labelledby="page-title"
      className="on-dark relative isolate overflow-hidden bg-navy text-white"
    >
      {image ? (
        <div aria-hidden="true" className="absolute inset-0 -z-30">
          <div className="parallax absolute inset-0">
            <Image src={image.src} alt="" fill preload sizes="100vw" className="object-cover" />
          </div>
        </div>
      ) : null}
      <span
        aria-hidden="true"
        className={`absolute inset-0 -z-20 bg-linear-100 ${image ? "from-navy-deep/95 via-navy-deep/80 to-navy-deep/45" : "from-navy-deep via-navy to-navy-soft"}`}
      />

      {/* Logo-arc motif */}
      <div
        aria-hidden="true"
        className="hero-rise absolute inset-y-0 -right-40 -z-10 flex items-center max-md:-right-64 max-md:opacity-40"
        style={rise(250)}
      >
        <span className="relative block aspect-square w-[26rem] rounded-full border-[36px] border-gold/90">
          <span className="absolute -inset-16 rounded-full border border-white/10 max-md:hidden" />
        </span>
      </div>

      <Container className="py-16 md:py-24">
        <nav aria-label="Breadcrumb" className="hero-rise" style={rise(0)}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-navy">
            {trail.map((crumb, index) => {
              const last = index === trail.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-2">
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="inline-flex min-h-11 items-center transition-colors hover:text-gold"
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
          <p className="hero-rise eyebrow text-gold" style={rise(100)}>
            {eyebrow}
          </p>
          <h1 id="page-title" className="hero-rise text-banner font-extrabold" style={rise(200)}>
            {title}
          </h1>
          {lead ? (
            <p className="hero-rise max-w-2xl text-lg text-on-navy" style={rise(320)}>
              {lead}
            </p>
          ) : null}
          {children ? (
            <div className="hero-rise" style={rise(440)}>
              {children}
            </div>
          ) : null}
        </div>
      </Container>

      {/* Thin gold rule that draws in under the banner */}
      <span
        aria-hidden="true"
        className="banner-rule absolute inset-x-0 bottom-0 h-1 origin-left bg-gold"
      />
    </section>
  );
}
