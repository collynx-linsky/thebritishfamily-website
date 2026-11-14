import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmailText } from "@/components/EmailText";
import { CheckList, FeatureGrid } from "@/components/FeatureGrid";
import { PageBanner } from "@/components/PageBanner";
import { SectorCard } from "@/components/SectorCard";
import { SectorMedia } from "@/components/SectorMedia";
import { ArrowLink, ButtonLink, Eyebrow, IconChip, Section, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import {
  approach,
  company,
  getSector,
  primaryPhone,
  sectors,
  telHref,
  whatsappHref,
} from "@/lib/site";

export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sectors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) return {};
  return pageMetadata({
    title: sector.name,
    description: `${sector.summary} ${company.name}, Dar es Salaam, Tanzania.`,
    path: `/sectors/${sector.slug}`,
  });
}

/**
 * The shared shell for all sector URLs is just <main> and a placeholder;
 * the sector itself (which depends on the URL) streams in behind Suspense.
 * Every slug is still fully prerendered, so first loads show real content.
 */
export default function SectorPage({ params }: PageProps<"/sectors/[slug]">) {
  return (
    <main id="main">
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
        <div className="mx-auto flex max-w-site flex-col gap-5 px-5 py-14 sm:px-6 md:py-20">
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

async function SectorContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) notFound();

  const others = sectors.filter((s) => s.slug !== sector.slug);
  const enquiryText = `Hello ${company.name}, I would like to enquire about ${sector.name.toLowerCase()}.`;
  const emailHref = `mailto:${company.email}?subject=${encodeURIComponent(`Enquiry: ${sector.name}`)}`;

  return (
    <>
      <PageBanner
        eyebrow="Our sectors"
        title={sector.name}
        lead={sector.summary}
        crumbs={[{ label: "Sectors", href: "/sectors" }, { label: sector.shortName }]}
      />

      {/* Overview */}
      <Section labelledBy="overview-title">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>Overview</Eyebrow>
            <h2 id="overview-title" className="text-section font-extrabold text-navy">
              {sector.headline}
            </h2>
            {sector.overview.map((paragraph, i) => (
              <p key={paragraph.slice(0, 32)} className={i === 0 ? "text-lg text-ink" : "text-muted"}>
                {paragraph}
              </p>
            ))}
            <CheckList items={sector.focus} className="mt-3 w-full" />
          </div>

          <div className="reveal relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg shadow-lift">
              <SectorMedia
                sector={sector}
                preload
                sizes="(min-width: 1200px) 560px, (min-width: 1024px) 50vw, 100vw"
              />
            </div>
            {/* The branded panel already carries the icon, so only photos get the chip */}
            {sector.image ? (
              <IconChip
                icon={sector.icon}
                size="lg"
                className="absolute -bottom-6 left-6 shadow-lift ring-8 ring-white"
              />
            ) : null}
          </div>
        </div>
      </Section>

      {/* How we work */}
      <Section tone="mist" labelledBy="approach-title">
        <SectionHeading
          id="approach-title"
          eyebrow="How we work"
          title="What clients can expect from us"
          intro="The same commitments apply across every sector of The British Family Limited."
        />
        <div className="mt-12">
          <FeatureGrid items={approach} />
        </div>
      </Section>

      {/* Enquiry */}
      <Section labelledBy="enquire-title" size="compact">
        <div className="on-dark relative isolate overflow-hidden rounded-lg bg-navy px-6 py-10 text-white sm:px-10 md:px-14 md:py-14">
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
            <ButtonLink href={`/contact?sector=${sector.slug}#enquiry`} icon="mail">
              Send an enquiry
            </ButtonLink>
            <ButtonLink href={telHref(primaryPhone)} variant="outline-light" icon="phone">
              {primaryPhone.display}
            </ButtonLink>
            <ButtonLink href={whatsappHref(enquiryText)} variant="outline-light" icon="whatsapp" external>
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
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading id="others-title" eyebrow="Explore further" title="Our other sectors" />
          <ArrowLink href="/sectors">All sectors</ArrowLink>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug} className="reveal">
              <SectorCard sector={other} sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw" />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
