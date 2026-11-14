import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { LeaderCard } from "@/components/LeaderCard";
import { PageBanner } from "@/components/PageBanner";
import { ArrowLink, Section } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { leaders, pages } from "@/lib/site";

const page = pages.leadership;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: "/leadership",
});

export default function LeadershipPage() {
  return (
    <main id="main">
      <PageBanner
        eyebrow={page.eyebrow}
        title={page.heading}
        lead={page.lead}
        crumbs={[{ label: "Leadership" }]}
      />

      <Section>
        <h2 className="sr-only">Directors</h2>
        <ul className="mx-auto flex max-w-4xl flex-col gap-8">
          {leaders.map((leader) => (
            <li key={leader.slug} id={leader.slug} className="reveal">
              <LeaderCard leader={leader} variant="full" headingLevel="h3" />
            </li>
          ))}
        </ul>
        <div className="mt-12 flex justify-center">
          <ArrowLink href="/about">About the company</ArrowLink>
        </div>
      </Section>

      <CtaBand />
    </main>
  );
}
