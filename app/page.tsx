import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { FactCircle } from "@/components/FactCircle";
import { GalleryCarousel } from "@/components/motion/GalleryCarousel";
import { HeroSlider } from "@/components/motion/HeroSlider";
import { Marquee } from "@/components/motion/Marquee";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { ScrollChrome } from "@/components/motion/ScrollChrome";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { LeaderCard } from "@/components/LeaderCard";
import { SectorCard } from "@/components/SectorCard";
import {
  ArrowLink,
  ButtonLink,
  CheckDot,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui";
import { heroSlides, homeGallery } from "@/lib/media";
import { sectorImage } from "@/lib/samples";
import { organizationJsonLd } from "@/lib/structured-data";
import {
  about,
  company,
  facts,
  home,
  leaders,
  sectorHref,
  sectors,
  values,
} from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const [managingDirector] = leaders;
const mining = sectors.find((s) => s.slug === "mining-chemicals")!;
const construction = sectors.find((s) => s.slug === "construction")!;
const electronics = sectors.find((s) => s.slug === "electronics-appliances")!;

/** Delay for staged reveals, as a CSS custom property */
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as React.CSSProperties;
const riseDelay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export default function HomePage() {
  const { hero, highlights } = home;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <JsonLd data={organizationJsonLd()} />
      <ScrollChrome focusTargetId="main" />

      <MotionRoot>
        {/* 1. Hero slideshow */}
        <HeroSlider slides={heroSlides} labelledBy="hero-title">
          <Container className="flex min-h-[36rem] items-center pt-16 pb-44 md:min-h-[40rem] md:pt-20 md:pb-44">
            <div className="flex max-w-[45rem] flex-col items-start gap-6">
              <p
                className="hero-rise eyebrow rounded-sm bg-gold/15 px-4 py-2 text-gold"
                style={riseDelay(100)}
              >
                {hero.eyebrow}
              </p>
              <h1 id="hero-title" className="text-hero font-extrabold text-white">
                <span className="hero-rise block" style={riseDelay(250)}>
                  {hero.titleLead}
                </span>
                <span className="hero-rise block" style={riseDelay(400)}>
                  <span className="text-gold">{hero.titleAccent}</span> {hero.titleTail}
                </span>
              </h1>
              <p className="hero-rise max-w-[37.5rem] text-lg text-on-navy" style={riseDelay(550)}>
                {hero.body}
              </p>
              <div
                className="hero-rise flex flex-wrap items-center gap-x-6 gap-y-3"
                style={riseDelay(700)}
              >
                <ButtonLink href={hero.primary.href} fx>
                  {hero.primary.label}
                </ButtonLink>
                <ArrowLink href={hero.secondary.href} tone="white" fx className="px-2">
                  {hero.secondary.label}
                </ArrowLink>
              </div>
            </div>
          </Container>
        </HeroSlider>

        {/* 2. Highlight cards overlapping the hero (on screen at load, so they animate in on load) */}
        <Container className="relative z-10 -mt-24 md:-mt-[5.625rem]">
          <ul className="grid gap-6 md:grid-cols-3">
            <li
              className="hero-rise lift flex min-h-[13.75rem] flex-col justify-center gap-1.5 rounded-md bg-gold p-8 text-ink shadow-lift"
              style={riseDelay(800)}
            >
              <span className="font-display text-[3.5rem] leading-none font-extrabold">
                {sectors.length}
              </span>
              <span className="font-display text-[1.375rem] leading-[1.2] font-bold">
                {highlights.sectorsLabel}
              </span>
            </li>
            <li
              className="hero-rise group relative min-h-[13.75rem] overflow-hidden rounded-md shadow-lift"
              style={riseDelay(920)}
            >
              <Image
                src={mining.image!.src}
                alt={mining.image!.alt}
                fill
                sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.06]"
              />
            </li>
            <li
              className="hero-rise lift on-dark flex min-h-[13.75rem] flex-col items-start justify-center gap-3.5 rounded-md bg-navy p-8 text-white shadow-lift"
              style={riseDelay(1040)}
            >
              <Icon name="shield" size={40} className="text-gold" />
              <span className="font-display text-[1.375rem] leading-[1.2] font-bold">
                {highlights.projectsLabel}
              </span>
              <ArrowLink
                href={highlights.projectsLink.href}
                tone="gold"
                fx
                className="text-[0.9375rem]"
              >
                {highlights.projectsLink.label}
              </ArrowLink>
            </li>
          </ul>
        </Container>

        {/* 3. About summary */}
        <Section labelledBy="about-title">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-18">
            <div className="relative mx-auto h-[22rem] w-full max-w-[32rem] sm:h-[30rem] lg:mx-0">
              <span
                aria-hidden="true"
                data-reveal="scale"
                style={delay(300)}
                className="absolute top-[22%] left-0 aspect-square w-[48%] max-w-[16.25rem] rounded-full border-[24px] border-gold sm:border-[30px]"
              />
              <div
                data-reveal="wipe"
                className="absolute top-0 left-[12%] h-[84%] w-[58%] overflow-hidden rounded-md shadow-card"
              >
                <div className="parallax absolute inset-0">
                  <Image
                    src={construction.image!.src}
                    alt={construction.image!.alt}
                    fill
                    sizes="(min-width: 1024px) 300px, 58vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div
                data-reveal="wipe"
                style={delay(250)}
                className="absolute right-0 bottom-0 h-[46%] w-[50%] overflow-hidden rounded-md border-8 border-white shadow-card"
              >
                <div className="absolute inset-0">
                  <Image
                    src={electronics.image!.src}
                    alt={electronics.image!.alt}
                    fill
                    sizes="(min-width: 1024px) 260px, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div
                data-reveal="up"
                style={delay(500)}
                className="on-dark absolute bottom-5 left-[4%] z-10 flex flex-col rounded-md bg-navy px-5 py-4 text-white shadow-lift"
              >
                <span className="font-display text-[1.875rem] leading-none font-extrabold text-gold">
                  {company.established}
                </span>
                <span className="text-[0.8125rem]">Year established</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-5">
              <div data-reveal="up" className="flex flex-col gap-5">
                <Eyebrow>{home.about.eyebrow}</Eyebrow>
                <h2 id="about-title" className="text-section font-extrabold text-navy">
                  {home.about.title}
                </h2>
              </div>
              <p data-reveal="up" style={delay(120)} className="text-muted">
                {about.summary}
              </p>
              <ul
                data-reveal="stagger"
                style={delay(200)}
                className="grid w-full gap-x-10 gap-y-3 font-semibold text-navy sm:grid-cols-2"
              >
                {values.map((value) => (
                  <li key={value.name} className="flex items-center gap-2.5">
                    <CheckDot />
                    {value.name}
                  </li>
                ))}
              </ul>
              <div
                data-reveal="up"
                style={delay(300)}
                className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-5"
              >
                <ButtonLink href={home.about.link.href} variant="navy" fx>
                  {home.about.link.label}
                </ButtonLink>
                <Link href="/leadership" className="group flex items-center gap-3 rounded-sm">
                  <span className="relative size-13 overflow-hidden rounded-full bg-navy ring-2 ring-transparent transition group-hover:ring-gold">
                    <Image
                      src={managingDirector.photo.src}
                      alt=""
                      fill
                      sizes="52px"
                      className="object-cover object-top"
                    />
                  </span>
                  <span className="flex flex-col leading-[1.3]">
                    <span className="font-bold text-navy group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4">
                      {managingDirector.name}
                    </span>
                    <span className="text-sm text-muted">{managingDirector.role}</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Sector strip */}
        <div className="on-dark bg-navy-deep py-6 text-white">
          <Marquee label="Our four sectors">
            <ul className="flex items-center">
              {sectors.map((sector) => (
                <li key={sector.slug} className="flex items-center">
                  <Link
                    href={sectorHref(sector)}
                    prefetch
                    className="group flex min-h-11 items-center gap-4 rounded-sm px-6"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-md ring-1 ring-white/15">
                      <Image
                        src={sectorImage(sector).src}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-700 ease-premium motion-safe:group-hover:scale-110"
                      />
                    </span>
                    <span className="font-display text-xl font-bold whitespace-nowrap transition-colors group-hover:text-gold md:text-2xl">
                      {sector.shortName}
                    </span>
                  </Link>
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-gold" />
                </li>
              ))}
            </ul>
          </Marquee>
        </div>

        {/* 5. Sectors */}
        <Section tone="mist" labelledBy="sectors-title">
          <div data-reveal="up">
            <SectionHeading
              id="sectors-title"
              eyebrow={home.sectors.eyebrow}
              title={home.sectors.titleLead}
              accent={home.sectors.titleAccent}
              align="center"
            />
          </div>
          <ul data-reveal="stagger" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sectors.map((sector) => (
              <li key={sector.slug}>
                <SectorCard sector={sector} showcase />
              </li>
            ))}
          </ul>
        </Section>

        {/* 6. Key facts */}
        <section aria-label="Key facts" className="bg-white py-16 md:py-20">
          <Container>
            <ul
              data-reveal="stagger"
              data-stagger="scale"
              className="mx-auto grid max-w-[62.5rem] grid-cols-2 justify-items-center gap-6 sm:gap-8 md:grid-cols-4"
            >
              {facts.map((fact) => (
                <FactCircle key={fact.label} fact={fact} />
              ))}
            </ul>
          </Container>
        </section>

        {/* 7. Our work in pictures */}
        <Section tone="mist" labelledBy="gallery-title">
          <div data-reveal="up" className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading id="gallery-title" eyebrow="Gallery" title="Our work in pictures" />
            <ArrowLink href="/gallery" fx>
              View the full gallery
            </ArrowLink>
          </div>
          <div className="mt-4">
            <GalleryCarousel label="Photo gallery">
              {homeGallery.map((item) => (
                <li key={item.image.src} className="w-[min(80vw,24rem)] shrink-0 snap-start">
                  <figure className="group flex flex-col gap-3">
                    <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-navy shadow-card">
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="(min-width: 640px) 384px, 80vw"
                        className="object-cover transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.06]"
                      />
                    </div>
                    {item.sector ? (
                      <figcaption className="flex items-center gap-2 text-sm font-semibold text-navy">
                        <Icon name={item.sector.icon} size={18} className="text-gold-deep" />
                        {item.sector.shortName}
                      </figcaption>
                    ) : null}
                  </figure>
                </li>
              ))}
            </GalleryCarousel>
          </div>
        </Section>

        {/* 8. Mission and vision, over a faint parallax photo */}
        <section
          aria-labelledby="mission-title"
          className="on-dark relative isolate overflow-hidden bg-navy py-20 text-white md:py-24 lg:py-28"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-15">
            <div className="parallax absolute inset-0">
              <Image src="/images/skyline.jpg" alt="" fill sizes="100vw" className="object-cover" />
            </div>
          </div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/60" />
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
              <div data-reveal="up" className="flex flex-col gap-3.5">
                <Eyebrow onDark>{home.mission.eyebrow}</Eyebrow>
                <h2 id="mission-title" className="text-section font-extrabold">
                  {home.mission.title}
                </h2>
                <ArrowLink href="/about" tone="gold" fx className="mt-2">
                  Our full mission and philosophy
                </ArrowLink>
              </div>
              <div data-reveal="stagger" className="grid gap-6 md:grid-cols-2">
                {[
                  { title: "Our mission", text: about.missionShort, icon: "compass" as const },
                  { title: "Our vision", text: about.visionShort, icon: "spark" as const },
                ].map((item) => (
                  <div key={item.title}>
                    <div className="lift flex h-full flex-col gap-3 rounded-lg bg-navy-soft p-8">
                      <Icon name={item.icon} size={32} className="text-gold" />
                      <h3 className="text-[1.375rem] font-bold text-gold">{item.title}</h3>
                      <p className="text-[0.9375rem] text-on-navy">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* 9. Leadership */}
        <Section labelledBy="leadership-title">
          <div data-reveal="up">
            <SectionHeading
              id="leadership-title"
              eyebrow={home.leadership.eyebrow}
              title={home.leadership.title}
              align="center"
            />
          </div>
          <ul className="mt-12 grid gap-7 lg:grid-cols-2">
            {leaders.map((leader, i) => (
              <li key={leader.slug} data-reveal={i % 2 === 0 ? "left" : "right"} style={delay(i * 120)}>
                <div className="lift h-full rounded-lg">
                  <LeaderCard leader={leader} />
                </div>
              </li>
            ))}
          </ul>
          <div data-reveal="up" className="mt-10 flex justify-center">
            <ArrowLink href={home.leadership.link.href} fx>
              {home.leadership.link.label}
            </ArrowLink>
          </div>
        </Section>

        {/* 10. Call to action */}
        <CtaBand fx />
      </MotionRoot>
    </main>
  );
}
