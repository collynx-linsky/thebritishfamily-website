/**
 * Default news articles (used until the admin panel manages news).
 *
 * These are NOT invented news events. They are informative posts written
 * only from approved facts in docs/content.md, marked `sample: true`, so the
 * News section looks complete during development. Replace or remove them
 * with real company news before launch (see docs/TODO-for-BFL.md).
 */
import type { NewsArticle } from "../content/types";
import { samples } from "../samples";
import { about, company, getSector, sectors, values } from "../site";

const sectorsList = sectors.map((s) => s.name.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1");

export const defaultNews: NewsArticle[] = [
  {
    slug: "welcome-to-our-new-website",
    title: "Welcome to our new website",
    excerpt:
      "Our new website brings together our four sectors, our leadership, a photo gallery and downloadable documents in one place.",
    category: "company-news",
    publishedAt: "2026-11-16",
    image: samples.teamMeeting,
    sample: true,
    body: [
      {
        type: "paragraph",
        text: `We are pleased to welcome you to the new website of ${company.name}, a diversified company based in ${company.headquarters}, established in ${company.established}.`,
      },
      { type: "heading", text: "What you will find here" },
      {
        type: "paragraph",
        text: `The website brings together information about our four core business sectors: ${sectorsList}.`,
      },
      {
        type: "paragraph",
        text: "You can read about our mission, vision and values, meet our directors, browse photos across our sectors, and download documents such as our company profile.",
      },
      { type: "heading", text: "Get in touch" },
      {
        type: "paragraph",
        text: "Our team serves institutional and individual clients. Send us an enquiry through the contact page, call us, or message us on WhatsApp.",
      },
    ],
  },
  {
    slug: "our-four-core-sectors",
    title: "Our four core sectors at a glance",
    excerpt:
      "From mineral processing chemicals to educational services, a short introduction to the four sectors we serve.",
    category: "sectors",
    publishedAt: "2026-11-16",
    image: samples.constructionCrane,
    sample: true,
    body: [
      {
        type: "paragraph",
        text: `${company.name} operates across four core business sectors, delivering integrated solutions that connect industry, infrastructure, technology and education.`,
      },
      ...sectors.flatMap((sector) => [
        { type: "heading" as const, text: sector.name },
        { type: "paragraph" as const, text: sector.overview[0] },
      ]),
      {
        type: "paragraph",
        text: "Clients across all four sectors include both institutions and individuals, on public and private sector projects.",
      },
    ],
  },
  {
    slug: "our-mission-vision-and-values",
    title: "Our mission, vision and values",
    excerpt:
      "What guides The British Family Limited: our mission, our vision for the future, and the four values behind every sector.",
    category: "company-news",
    publishedAt: "2026-11-16",
    image: getSector("educational-services")?.image ?? samples.educationTeacher,
    sample: true,
    body: [
      { type: "heading", text: "Our mission" },
      { type: "paragraph", text: about.mission },
      { type: "heading", text: "Our vision" },
      { type: "paragraph", text: about.vision },
      { type: "heading", text: "Our values" },
      {
        type: "paragraph",
        text: `Our work is guided by ${values.map((v) => v.name.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
      },
      { type: "paragraph", text: about.philosophy[2] },
    ],
  },
];
