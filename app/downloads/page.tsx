import type { Metadata } from "next";
import { DownloadCard } from "@/components/DownloadCard";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageBanner } from "@/components/PageBanner";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/ui";
import { getDownloadsByCategory } from "@/lib/content/downloads";
import { samples } from "@/lib/samples";
import { pageMetadata } from "@/lib/seo";
import { company, pages } from "@/lib/site";

const page = pages.downloads;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: "/downloads",
});

export default async function DownloadsPage() {
  const groups = await getDownloadsByCategory();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "Downloads" }]}
          image={samples.logisticsBoxes}
        />

        {/* Category quick links */}
        <div className="bg-mist">
          <Container className="relative z-10 -mt-10 md:-mt-12">
            <ul className="grid gap-4 sm:grid-cols-3">
              {groups.map(({ category, items }, i) => (
                <li
                  key={category.id}
                  className="hero-rise"
                  style={{ "--delay": `${450 + i * 110}ms` } as React.CSSProperties}
                >
                  <a
                    href={`#${category.id}`}
                    className="group lift flex h-full items-center gap-4 rounded-lg bg-white p-5 shadow-card"
                  >
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-transform duration-500 ease-premium motion-safe:group-hover:scale-110">
                      <Icon name={category.id === "forms" ? "file" : category.id === "company" ? "download" : "news"} size={22} strokeWidth={2} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="font-display text-lg font-bold text-navy">{category.label}</span>
                      <span className="text-sm text-muted">
                        {items.length === 0 ? "Coming soon" : `${items.length} ${items.length === 1 ? "document" : "documents"}`}
                      </span>
                    </span>
                    <Icon
                      name="arrow"
                      size={18}
                      strokeWidth={2.4}
                      className="ml-auto shrink-0 rotate-90 text-gold-deep transition-transform duration-500 ease-premium motion-safe:group-hover:translate-y-1"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </div>

        <Section tone="mist" labelledBy="downloads-title">
          <h2 id="downloads-title" className="sr-only">
            {total} documents available
          </h2>
          <div className="flex flex-col gap-16">
            {groups.map(({ category, items }) => (
              <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-28">
                <div data-reveal="up" className="mb-6">
                  <SectionHeading id={`${category.id}-title`} eyebrow="Downloads" title={category.label} intro={category.description} />
                </div>
                {items.length ? (
                  <ul data-reveal="stagger" className="grid gap-5">
                    {items.map((item) => (
                      <li key={item.id}>
                        <DownloadCard item={item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div data-reveal="up">
                    <EmptyState
                      icon="file"
                      title={`No ${category.label.toLowerCase()} published yet`}
                      body={`They will be published here when available. Need something now? Ask our team and we will send it to you.`}
                      action={{ label: "Request a document", href: "/contact#enquiry" }}
                    />
                  </div>
                )}
              </section>
            ))}
          </div>
        </Section>

        {/* Help band */}
        <Section labelledBy="help-title" size="compact">
          <div
            data-reveal="scale"
            className="on-dark relative isolate flex flex-col gap-6 overflow-hidden rounded-lg bg-navy px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:pr-40 lg:pl-14"
          >
            {/* Kept inside the reserved right padding so it never crosses the buttons */}
            <span
              aria-hidden="true"
              className="absolute top-1/2 -right-28 -z-10 aspect-square w-60 -translate-y-1/2 rounded-full border-24 border-gold/90 max-lg:hidden"
            />
            <div className="flex max-w-xl flex-col gap-2">
              <h2 id="help-title" className="text-cta font-extrabold">
                Can&apos;t find the document you need?
              </h2>
              <p className="text-on-navy">
                Ask our team and we will send it to you by email or WhatsApp.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 whitespace-nowrap sm:flex-row">
              <ButtonLink href="/contact#enquiry" fx>
                Request a document
              </ButtonLink>
              <ButtonLink href={`mailto:${company.email}`} variant="outline-light" icon="mail" fx>
                Email us
              </ButtonLink>
            </div>
          </div>
        </Section>

      </PageMotion>
    </main>
  );
}
