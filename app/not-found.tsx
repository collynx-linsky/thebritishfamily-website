import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { ArrowLink, ButtonLink, Container } from "@/components/ui";
import { navigation, sectorHref, sectors } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main" className="bg-mist">
      <Container className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="flex max-w-2xl flex-col items-start gap-5">
          <p className="eyebrow text-amber-ink">Error 404</p>
          <h1 className="text-banner font-extrabold text-navy">We could not find that page</h1>
          <p className="text-lg text-muted">
            The page may have moved, or the address may be mistyped. These links will take you
            somewhere useful.
          </p>
          <div className="mt-2 flex flex-wrap gap-3.5">
            <ButtonLink href="/">Back to the home page</ButtonLink>
            <ButtonLink href="/contact" variant="navy" icon="mail">
              Contact us
            </ButtonLink>
          </div>

          <div className="mt-8 grid w-full gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <nav aria-labelledby="nf-pages">
              <h2 id="nf-pages" className="text-lg font-bold text-navy">
                Pages
              </h2>
              <ul className="mt-2">
                {navigation
                  .filter((item) => item.href !== "/")
                  .map((item) => (
                    <li key={item.href}>
                      <ArrowLink href={item.href} className="text-[0.9375rem]">
                        {item.label}
                      </ArrowLink>
                    </li>
                  ))}
              </ul>
            </nav>
            <nav aria-labelledby="nf-sectors">
              <h2 id="nf-sectors" className="text-lg font-bold text-navy">
                Sectors
              </h2>
              <ul className="mt-2">
                {sectors.map((sector) => (
                  <li key={sector.slug}>
                    <ArrowLink href={sectorHref(sector)} prefetch className="text-[0.9375rem]">
                      {sector.shortName}
                    </ArrowLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Decorative: the BFL ring with a compass, "finding your way" */}
        <div
          aria-hidden="true"
          className="relative mx-auto hidden size-80 items-center justify-center lg:flex"
        >
          <span className="absolute inset-0 rounded-full border-[36px] border-gold" />
          <span className="absolute inset-12 rounded-full border border-navy/15" />
          <span className="flex size-36 items-center justify-center rounded-full bg-navy text-gold shadow-lift">
            <Icon name="compass" size={72} strokeWidth={1.4} />
          </span>
        </div>
      </Container>
    </main>
  );
}
