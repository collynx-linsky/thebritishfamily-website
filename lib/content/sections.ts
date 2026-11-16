/**
 * Schemas and built-in defaults for the one-of-a-kind content sections
 * stored in `content_sections`: company, home, about and pages.
 *
 * The same schemas validate admin input on the server and parse what comes
 * back from the database. Length limits keep the public design intact; they
 * are based on how the current text fits the layout.
 */
import { z } from "zod";
import { bannerImages, samples } from "../samples";
import {
  about,
  company,
  cta,
  facts,
  home,
  pages,
  values,
  approach,
  type IconName,
} from "../site";
import type { SectionKey } from "../db/schema";

/* ------------------------------------------------------------------
   Building blocks
   ------------------------------------------------------------------ */

const text = (max: number) => z.string().trim().min(1, "This field is required.").max(max, `Keep this under ${max} characters.`);

/** Internal links only (e.g. /sectors or /contact#enquiry) */
const internalHref = z
  .string()
  .trim()
  .regex(/^\/[a-z0-9\-/#?=&]*$/i, "Use a page address on this site, starting with /, for example /contact.");

const link = z.object({ label: text(40), href: internalHref });

export const ICONS = [
  "shield", "spark", "check", "leaf", "tag", "users", "truck", "compass", "pin",
  "flask", "building", "plug", "cap", "news", "file",
] as const satisfies readonly IconName[];
const icon = z.enum(ICONS);

/** A stored image: built-in default under /images/... or an uploaded file URL */
export const imageRef = z.object({
  src: z
    .string()
    .trim()
    .refine((v) => v.startsWith("/images/") || v.startsWith("/dev-uploads/") || /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(v), "Upload an image."),
  alt: text(160),
  width: z.int().positive(),
  height: z.int().positive(),
});
export type ImageRef = z.infer<typeof imageRef>;

const phone = z.object({
  display: text(24).regex(/^\+?[\d\s()-]{7,}$/, "Enter a phone number, for example +255 655 701 421."),
  e164: z.string().trim().regex(/^\d{9,15}$/, "Digits only, with the country code and no plus sign, for example 255655701421."),
});

/* ------------------------------------------------------------------
   Sections
   ------------------------------------------------------------------ */

export const companySchema = z.object({
  name: text(80),
  shortName: text(12),
  alternateNames: z.array(text(80)).max(4),
  wordmark: z.tuple([text(20), text(20)]),
  established: z.int().min(1900).max(2100),
  headquarters: text(60),
  tagline: text(140),
  description: text(260),
  address: z.object({
    poBox: text(40),
    street: text(80),
    city: text(40),
    country: text(40),
    countryCode: z.string().trim().regex(/^[A-Z]{2}$/, "Two capital letters, for example TZ."),
  }),
  phones: z.array(phone).min(1).max(3),
  email: z.email("Enter a valid email address.").max(120),
  /** WhatsApp number (digits with country code) */
  whatsappE164: z.string().trim().regex(/^\d{9,15}$/, "Digits only, with the country code, for example 255655701421."),
});

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: text(70),
    titleLead: text(30),
    titleAccent: text(24),
    titleTail: text(24),
    body: text(240),
    primary: link,
    secondary: link,
  }),
  highlights: z.object({
    sectorsLabel: text(60),
    projectsLabel: text(60),
    projectsLink: link,
  }),
  about: z.object({ eyebrow: text(40), title: text(90), link }),
  sectors: z.object({ eyebrow: text(40), titleLead: text(60), titleAccent: text(24) }),
  mission: z.object({ eyebrow: text(40), title: text(80) }),
  leadership: z.object({ eyebrow: text(40), title: text(60), link }),
  cta: z.object({ title: text(60), body: text(140), emailLabel: text(24) }),
  facts: z
    .array(z.object({ value: z.string().trim().max(6), label: text(40), icon: icon.optional() }))
    .length(4),
});

export const aboutSchema = z.object({
  introduction: z.array(text(600)).min(1).max(6),
  summary: text(320),
  mission: text(500),
  vision: text(500),
  missionShort: text(260),
  visionShort: text(260),
  philosophy: z.array(text(600)).min(1).max(5),
  philosophyPullQuote: text(160),
  values: z.array(z.object({ name: text(30), icon, description: text(140) })).length(4),
  approach: z.array(z.object({ title: text(50), icon, description: text(220) })).length(4),
  images: z.object({
    /** About page: introduction photo */
    intro: imageRef,
    /** About page: philosophy photo */
    philosophy: imageRef,
    /** About page: background behind mission and vision */
    missionBackground: imageRef,
    /** About page: "How we work" photo */
    approach: imageRef,
    /** Home page about section: tall photo */
    homeCollageTall: imageRef,
    /** Home page about section: small photo */
    homeCollageSmall: imageRef,
  }),
});

const pageCopy = z.object({
  title: text(60),
  description: text(200),
  eyebrow: text(40),
  heading: text(70),
  lead: text(220),
  bannerImage: imageRef.optional(),
});

export const PAGE_KEYS = ["about", "sectors", "leadership", "gallery", "news", "downloads", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const pagesSchema = z.object({
  home: z.object({ title: text(90), description: text(200) }),
  ...Object.fromEntries(PAGE_KEYS.map((k) => [k, pageCopy])) as Record<PageKey, typeof pageCopy>,
});

export const sectionSchemas = {
  company: companySchema,
  home: homeSchema,
  about: aboutSchema,
  pages: pagesSchema,
} satisfies Record<SectionKey, z.ZodType>;

export type CompanySection = z.infer<typeof companySchema>;
export type HomeSection = z.infer<typeof homeSchema>;
export type AboutSection = z.infer<typeof aboutSchema>;
export type PagesSection = z.infer<typeof pagesSchema>;
export type SectionData = {
  company: CompanySection;
  home: HomeSection;
  about: AboutSection;
  pages: PagesSection;
};

/* ------------------------------------------------------------------
   Built-in defaults (from lib/site.ts and the sample photos)
   ------------------------------------------------------------------ */

const img = (i: { src: string; alt: string; width: number; height: number }): ImageRef => ({
  src: i.src,
  alt: i.alt,
  width: i.width,
  height: i.height,
});

export const sectionDefaults: SectionData = {
  company: {
    name: company.name,
    shortName: company.shortName,
    alternateNames: [...company.alternateNames],
    wordmark: [company.wordmark[0], company.wordmark[1]],
    established: company.established,
    headquarters: company.headquarters,
    tagline: company.tagline,
    description: company.description,
    address: { ...company.address },
    phones: company.phones.map((p) => ({ ...p })),
    email: company.email,
    whatsappE164: company.phones[0].e164,
  },
  home: {
    hero: { ...home.hero, primary: { ...home.hero.primary }, secondary: { ...home.hero.secondary } },
    highlights: { ...home.highlights, projectsLink: { ...home.highlights.projectsLink } },
    about: { ...home.about, link: { ...home.about.link } },
    sectors: { ...home.sectors },
    mission: { ...home.mission },
    leadership: { ...home.leadership, link: { ...home.leadership.link } },
    cta: { ...cta },
    facts: facts.map((f) => ({ value: f.value, label: f.label, ...(f.icon ? { icon: f.icon as (typeof ICONS)[number] } : {}) })),
  },
  about: {
    introduction: [...about.introduction],
    summary: about.summary,
    mission: about.mission,
    vision: about.vision,
    missionShort: about.missionShort,
    visionShort: about.visionShort,
    philosophy: [...about.philosophy],
    philosophyPullQuote: about.philosophyPullQuote,
    values: values.map((v) => ({ name: v.name, icon: v.icon as (typeof ICONS)[number], description: v.description })),
    approach: approach.map((a) => ({ title: a.title, icon: a.icon as (typeof ICONS)[number], description: a.description })),
    images: {
      intro: img(samples.teamMeeting),
      philosophy: img(samples.constructionCrane),
      missionBackground: img(samples.miningOpenPit),
      approach: img(samples.logisticsBoxes),
      homeCollageTall: { src: "/images/construction.jpg", alt: "Modern office towers seen from street level", width: 480, height: 800 },
      homeCollageSmall: { src: "/images/electronics.jpg", alt: "Generators and power equipment lined up in a yard", width: 735, height: 490 },
    },
  },
  pages: {
    home: {
      title: `${company.name} | Mining chemicals, construction, electronics and education`,
      description: company.description,
    },
    about: { ...pages.about, bannerImage: img(bannerImages.about) },
    sectors: { ...pages.sectors, bannerImage: img(bannerImages.sectors) },
    leadership: { ...pages.leadership, bannerImage: img(bannerImages.leadership) },
    gallery: { ...pages.gallery, bannerImage: img(bannerImages.gallery) },
    news: { ...pages.news, bannerImage: img(samples.chemLabBench) },
    downloads: { ...pages.downloads, bannerImage: img(samples.logisticsBoxes) },
    contact: { ...pages.contact, bannerImage: img(bannerImages.contact) },
  },
};

/**
 * Merge stored data over the defaults, field by field, so a partly filled
 * or outdated record can never blank a section. Arrays are taken as a whole.
 */
export function mergeWithDefaults<T>(defaults: T, stored: unknown): T {
  if (stored === null || stored === undefined) return defaults;
  if (Array.isArray(defaults)) return (Array.isArray(stored) && stored.length ? stored : defaults) as T;
  if (typeof defaults === "object" && defaults !== null) {
    if (typeof stored !== "object" || Array.isArray(stored)) return defaults;
    const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    for (const [k, v] of Object.entries(stored as Record<string, unknown>)) {
      out[k] = k in out ? mergeWithDefaults(out[k], v) : v;
    }
    return out as T;
  }
  return (typeof stored === typeof defaults && stored !== "" ? stored : defaults) as T;
}

/** Parse a stored section: merge over defaults, then validate; defaults if invalid. */
export function parseSection<K extends SectionKey>(key: K, stored: unknown): SectionData[K] {
  const merged = mergeWithDefaults(sectionDefaults[key], stored);
  const result = sectionSchemas[key].safeParse(merged);
  if (!result.success) {
    console.error(`[content] stored "${key}" section is invalid; using defaults`, result.error.issues.slice(0, 3));
    return sectionDefaults[key];
  }
  return result.data as SectionData[K];
}
