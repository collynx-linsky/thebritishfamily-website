import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CtaBand } from "@/components/CtaBand";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { PageMotion } from "@/components/motion/PageMotion";
import { RevealImage } from "@/components/motion/RevealImage";
import { NewsCard } from "@/components/NewsCard";
import { PageBanner } from "@/components/PageBanner";
import { ShareLinks } from "@/components/ShareLinks";
import { ArrowLink, Container, Section, SectionHeading } from "@/components/ui";
import { getNewsArticle, getNewsArticles, readingMinutes } from "@/lib/content/news";
import { newsCategoryLabels } from "@/lib/content/types";
import { formatDate } from "@/lib/format";
import { metadataFor } from "@/lib/content/metadata";
import { getCompany } from "@/lib/content/site-content";
import { absoluteUrl } from "@/lib/seo";
import { articleJsonLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  const articles = await getNewsArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) return {};
  return metadataFor(article.title, article.excerpt, `/news/${article.slug}`);
}

/**
 * As with the sector pages, the URL-dependent article streams in behind
 * Suspense so the shared App Shell stays instant; every article is still
 * fully prerendered.
 */
export default function ArticlePage({ params }: PageProps<"/news/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent params={params} />
      </Suspense>
    </main>
  );
}

function ArticleSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="bg-navy">
        <div className="mx-auto flex max-w-site flex-col gap-5 px-5 py-16 sm:px-6 md:py-24">
          <span className="h-4 w-40 rounded-sm bg-white/10" />
          <span className="h-12 w-full max-w-2xl rounded-sm bg-white/15" />
          <span className="h-5 w-full max-w-lg rounded-sm bg-white/10" />
        </div>
      </div>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-16">
        <span className="aspect-16/9 rounded-lg bg-mist" />
        <span className="h-24 rounded-sm bg-mist" />
      </div>
    </div>
  );
}

async function ArticleContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsArticle(slug);
  if (!article) notFound();

  const [all, company] = await Promise.all([getNewsArticles(), getCompany()]);
  const related = all.filter((a) => a.slug !== article.slug).slice(0, 3);
  const url = absoluteUrl(`/news/${article.slug}`);

  return (
    <PageMotion>
      <JsonLd data={articleJsonLd(article, company)} />
      <PageBanner
        eyebrow={newsCategoryLabels[article.category]}
        title={article.title}
        lead={article.excerpt}
        crumbs={[{ label: "News", href: "/news" }, { label: article.title }]}
        image={article.image}
      >
        <p className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-on-navy">
          <span className="flex items-center gap-2">
            <Icon name="calendar" size={16} className="text-gold" />
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </span>
          <span className="flex items-center gap-2">
            <Icon name="news" size={16} className="text-gold" />
            {readingMinutes(article)} min read
          </span>
        </p>
      </PageBanner>

      <article aria-labelledby="page-title" className="bg-white py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <RevealImage
              image={article.image}
              sizes="(min-width: 768px) 768px, 100vw"
              className="aspect-16/9 shadow-lift"
              preload
            />

            <div className="mt-12 flex flex-col gap-5 text-lg leading-relaxed text-ink">
              {article.body.map((block, i) =>
                block.type === "heading" ? (
                  <h2
                    key={i}
                    data-reveal="up"
                    className="mt-6 flex items-center gap-3 text-2xl font-bold text-navy md:text-[1.75rem]"
                  >
                    <span aria-hidden="true" className="h-7 w-1 shrink-0 rounded-full bg-gold" />
                    {block.text}
                  </h2>
                ) : (
                  <p key={i} data-reveal="up" className={i === 0 ? "text-xl text-ink" : "text-muted"}>
                    {block.text}
                  </p>
                ),
              )}
            </div>

            <div
              data-reveal="up"
              className="mt-12 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <ShareLinks url={url} title={article.title} />
              <ArrowLink href="/news" fx>
                All news
              </ArrowLink>
            </div>
          </div>
        </Container>
      </article>

      {related.length ? (
        <Section tone="mist" labelledBy="related-title">
          <div data-reveal="up">
            <SectionHeading id="related-title" eyebrow="Keep reading" title="More news" />
          </div>
          <ul data-reveal="stagger" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <NewsCard article={item} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <CtaBand fx />
    </PageMotion>
  );
}
