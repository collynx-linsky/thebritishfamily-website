/**
 * "Needs attention" and the launch checklist.
 *
 * Items are worked out from the live content every time, so they disappear
 * by themselves when the underlying problem is fixed (a sample photo
 * replaced, a sample article removed). The editor can also mark an item as
 * reviewed, for example to keep a sample article on purpose; that choice is
 * stored in `content_reviews`.
 */
import "server-only";
import { asc, sql } from "drizzle-orm";
import { requireDb, schema } from "../db";
import { getAbout, getCompany, getPages } from "../content/site-content";
import { PAGE_KEYS } from "../content/sections";
import { defaultNews } from "../defaults/news";
import { searchIndexingAllowed, siteUrl } from "../seo";

export type ReviewKind = "photo" | "content" | "confirm";

export type ReviewItem = {
  /** Stable key, stored when the item is marked as reviewed */
  key: string;
  kind: ReviewKind;
  title: string;
  detail: string;
  href: string;
  reviewed: boolean;
};

const isSample = (src: string | null | undefined) => !!src && src.startsWith("/images/samples/");
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const SAMPLE_NEWS = new Map(defaultNews.filter((n) => n.sample).map((n) => [n.slug, n.title]));

/** Every open or reviewed item, in the order an editor would tackle them. */
export async function getReviewItems(): Promise<ReviewItem[]> {
  const db = requireDb();
  const [slides, gallery, sectors, news, downloads, reviews, about, pages, company] = await Promise.all([
    db.select({ src: schema.heroSlides.imageUrl }).from(schema.heroSlides),
    db.select({ src: schema.galleryPhotos.imageUrl }).from(schema.galleryPhotos),
    db.select({ slug: schema.sectors.slug, name: schema.sectors.name, src: schema.sectors.imageUrl }).from(schema.sectors).orderBy(asc(schema.sectors.sortOrder)),
    db.select({ slug: schema.newsArticles.slug, title: schema.newsArticles.title }).from(schema.newsArticles),
    db.select({ key: schema.downloads.key }).from(schema.downloads),
    db.select({ key: schema.contentReviews.key }).from(schema.contentReviews),
    getAbout(),
    getPages(),
    getCompany(),
  ]);
  const reviewed = new Set(reviews.map((r) => r.key));
  const items: Omit<ReviewItem, "reviewed">[] = [];
  const photoDetail = "Stock photos stand in for BFL's own. Replace them with real BFL photos before launch.";

  // Sample photos, grouped by where they appear
  const slideSamples = slides.filter((s) => isSample(s.src)).length;
  if (slideSamples) items.push({ key: "samples:slideshow", kind: "photo", title: `Home slideshow: ${plural(slideSamples, "sample photo")}`, detail: photoDetail, href: "/admin/home#slideshow-photos" });
  for (const sector of sectors) {
    if (!sector.src) {
      items.push({
        key: `sector-photo:${sector.slug}`,
        kind: "photo",
        title: `${sector.name}: no photo of its own yet`,
        detail: "A sample photo is shown on the website until a real one is added.",
        href: `/admin/sectors/${sector.slug}`,
      });
    }
  }
  const aboutSamples = Object.values(about.images).filter((i) => isSample(i.src)).length;
  if (aboutSamples) items.push({ key: "samples:about", kind: "photo", title: `About page: ${plural(aboutSamples, "sample photo")}`, detail: photoDetail, href: "/admin/about#photos" });
  const bannerSamples = PAGE_KEYS.filter((k) => isSample(pages[k].bannerImage?.src)).length;
  if (bannerSamples) items.push({ key: "samples:banners", kind: "photo", title: `Page banners: ${plural(bannerSamples, "sample photo")}`, detail: photoDetail, href: "/admin/pages" });
  const gallerySamples = gallery.filter((g) => isSample(g.src)).length;
  if (gallerySamples) items.push({ key: "samples:gallery", kind: "photo", title: `Gallery: ${gallerySamples} of ${gallery.length} photos are samples`, detail: photoDetail, href: "/admin/gallery" });

  // Sample text and documents
  for (const article of news) {
    if (SAMPLE_NEWS.has(article.slug)) {
      items.push({
        key: `sample-news:${article.slug}`,
        kind: "content",
        title: `Sample news: “${article.title}”`,
        detail: "Written from the company profile, with a placeholder date. Replace it with real news, or keep it once checked.",
        href: "/admin/news",
      });
    }
  }
  if (downloads.some((d) => d.key === "company-profile")) {
    items.push({
      key: "confirm:company-profile-pdf",
      kind: "content",
      title: "Company profile PDF: confirm it can be public",
      detail: "Check all its pages, and the designer's name stored in the file's hidden details.",
      href: "/admin/downloads",
    });
  }

  // Details to confirm (from the TODO list for BFL)
  items.push({
    key: "confirm:legal-name",
    kind: "confirm",
    title: "Confirm the registered company name",
    detail: `The website uses “${company.name}”. The company profile also uses “The British Family Company Limited”.`,
    href: "/admin/contact",
  });
  items.push({
    key: "confirm:whatsapp",
    kind: "confirm",
    title: "Confirm the WhatsApp number is answered",
    detail: `Every WhatsApp button sends messages to +${company.whatsappE164}.`,
    href: "/admin/contact",
  });

  return items.map((item) => ({ ...item, reviewed: reviewed.has(item.key) }));
}

export type ChecklistLine = {
  label: string;
  done: boolean;
  detail: string;
  href?: string;
  /** Done by the website developer rather than in the admin */
  developer?: boolean;
};

/** The launch checklist, derived from the review items and the deployment settings. */
export function getLaunchChecklist(items: ReviewItem[]): ChecklistLine[] {
  const open = (kind: ReviewKind) => items.filter((i) => i.kind === kind && !i.reviewed).length;
  const photos = open("photo");
  const content = open("content");
  const confirms = open("confirm");
  const ownDomain = !/localhost|vercel\.app/.test(siteUrl);
  return [
    {
      label: "Replace the sample photos",
      done: photos === 0,
      detail: photos ? `${plural(photos, "place")} still show stock photos.` : "Every photo is BFL's own, or kept on purpose.",
      href: "#attention",
    },
    {
      label: "Check the sample news and documents",
      done: content === 0,
      detail: content ? `${plural(content, "item")} to check.` : "All checked.",
      href: "#attention",
    },
    {
      label: "Confirm the contact details",
      done: confirms === 0,
      detail: confirms ? `${plural(confirms, "detail")} to confirm.` : "Confirmed.",
      href: "#attention",
    },
    {
      label: "Connect the company's own web address",
      done: ownDomain,
      detail: ownDomain ? `The site uses ${siteUrl.replace(/^https?:\/\//, "")}.` : "Still on a temporary address. Your developer connects the domain once it is registered.",
      developer: true,
    },
    {
      label: "Let search engines list the site",
      done: searchIndexingAllowed,
      detail: searchIndexingAllowed ? "Search engines can find the site." : "Hidden from Google while it is being prepared. The last step, at launch.",
      developer: true,
    },
  ];
}

/** Count of published news stories (for the dashboard) */
export async function countNews(): Promise<number> {
  const [row] = await requireDb().select({ n: sql<number>`count(*)::int` }).from(schema.newsArticles);
  return row?.n ?? 0;
}
