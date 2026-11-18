import Image from "next/image";
import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { EmailText } from "@/components/EmailText";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Icon } from "@/components/Icon";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageBanner } from "@/components/PageBanner";
import { ArrowLink, ButtonLink, Container, Section, SectionHeading } from "@/components/ui";

import { metadataForPage } from "@/lib/content/metadata";
import { getAbout, getCompany, getLeaders, getPages } from "@/lib/content/site-content";
import { focalStyle } from "@/lib/media/focal";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("leadership", "/leadership");
}

export default async function LeadershipPage() {
  const [about, company, leaders, pages] = await Promise.all([getAbout(), getCompany(), getLeaders(), getPages()]);
  const page = pages.leadership;
  const { values, approach } = about;
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "Leadership" }]}
          image={page.bannerImage}
        />

        {/* Directors */}
        <Section labelledBy="directors-title">
          <div data-reveal="up">
            <SectionHeading
              id="directors-title"
              eyebrow="Board of directors"
              title="The people guiding the company"
              align="center"
            />
          </div>
          <ul className="mt-14 flex flex-col gap-16 md:gap-20">
            {leaders.map((leader, i) => {
              const flipped = i % 2 === 1;
              return (
                <li key={leader.slug} id={leader.slug} className="scroll-mt-28">
                  <article
                    aria-labelledby={`${leader.slug}-name`}
                    className={`grid items-center gap-10 md:gap-14 ${flipped ? "md:grid-cols-[1fr_16rem]" : "md:grid-cols-[16rem_1fr]"}`}
                  >
                    {/* Portrait: kept small (the originals are ~290px wide) */}
                    <div
                      data-reveal={flipped ? "right" : "left"}
                      className={`group relative isolate mx-auto w-full max-w-[16rem] ${flipped ? "md:order-2" : ""}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute -top-5 -z-10 size-40 rounded-full border-[18px] border-gold ${flipped ? "-left-8" : "-right-8"}`}
                      />
                      <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-navy shadow-lift">
                        <Image
                          src={leader.photo.src} style={focalStyle(leader.photo)}
                          alt={leader.photo.alt}
                          fill
                          sizes="256px"
                          className="object-cover object-top transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-navy-deep/70 to-transparent" />
                      </div>
                      <div className="on-dark absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-bold tracking-wide whitespace-nowrap text-white uppercase shadow-lift">
                        <Icon name="users" size={14} strokeWidth={2.2} className="text-gold" />
                        {leader.role}
                      </div>
                    </div>

                    <div
                      data-reveal={flipped ? "left" : "right"}
                      style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
                      className="flex flex-col gap-4"
                    >
                      <p className="eyebrow text-amber-ink">{leader.role}</p>
                      <h3
                        id={`${leader.slug}-name`}
                        className="text-[1.875rem] leading-tight font-extrabold text-navy md:text-[2.25rem]"
                      >
                        {leader.name}
                      </h3>
                      <span aria-hidden="true" className="h-1 w-16 rounded-full bg-gold" />
                      <p className="text-lg text-muted">{leader.bio}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <ButtonLink href={`mailto:${leader.email}`} variant="navy" icon="mail" fx>
                          <span className="sr-only">Email {leader.name}: </span>
                          <EmailText email={leader.email} />
                        </ButtonLink>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Values band over a faint parallax photo */}
        <section
          aria-labelledby="lead-values-title"
          className="on-dark relative isolate overflow-hidden bg-navy py-20 text-white md:py-24"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-20">
            <div className="parallax absolute inset-0">
              <Image src={about.images.intro.src} style={focalStyle(about.images.intro)} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          </div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/70" />
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
              <div data-reveal="up" className="flex flex-col gap-4">
                <SectionHeading
                  id="lead-values-title"
                  eyebrow="How we lead"
                  title="Leadership guided by our values"
                  onDark
                />
                <p className="text-on-navy">{about.philosophy[1]}</p>
                <ArrowLink href="/about" tone="gold" fx className="mt-1">
                  About {company.name}
                </ArrowLink>
              </div>
              <ul data-reveal="stagger" className="grid gap-4 sm:grid-cols-2">
                {values.map((value) => (
                  <li key={value.name}>
                    <div className="group lift flex h-full items-start gap-4 rounded-lg bg-navy-soft/90 p-5 ring-1 ring-white/10">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-gold text-ink transition-transform duration-500 ease-premium motion-safe:group-hover:-rotate-6">
                        <Icon name={value.icon} size={22} />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{value.name}</h3>
                        <p className="mt-1 text-sm text-on-navy">{value.description}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <Section tone="mist" labelledBy="lead-approach-title">
          <div data-reveal="up">
            <SectionHeading
              id="lead-approach-title"
              eyebrow="How we work"
              title="How we work with our clients"
              align="center"
            />
          </div>
          <div className="mt-12">
            <FeatureGrid items={approach} />
          </div>
        </Section>

        <CtaBand fx />
      </PageMotion>
    </main>
  );
}

