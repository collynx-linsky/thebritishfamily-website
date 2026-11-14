import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { FactCircle } from "@/components/FactCircle";
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
import { organizationJsonLd } from "@/lib/structured-data";
import { about, company, facts, home, leaders, sectors, values } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const [managingDirector] = leaders;
const mining = sectors.find((s) => s.slug === "mining-chemicals")!;
const construction = sectors.find((s) => s.slug === "construction")!;
const electronics = sectors.find((s) => s.slug === "electronics-appliances")!;

export default function HomePage() {
  const { hero, highlights } = home;

  return (
    <main id="main">
      <JsonLd data={organizationJsonLd()} />

      {/* Hero */}
      <section
        aria-labelledby="hero-title"
        className="on-dark relative isolate overflow-hidden bg-navy"
      >
        <Image
          src="/images/skyline.jpg"
          alt=""
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* Navy overlay keeps the low-resolution photo soft and the text legible */}
        <div className="absolute inset-0 -z-10 bg-linear-100 from-navy-deep/95 via-navy-deep/85 to-navy-deep/75" />
        <Container className="flex min-h-[34rem] items-center pt-16 pb-36 md:min-h-[38.75rem] md:pt-20 md:pb-40">
          <div className="flex max-w-[45rem] flex-col items-start gap-6">
            <p className="eyebrow rounded-sm bg-gold/15 px-4 py-2 text-gold">{hero.eyebrow}</p>
            <h1 id="hero-title" className="text-hero font-extrabold text-white">
              {hero.titleLead}
              <br />
              <span className="text-gold">{hero.titleAccent}</span> {hero.titleTail}
            </h1>
            <p className="max-w-[37.5rem] text-lg text-on-navy">{hero.body}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href={hero.primary.href}>{hero.primary.label}</ButtonLink>
              <ArrowLink href={hero.secondary.href} tone="white" className="px-2">
                {hero.secondary.label}
              </ArrowLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Highlight cards overlapping the hero */}
      <Container className="relative z-10 -mt-24 md:-mt-[5.625rem]">
        <ul className="grid gap-6 md:grid-cols-3">
          <li className="flex min-h-[13.75rem] flex-col justify-center gap-1.5 rounded-md bg-gold p-8 text-ink shadow-lift">
            <span className="font-display text-[3.5rem] leading-none font-extrabold">
              {sectors.length}
            </span>
            <span className="font-display text-[1.375rem] leading-[1.2] font-bold">
              {highlights.sectorsLabel}
            </span>
          </li>
          <li className="relative min-h-[13.75rem] overflow-hidden rounded-md shadow-lift">
            <Image
              src={mining.image!.src}
              alt={mining.image!.alt}
              fill
              sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </li>
          <li className="on-dark flex min-h-[13.75rem] flex-col items-start justify-center gap-3.5 rounded-md bg-navy p-8 text-white shadow-lift">
            <Icon name="shield" size={40} className="text-gold" />
            <span className="font-display text-[1.375rem] leading-[1.2] font-bold">
              {highlights.projectsLabel}
            </span>
            <ArrowLink href={highlights.projectsLink.href} tone="gold" className="text-[0.9375rem]">
              {highlights.projectsLink.label}
            </ArrowLink>
          </li>
        </ul>
      </Container>

      {/* About summary */}
      <Section labelledBy="about-title">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-18">
          <div className="reveal relative mx-auto h-[22rem] w-full max-w-[32rem] sm:h-[30rem] lg:mx-0">
            <span
              aria-hidden="true"
              className="absolute top-[22%] left-0 aspect-square w-[48%] max-w-[16.25rem] rounded-full border-[24px] border-gold sm:border-[30px]"
            />
            <div className="absolute top-0 left-[12%] h-[84%] w-[58%] overflow-hidden rounded-md shadow-card">
              <Image
                src={construction.image!.src}
                alt={construction.image!.alt}
                fill
                sizes="(min-width: 1024px) 300px, 58vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-0 bottom-0 h-[46%] w-[50%] overflow-hidden rounded-md border-8 border-white shadow-card">
              <Image
                src={electronics.image!.src}
                alt={electronics.image!.alt}
                fill
                sizes="(min-width: 1024px) 260px, 50vw"
                className="object-cover"
              />
            </div>
            <div className="on-dark absolute bottom-5 left-[4%] flex flex-col rounded-md bg-navy px-5 py-4 text-white shadow-lift">
              <span className="font-display text-[1.875rem] leading-none font-extrabold text-gold">
                {company.established}
              </span>
              <span className="text-[0.8125rem]">Year established</span>
            </div>
          </div>

          <div className="reveal flex flex-col items-start gap-5">
            <Eyebrow>{home.about.eyebrow}</Eyebrow>
            <h2 id="about-title" className="text-section font-extrabold text-navy">
              {home.about.title}
            </h2>
            <p className="text-muted">{about.summary}</p>
            <ul className="grid w-full gap-x-10 gap-y-3 font-semibold text-navy sm:grid-cols-2">
              {values.map((value) => (
                <li key={value.name} className="flex items-center gap-2.5">
                  <CheckDot />
                  {value.name}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-5">
              <ButtonLink href={home.about.link.href} variant="navy">
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

      {/* Sectors */}
      <Section tone="mist" labelledBy="sectors-title">
        <SectionHeading
          id="sectors-title"
          eyebrow={home.sectors.eyebrow}
          title={home.sectors.titleLead}
          accent={home.sectors.titleAccent}
          align="center"
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector) => (
            <li key={sector.slug} className="reveal">
              <SectorCard sector={sector} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Key facts */}
      <section aria-label="Key facts" className="bg-white py-16 md:py-20">
        <Container>
          <ul className="reveal mx-auto grid max-w-[62.5rem] grid-cols-2 justify-items-center gap-6 sm:gap-8 md:grid-cols-4">
            {facts.map((fact) => (
              <FactCircle key={fact.label} fact={fact} />
            ))}
          </ul>
        </Container>
      </section>

      {/* Mission and vision */}
      <Section tone="navy" labelledBy="mission-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
          <div className="flex flex-col gap-3.5">
            <Eyebrow onDark>{home.mission.eyebrow}</Eyebrow>
            <h2 id="mission-title" className="text-section font-extrabold">
              {home.mission.title}
            </h2>
            <ArrowLink href="/about" tone="gold" className="mt-2">
              Our full mission and philosophy
            </ArrowLink>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "Our mission", text: about.missionShort, icon: "compass" as const },
              { title: "Our vision", text: about.visionShort, icon: "spark" as const },
            ].map((item) => (
              <div
                key={item.title}
                className="reveal flex flex-col gap-3 rounded-lg bg-navy-soft p-8 transition duration-300 motion-safe:hover:-translate-y-1"
              >
                <Icon name={item.icon} size={32} className="text-gold" />
                <h3 className="text-[1.375rem] font-bold text-gold">{item.title}</h3>
                <p className="text-[0.9375rem] text-on-navy">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Leadership preview */}
      <Section labelledBy="leadership-title">
        <SectionHeading
          id="leadership-title"
          eyebrow={home.leadership.eyebrow}
          title={home.leadership.title}
          align="center"
        />
        <ul className="mt-12 grid gap-7 lg:grid-cols-2">
          {leaders.map((leader) => (
            <li key={leader.slug} className="reveal">
              <LeaderCard leader={leader} />
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center">
          <ArrowLink href={home.leadership.link.href}>{home.leadership.link.label}</ArrowLink>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
