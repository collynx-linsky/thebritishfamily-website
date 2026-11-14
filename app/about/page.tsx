import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Icon } from "@/components/Icon";
import { PageBanner } from "@/components/PageBanner";
import { ArrowLink, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { about, approach, company, leaders, pages, sectors, sectorHref, values } from "@/lib/site";

const page = pages.about;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: "/about",
});

export default function AboutPage() {
  const [lead, ...rest] = about.introduction;

  return (
    <main id="main">
      <PageBanner
        eyebrow={page.eyebrow}
        title={page.heading}
        lead={page.lead}
        crumbs={[{ label: "About" }]}
      />

      {/* Introduction */}
      <Section labelledBy="intro-title">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>Introduction</Eyebrow>
            <h2 id="intro-title" className="text-section font-extrabold text-navy">
              Connecting industry, infrastructure, technology and education
            </h2>
            <p className="text-lg text-ink">{lead}</p>
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-muted">
                {paragraph}
              </p>
            ))}
          </div>

          <aside
            aria-labelledby="at-a-glance"
            className="reveal h-fit rounded-lg bg-mist p-7 lg:sticky lg:top-28 lg:p-8"
          >
            <h2 id="at-a-glance" className="text-xl font-bold text-navy">
              At a glance
            </h2>
            <dl className="mt-5 divide-y divide-line">
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-sm text-muted">Established</dt>
                <dd className="font-display text-2xl font-extrabold text-gold-deep">
                  {company.established}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-sm text-muted">Headquarters</dt>
                <dd className="text-right font-semibold text-navy">{company.headquarters}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-sm text-muted">Directors</dt>
                <dd className="font-display text-2xl font-extrabold text-gold-deep">
                  {leaders.length}
                </dd>
              </div>
              <div className="py-3.5">
                <dt className="text-sm text-muted">Core business sectors</dt>
                <dd className="mt-2">
                  <ul className="flex flex-col">
                    {sectors.map((sector) => (
                      <li key={sector.slug}>
                        <ArrowLink href={sectorHref(sector)} prefetch className="text-[0.9375rem]">
                          {sector.shortName}
                        </ArrowLink>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      {/* Mission and vision (complete statements) */}
      <Section tone="navy" labelledBy="mission-title">
        <SectionHeading
          id="mission-title"
          eyebrow="Mission and vision"
          title="What we work towards"
          onDark
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {[
            { title: "Our mission", text: about.mission, icon: "compass" as const },
            { title: "Our vision", text: about.vision, icon: "spark" as const },
          ].map((item) => (
            <article key={item.title} className="reveal flex flex-col gap-4 rounded-lg bg-navy-soft p-8 md:p-10">
              <span className="inline-flex size-14 items-center justify-center rounded-lg bg-gold text-ink">
                <Icon name={item.icon} size={28} />
              </span>
              <h3 className="text-2xl font-bold text-gold">{item.title}</h3>
              <p className="text-[1.0625rem] text-on-navy">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Philosophy */}
      <Section labelledBy="philosophy-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading id="philosophy-title" eyebrow="Our philosophy" title="Lasting value through responsible business" />
            <figure className="reveal border-l-4 border-gold pl-6">
              <blockquote className="font-display text-[1.375rem] leading-snug font-bold text-navy">
                “{about.philosophyPullQuote}”
              </blockquote>
              <figcaption className="mt-3 text-sm text-muted">{company.name}</figcaption>
            </figure>
          </div>
          <div className="flex flex-col gap-5 text-muted lg:pt-10">
            {about.philosophy.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section tone="mist" labelledBy="values-title">
        <SectionHeading
          id="values-title"
          eyebrow="Our values"
          title="Four principles that guide every sector"
          align="center"
        />
        <div className="mt-12">
          <FeatureGrid
            items={values.map((v) => ({ title: v.name, description: v.description, icon: v.icon }))}
          />
        </div>
      </Section>

      {/* How the company works */}
      <Section labelledBy="approach-title">
        <SectionHeading
          id="approach-title"
          eyebrow="How we work"
          title="Serving institutional and individual clients"
          intro="Our approach to products, pricing, partnerships and delivery, wherever clients are in Tanzania."
        />
        <div className="mt-12">
          <FeatureGrid items={approach} />
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
