import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { CheckList } from "@/components/FeatureGrid";
import { PageBanner } from "@/components/PageBanner";
import { SectorMedia } from "@/components/SectorMedia";
import { ArrowLink, IconChip, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { pages, sectorHref, sectors } from "@/lib/site";

const page = pages.sectors;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: "/sectors",
});

export default function SectorsPage() {
  return (
    <main id="main">
      <PageBanner
        eyebrow={page.eyebrow}
        title={page.heading}
        lead={page.lead}
        crumbs={[{ label: "Sectors" }]}
      />

      <Section>
        <h2 className="sr-only">All sectors</h2>
        <ul className="flex flex-col gap-20 md:gap-24">
          {sectors.map((sector, index) => {
            const flipped = index % 2 === 1;
            return (
              <li key={sector.slug}>
                <article
                  aria-labelledby={`sector-${sector.slug}`}
                  className="grid items-center gap-10 md:grid-cols-2 lg:gap-16"
                >
                  <div
                    className={`reveal relative aspect-[4/3] overflow-hidden rounded-lg shadow-card ${flipped ? "md:order-2" : ""}`}
                  >
                    <SectorMedia
                      sector={sector}
                      sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="reveal flex flex-col items-start gap-4">
                    <IconChip icon={sector.icon} />
                    <p className="eyebrow mt-2 text-amber-ink">
                      Sector {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3
                      id={`sector-${sector.slug}`}
                      className="text-[1.75rem] leading-tight font-extrabold text-navy md:text-[2rem]"
                    >
                      {sector.name}
                    </h3>
                    <p className="text-lg text-muted">{sector.summary}</p>
                    <CheckList items={sector.focus} className="mt-2 w-full" />
                    <ArrowLink href={sectorHref(sector)} prefetch className="mt-3">
                      Explore {sector.shortName.toLowerCase()}
                    </ArrowLink>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      <CtaBand />
    </main>
  );
}
