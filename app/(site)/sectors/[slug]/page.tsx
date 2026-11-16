import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmailText } from "@/components/EmailText";
import { CheckList, FeatureGrid } from "@/components/FeatureGrid";
import { PageMotion } from "@/components/motion/PageMotion";
import { RevealImage } from "@/components/motion/RevealImage";
import { PageBanner } from "@/components/PageBanner";
import { SectorCard } from "@/components/SectorCard";
import { ArrowLink, ButtonLink, Eyebrow, IconChip, Section, SectionHeading } from "@/components/ui";
import { sectorImage, sectorPhotos } from "@/lib/samples";
import { metadataFor } from "@/lib/content/metadata";
import { getAbout, getCompany, getSector, getSectors } from "@/lib/content/site-content";
import { telHref, whatsappHref } from "@/lib/site";

export async function generateStaticParams() {
  const sectors = await getSectors();
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sectors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [sector, company] = await Promise.all([getSector(slug), getCompany()]);
  if (!sector) return {};
  return metadataFor(sector.name, `${sector.summary} ${company.name}, ${company.headquarters}.`, `/sectors/${sector.slug}`);
}

/**
 * The shared shell for all sector URLs is just <main> and a placeholder;
 * the sector itself (which depends on the URL) streams in behind Suspense.
 * Every slug is still fully prerendered, so first loads show real content.
 */
export default function SectorPage({ params }: PageProps<"/sectors/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Suspense fallback={<SectorPageSkeleton />}>
        <SectorContent params={params} />
      </Suspense>
    </main>
  );
}

function SectorPageSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="bg-navy">
        <div className="mx-auto flex max-w-site flex-col gap-5 px-5 py-16 sm:px-6 md:py-24">
          <span className="h-4 w-48 rounded-sm bg-white/10" />
          <span className="h-12 w-full max-w-xl rounded-sm bg-white/15" />
          <span className="h-5 w-full max-w-lg rounded-sm bg-white/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-site gap-12 px-5 py-20 sm:px-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <span className="h-10 w-3/4 rounded-sm bg-mist" />
          <span className="h-24 w-full rounded-sm bg-mist" />
        </div>
        <span className="aspect-4/3 rounded-lg bg-mist" />
      </div>
    </div>
  );
}

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

/** Full class names so Tailwind can see them */
const columnsFor: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-4",
};

async function SectorContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [sector, sectors, company, about] = await Promise.all([getSector(slug), getSectors(), getCompany(), getAbout()]);
  if (!sector) notFound();
  const { approach } = about;
  const primaryPhone = company.phones[0];

  const others = sectors.filter((s) => s.slug !== sector.slug);
  const photos = sectorPhotos(sector);
  const [lead, ...gallery] = photos;
  // Five photos: one featured plus four; fewer: an even row with no empty cells
  const featured = gallery.length >= 5;
  const tiles = gallery.slice(0, featured ? 5 : 4);
  const enquiryText = `Hello ${company.name}, I would like to enquire about ${sector.name.toLowerCase()}.`;
  const emailHref = `mailto:${company.email}?subject=${encodeURIComponent(`Enquiry: ${sector.name}`)}`;

  return (
    <PageMotion>
      <PageBanner
        eyebrow="Our sectors"
        title={sector.name}
        lead={sector.summary}
        crumbs={[{ label: "Sectors", href: "/sectors" }, { label: sector.shortName }]}
        image={sectorImage(sector)}
      >
        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href={`/contact?sector=${sector.slug}#enquiry`} fx>
            Enquire about this sector
          </ButtonLink>
        </div>
      </PageBanner>

      {/* Overview */}
      <Section labelledBy="overview-title">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <div data-reveal="up" className="flex flex-col gap-5">
              <Eyebrow>Overview</Eyebrow>
              <h2 id="overview-title" className="text-section font-extrabold text-navy">
                {sector.headline}
              </h2>
            </div>
            {sector.overview.map((paragraph, i) => (
              <p
                key={paragraph.slice(0, 32)}
                data-reveal="up"
                style={delay(100 + i * 80)}
                className={i === 0 ? "text-lg text-ink" : "text-muted"}
              >
                {paragraph}
              </p>
            ))}
            <CheckList items={sector.focus} className="mt-3 w-full" />
          </div>

          <div className="relative isolate">
            <RevealImage
              image={lead}
              sizes="(min-width: 1200px) 560px, (min-width: 1024px) 50vw, 100vw"
              className="aspect-4/3 shadow-lift"
              parallax
              preload
            />
            <div data-reveal="scale" style={delay(400)} className="absolute -bottom-6 left-6 z-10">
              <IconChip icon={sector.icon} size="lg" className="shadow-lift ring-8 ring-white" />
            </div>
            <span
              aria-hidden="true"
              className="absolute -top-6 -right-6 -z-10 size-32 rounded-full border-16 border-gold"
            />
          </div>
        </div>
      </Section>

      {/* Sector photos */}
      {gallery.length ? (
        <Section tone="mist" labelledBy="photos-title" size="compact">
          <div data-reveal="up" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading id="photos-title" eyebrow="In pictures" title={`${sector.shortName} in pictures`} />
            <ArrowLink href="/gallery" fx>
              View the full gallery
            </ArrowLink>
          </div>
          <ul
            data-reveal="stagger"
            className={`mt-10 grid gap-5 sm:grid-cols-2 ${columnsFor[tiles.length] ?? "lg:grid-cols-4"}`}
          >
            {tiles.map((photo, i) => {
              const big = featured && i === 0;
              return (
                <li key={photo.src} className={big ? "sm:col-span-2 sm:row-span-2" : ""}>
                  <figure
                    className={`group relative h-full overflow-hidden rounded-lg bg-navy shadow-card ${big ? "min-h-72" : "aspect-4/3"}`}
                  >
                    <RevealImage
                      image={photo}
                      sizes={big ? "(min-width: 1024px) 590px, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 290px, (min-width: 640px) 50vw, 100vw"}
                      fill
                      zoom
                      decorative
                    />
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-navy-deep/90 to-transparent p-4 pt-12 text-sm font-semibold text-white transition-[transform,opacity] duration-500 ease-premium sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      {photo.alt}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {/* How we work */}
      <Section labelledBy="approach-title">
        <div data-reveal="up">
          <SectionHeading
            id="approach-title"
            eyebrow="How we work"
            title="What clients can expect from us"
            intro="The same commitments apply across every sector of The British Family Limited."
          />
        </div>
        <div className="mt-12">
          <FeatureGrid items={approach} />
        </div>
      </Section>

      {/* Enquiry */}
      <Section labelledBy="enquire-title" size="compact">
        <div
          data-reveal="scale"
          className="on-dark relative isolate overflow-hidden rounded-lg bg-navy px-6 py-10 text-white sm:px-10 md:px-14 md:py-14"
        >
          <span
            aria-hidden="true"
            className="absolute -top-28 -right-28 -z-10 aspect-square w-80 rounded-full border-32 border-gold/90 max-sm:opacity-40"
          />
          <div className="flex max-w-2xl flex-col gap-4">
            <Eyebrow onDark>Enquiries</Eyebrow>
            <h2 id="enquire-title" className="text-cta font-extrabold">
              Enquire about {sector.shortName.toLowerCase()}
            </h2>
            <p className="text-lg text-on-navy">
              Tell us what you need and our team will get back to you. Send an enquiry, call us, or
              message us on WhatsApp.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href={`/contact?sector=${sector.slug}#enquiry`} icon="mail" fx>
              Send an enquiry
            </ButtonLink>
            <ButtonLink href={telHref(primaryPhone)} variant="outline-light" icon="phone" fx>
              {primaryPhone.display}
            </ButtonLink>
            <ButtonLink
              href={whatsappHref(company.whatsappE164, enquiryText)}
              variant="outline-light"
              icon="whatsapp"
              external
              fx
            >
              WhatsApp
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-on-navy">
            Or email{" "}
            <a href={emailHref} className="font-semibold text-gold underline-offset-4 hover:underline">
              <EmailText email={company.email} />
            </a>
          </p>
        </div>
      </Section>

      {/* Other sectors */}
      <Section tone="mist" labelledBy="others-title">
        <div data-reveal="up" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading id="others-title" eyebrow="Explore further" title="Our other sectors" />
          <ArrowLink href="/sectors" fx>
            All sectors
          </ArrowLink>
        </div>
        <ul data-reveal="stagger" className="mt-12 grid gap-6 md:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug}>
              <SectorCard
                sector={other}
                showcase
                sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw"
              />
            </li>
          ))}
        </ul>
      </Section>
    </PageMotion>
  );
}
