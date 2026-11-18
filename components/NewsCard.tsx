import Image from "next/image";
import Link from "next/link";
import { newsHref } from "@/lib/content/news";
import { newsCategoryLabels, type NewsArticle } from "@/lib/content/types";
import { formatDate } from "@/lib/format";
import { Icon } from "./Icon";
import { focalStyle } from "@/lib/media/focal";

/**
 * News article card. The whole card is one link (stretched link), it lifts
 * on hover and the photo zooms. `featured` gives a wide side-by-side layout.
 */
export function NewsCard({
  article,
  featured = false,
  headingLevel = "h3",
}: {
  article: NewsArticle;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <div className="lift h-full rounded-lg">
      <article
        className={`group relative flex h-full overflow-hidden rounded-lg bg-white shadow-card ${featured ? "flex-col md:flex-row" : "flex-col"}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-navy ${featured ? "aspect-16/10 md:aspect-auto md:w-[55%]" : "aspect-16/10"}`}
        >
          <Image
            src={article.image.src} style={focalStyle(article.image)}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 640px, 100vw" : "(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.06]"
          />
          <span className="absolute top-4 left-4 rounded-sm bg-gold px-3 py-1 text-xs font-bold tracking-wide text-ink uppercase">
            {newsCategoryLabels[article.category]}
          </span>
        </div>
        <div className={`flex flex-1 flex-col gap-3 ${featured ? "p-7 md:p-10" : "p-6"}`}>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="calendar" size={16} className="text-gold-deep" />
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
          <Heading
            className={`font-bold text-navy ${featured ? "text-2xl leading-tight md:text-[2rem]" : "text-xl leading-snug"}`}
          >
            <Link
              href={newsHref(article)}
              prefetch
              className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {article.title}
            </Link>
          </Heading>
          <p className={`text-muted ${featured ? "text-lg" : "text-[0.9375rem]"}`}>{article.excerpt}</p>
          <span
            aria-hidden="true"
            className="mt-auto inline-flex items-center gap-2 pt-2 font-bold text-navy"
          >
            Read article
            <Icon
              name="arrow"
              size={18}
              strokeWidth={2.4}
              className="text-gold-deep transition-transform duration-500 ease-premium motion-safe:group-hover:translate-x-1.5"
            />
          </span>
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg ring-navy ring-offset-2 group-has-[a:focus-visible]:ring-3"
        />
      </article>
    </div>
  );
}
