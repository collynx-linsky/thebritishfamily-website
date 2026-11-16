import Image from "next/image";
import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { CheckList } from "@/components/FeatureGrid";
import { Marquee } from "@/components/motion/Marquee";
import { PageMotion } from "@/components/motion/PageMotion";
import { RevealImage } from "@/components/motion/RevealImage";
import { PageBanner } from "@/components/PageBanner";
import { ArrowLink, ButtonLink, IconChip, Section } from "@/components/ui";
import { sectorImage, sectorPhotos } from "@/lib/samples";
import { metadataForPage } from "@/lib/content/metadata";
import { getPages, getSectors } from "@/lib/content/site-content";
import { sectorHref } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("sectors", "/sectors");
}

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export default async function SectorsPage() {
  const [pages, sectors] = await Promise.all([getPages(), getSectors()]);
  const page = pages.sectors;
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "Sectors" }]}
          image={page.bannerImage}
        />

        {/* Sector strip: also a quick jump to each sector below */}
        <div className="on-dark bg-navy-deep py-6 text-white">
          <Marquee label="Jump to a sector">
            <ul className="flex items-center">
              {sectors.map((sector) => (
                <li key={sector.slug} className="flex items-center">
                  <a href={`#${sector.slug}`} className="group flex min-h-11 items-center gap-4 rounded-sm px-6">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-md ring-1 ring-white/15">
                      <Image
                        src={sectorImage(sector).src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-700 ease-premium motion-safe:group-hover:scale-110"
                      />
                    </span>
                    <span className="font-display text-xl font-bold whitespace-nowrap transition-colors group-hover:text-gold">
                      {sector.shortName}
                    </span>
                  </a>
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-gold" />
                </li>
              ))}
            </ul>
          </Marquee>
        </div>

        <Section>
          <h2 className="sr-only">All sectors</h2>
          <ul className="flex flex-col gap-24 md:gap-28">
            {sectors.map((sector, index) => {
              const flipped = index % 2 === 1;
              const [main, ...extra] = sectorPhotos(sector);
              const thumbs = extra.slice(0, 2);
              return (
                <li key={sector.slug} id={sector.slug} className="scroll-mt-28">
                  <article
                    aria-labelledby={`sector-${sector.slug}`}
                    className="grid items-center gap-10 md:grid-cols-2 lg:gap-16"
                  >
                    <div className={`relative isolate ${flipped ? "md:order-2" : ""}`}>
                      <RevealImage
                        image={main}
                        sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 100vw"
                        className="aspect-4/3"
                        parallax
                      />
                      {thumbs.length ? (
                        <div
                          className={`relative z-10 -mt-14 flex gap-3 ${flipped ? "justify-start pl-4" : "justify-end pr-4"}`}
                        >
                          {thumbs.map((thumb, i) => (
                            <RevealImage
                              key={thumb.src}
                              image={thumb}
                              sizes="160px"
                              className="aspect-4/3 w-32 border-4 border-white sm:w-40"
                              delayMs={250 + i * 150}
                              zoom
                            />
                          ))}
                        </div>
                      ) : null}
                      <span
                        aria-hidden="true"
                        className={`absolute -top-5 -z-10 size-28 rounded-full border-[14px] border-gold ${flipped ? "-right-5" : "-left-5"}`}
                      />
                    </div>

                    <div
                      data-reveal={flipped ? "left" : "right"}
                      style={delay(150)}
                      className="flex flex-col items-start gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <IconChip icon={sector.icon} />
                        <p className="eyebrow text-amber-ink">
                          Sector {String(index + 1).padStart(2, "0")}
                        </p>
                      </div>
                      <h3
                        id={`sector-${sector.slug}`}
                        className="mt-1 text-[1.75rem] leading-tight font-extrabold text-navy md:text-[2rem]"
                      >
                        {sector.name}
                      </h3>
                      <p className="text-lg text-muted">{sector.summary}</p>
                      <CheckList items={sector.focus} className="mt-2 w-full" />
                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <ButtonLink href={sectorHref(sector)} variant="navy" fx>
                          Explore {sector.shortName.toLowerCase()}
                        </ButtonLink>
                        <ArrowLink href={`/contact?sector=${sector.slug}#enquiry`} fx>
                          Enquire
                        </ArrowLink>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
          <div data-reveal="up" className="mt-24 flex justify-center">
            <ArrowLink href="/gallery" fx>
              See all sectors in the gallery
            </ArrowLink>
          </div>
        </Section>

        <CtaBand fx />
      </PageMotion>
    </main>
  );
}
