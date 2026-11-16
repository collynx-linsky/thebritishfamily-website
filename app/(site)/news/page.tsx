import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { EmptyState } from "@/components/EmptyState";
import { PageMotion } from "@/components/motion/PageMotion";
import { NewsCard } from "@/components/NewsCard";
import { PageBanner } from "@/components/PageBanner";
import { Section } from "@/components/ui";
import { getNewsArticles } from "@/lib/content/news";
import { metadataForPage } from "@/lib/content/metadata";
import { getPages } from "@/lib/content/site-content";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("news", "/news");
}

export default async function NewsPage() {
  const [articles, pages] = await Promise.all([getNewsArticles(), getPages()]);
  const page = pages.news;
  const [featured, ...rest] = articles;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "News" }]}
          image={page.bannerImage}
        />

        <Section tone="mist" labelledBy="news-title">
          <h2 id="news-title" className="sr-only">
            Latest articles
          </h2>
          {featured ? (
            <>
              <div data-reveal="up">
                <NewsCard article={featured} featured />
              </div>
              {rest.length ? (
                <ul
                  data-reveal="stagger"
                  className={`mt-8 grid gap-6 sm:grid-cols-2 ${rest.length >= 3 ? "lg:grid-cols-3" : ""}`}
                >
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <NewsCard article={article} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <EmptyState
              icon="news"
              title="No news yet"
              body="News and updates from The British Family Limited will appear here. In the meantime, you can learn about our sectors or get in touch with our team."
              action={{ label: "Explore our sectors", href: "/sectors" }}
            />
          )}
        </Section>

        <CtaBand fx />
      </PageMotion>
    </main>
  );
}
