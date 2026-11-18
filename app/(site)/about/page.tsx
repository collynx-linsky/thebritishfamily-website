import Image from "next/image";
import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { FactCircle } from "@/components/FactCircle";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Icon } from "@/components/Icon";
import { PageMotion } from "@/components/motion/PageMotion";
import { RevealImage } from "@/components/motion/RevealImage";
import { PageBanner } from "@/components/PageBanner";
import { ArrowLink, ButtonLink, Container, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { metadataForPage } from "@/lib/content/metadata";
import { getAbout, getCompany, getHome, getLeaders, getPages, getSectors } from "@/lib/content/site-content";
import { sectorHref } from "@/lib/site";
import { focalStyle } from "@/lib/media/focal";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("about", "/about");
}

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;

export default async function AboutPage() {
  const [about, company, home, leaders, pages, sectors] = await Promise.all([
    getAbout(),
    getCompany(),
    getHome(),
    getLeaders(),
    getPages(),
    getSectors(),
  ]);
  const page = pages.about;
  const { values, approach, images } = about;
  const { facts } = home;
  const [lead, ...rest] = about.introduction;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "About" }]}
          image={page.bannerImage}
        >
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/sectors" fx>
              Explore our sectors
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline-light" fx>
              Contact us
            </ButtonLink>
          </div>
        </PageBanner>

        {/* Introduction */}
        <Section labelledBy="intro-title">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
            <div className="flex flex-col gap-5">
              <div data-reveal="up" className="flex flex-col gap-5">
                <Eyebrow>Introduction</Eyebrow>
                <h2 id="intro-title" className="text-section font-extrabold text-navy">
                  Connecting industry, infrastructure, technology and education
                </h2>
              </div>
              <p data-reveal="up" style={delay(100)} className="text-lg text-ink">
                {lead}
              </p>
              {rest.map((paragraph, i) => (
                <p
                  key={paragraph.slice(0, 32)}
                  data-reveal="up"
                  style={delay(160 + i * 60)}
                  className="text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <div className="relative">
                <RevealImage
                  image={images.intro}
                  sizes="(min-width: 1024px) 460px, 100vw"
                  className="aspect-4/3"
                  parallax
                />
                <div
                  data-reveal="up"
                  style={delay(400)}
                  className="on-dark absolute -bottom-6 left-6 z-10 flex items-center gap-3 rounded-md bg-navy px-5 py-4 text-white shadow-lift"
                >
                  <span className="font-display text-3xl leading-none font-extrabold text-gold">
                    {company.established}
                  </span>
                  <span className="text-sm leading-tight">
                    Year
                    <br />
                    established
                  </span>
                </div>
              </div>

              <aside
                aria-labelledby="at-a-glance"
                data-reveal="up"
                style={delay(200)}
                className="mt-6 rounded-lg bg-mist p-7"
              >
                <h2 id="at-a-glance" className="text-xl font-bold text-navy">
                  At a glance
                </h2>
                <dl className="mt-4 divide-y divide-line">
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-sm text-muted">Headquarters</dt>
                    <dd className="text-right font-semibold text-navy">{company.headquarters}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-sm text-muted">Directors</dt>
                    <dd className="font-display text-xl font-extrabold text-gold-deep">
                      {leaders.length}
                    </dd>
                  </div>
                  <div className="py-3">
                    <dt className="text-sm text-muted">Core business sectors</dt>
                    <dd className="mt-1">
                      <ul className="flex flex-col">
                        {sectors.map((sector) => (
                          <li key={sector.slug}>
                            <ArrowLink
                              href={sectorHref(sector)}
                              prefetch
                              fx
                              className="text-[0.9375rem]"
                            >
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
          </div>
        </Section>

        {/* Key facts */}
        <section aria-label="Key facts" className="bg-mist py-16 md:py-20">
          <Container>
            <ul
              data-reveal="stagger"
              data-stagger="scale"
              className="mx-auto grid max-w-250 grid-cols-2 justify-items-center gap-6 sm:gap-8 md:grid-cols-4"
            >
              {facts.map((fact) => (
                <FactCircle key={fact.label} fact={fact} />
              ))}
            </ul>
          </Container>
        </section>

        {/* Mission and vision (complete statements), over a faint parallax photo */}
        <section
          aria-labelledby="mission-title"
          className="on-dark relative isolate overflow-hidden bg-navy py-20 text-white md:py-24 lg:py-28"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-35">
            <div className="parallax absolute inset-0">
              <Image src={images.missionBackground.src} style={focalStyle(images.missionBackground)} alt="" fill sizes="100vw" className="object-cover" />
            </div>
          </div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-navy/80 via-navy/65 to-navy/85" />
          <Container>
            <div data-reveal="up">
              <SectionHeading id="mission-title" eyebrow="Mission and vision" title="What we work towards" onDark />
            </div>
            <div data-reveal="stagger" className="mt-12 grid gap-6 lg:grid-cols-2">
              {[
                { title: "Our mission", text: about.mission, icon: "compass" as const },
                { title: "Our vision", text: about.vision, icon: "spark" as const },
              ].map((item) => (
                <div key={item.title}>
                  <article className="group lift flex h-full flex-col gap-4 rounded-lg bg-navy-soft/95 p-8 ring-1 ring-white/10 backdrop-blur-sm md:p-10">
                    <span className="inline-flex size-14 items-center justify-center rounded-lg bg-gold text-ink transition-transform duration-500 ease-premium motion-safe:group-hover:-rotate-6">
                      <Icon name={item.icon} size={28} />
                    </span>
                    <h3 className="text-2xl font-bold text-gold">{item.title}</h3>
                    <p className="text-[1.0625rem] text-on-navy">{item.text}</p>
                  </article>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Philosophy */}
        <Section labelledBy="philosophy-title">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-last lg:order-first">
              <RevealImage
                image={images.philosophy}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="aspect-4/5 sm:aspect-4/3 lg:aspect-4/5"
                parallax
              />
              <figure
                data-reveal="right"
                style={delay(300)}
                className="on-dark relative z-10 -mt-20 ml-6 max-w-sm rounded-lg bg-navy p-6 text-white shadow-lift sm:ml-auto sm:-mr-4 lg:-mr-10"
              >
                <Icon name="spark" size={28} className="text-gold" />
                <blockquote className="mt-3 font-display text-xl leading-snug font-bold">
                  “{about.philosophyPullQuote}”
                </blockquote>
                <figcaption className="mt-3 text-sm text-on-navy">{company.name}</figcaption>
              </figure>
            </div>
            <div className="flex flex-col gap-5">
              <div data-reveal="up">
                <SectionHeading
                  id="philosophy-title"
                  eyebrow="Our philosophy"
                  title="Lasting value through responsible business"
                />
              </div>
              {about.philosophy.map((paragraph, i) => (
                <p key={paragraph.slice(0, 32)} data-reveal="up" style={delay(100 + i * 80)} className="text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Section>

        {/* Values */}
        <Section tone="mist" labelledBy="values-title">
          <div data-reveal="up">
            <SectionHeading
              id="values-title"
              eyebrow="Our values"
              title="Four principles that guide every sector"
              align="center"
            />
          </div>
          <div className="mt-12">
            <FeatureGrid
              items={values.map((v) => ({ title: v.name, description: v.description, icon: v.icon }))}
            />
          </div>
        </Section>

        {/* How the company works */}
        <Section labelledBy="approach-title">
          <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div data-reveal="up">
              <SectionHeading
                id="approach-title"
                eyebrow="How we work"
                title="Serving institutional and individual clients"
                intro="Our approach to products, pricing, partnerships and delivery, wherever clients are in Tanzania."
              />
            </div>
            <RevealImage
              image={images.approach}
              sizes="(min-width: 1024px) 420px, 100vw"
              className="hidden aspect-16/9 lg:block"
              decorative
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
