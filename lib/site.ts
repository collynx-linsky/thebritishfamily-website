/**
 * Built-in DEFAULT content for the site.
 *
 * Since the admin panel, the database is the source of truth: pages read
 * content through lib/content/site-content.ts, which falls back to these
 * defaults for anything missing, and `npm run db:seed` copies them into an
 * empty database. Navigation and URL helpers here stay in code.
 *
 * Source of facts: docs/content.md (transcribed from the BFL company
 * profile). Do not add facts that are not in that file. Missing
 * information is tracked in docs/TODO-for-BFL.md.
 */

export type IconName =
  | "pin"
  | "mail"
  | "phone"
  | "arrow"
  | "check"
  | "shield"
  | "flask"
  | "building"
  | "plug"
  | "cap"
  | "whatsapp"
  | "menu"
  | "close"
  | "users"
  | "tag"
  | "truck"
  | "spark"
  | "leaf"
  | "compass"
  | "file"
  | "download"
  | "calendar"
  | "news"
  | "link"
  | "home"
  | "image"
  | "key"
  | "search"
  | "external"
  | "chevron"
  | "logout"
  | "sidebar"
  | "user";

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Focal point from the media library (percent from left and top), for cropping */
  focal?: { x: number; y: number };
};

export type Phone = {
  display: string;
  /** E.164 digits for tel: and WhatsApp links */
  e164: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type Sector = {
  slug: string;
  /** Full name, used for page titles */
  name: string;
  /** Compact name for cards, menus and footers */
  shortName: string;
  icon: IconName;
  /** One sentence for cards */
  summary: string;
  /** Headline for the sector page */
  headline: string;
  /** Overview paragraphs for the sector page */
  overview: string[];
  /** Short statements about how the company approaches this sector */
  focus: string[];
  /** null means no photo is available yet: a branded panel is shown instead */
  image: ImageAsset | null;
};

export type Leader = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  bio: string;
  email: string;
  photo: ImageAsset;
};

export type Value = {
  name: string;
  icon: IconName;
  description: string;
};

export type ApproachItem = {
  title: string;
  icon: IconName;
  description: string;
};

/* ------------------------------------------------------------------
   Company
   ------------------------------------------------------------------ */

export const company = {
  name: "The British Family Limited",
  shortName: "BFL",
  alternateNames: ["The British Family Company Limited", "BFL"],
  wordmark: ["The British", "Family Limited"] as const,
  established: 2019,
  headquarters: "Dar es Salaam, Tanzania",
  tagline:
    "Integrated solutions connecting industry, infrastructure, technology and education.",
  description:
    "A diversified Tanzanian company established in 2019, delivering mining and mineral processing chemical supply, construction, electronics and home appliances, and educational services from Dar es Salaam.",
  address: {
    poBox: "P.O. Box 32536",
    street: "Mwenge Street, Bagamoyo Road",
    city: "Dar es Salaam",
    country: "Tanzania",
    countryCode: "TZ",
  },
  phones: [
    { display: "+255 655 701 421", e164: "255655701421" },
    { display: "+255 754 574 464", e164: "255754574464" },
  ] satisfies Phone[],
  email: "britishfamilycompanylimited@gmail.com",
  logo: {
    src: "/images/logo.png",
    width: 600,
    height: 490,
    alt: "",
  } satisfies ImageAsset,
} as const;

export const telHref = (phone: Phone) => `tel:+${phone.e164}`;

/** WhatsApp chat link for a number in E.164 digits, with an optional message. */
export const whatsappHref = (e164: string, message?: string) =>
  `https://wa.me/${e164}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const whatsappGreeting = (companyName: string) =>
  `Hello ${companyName}, I would like to make an enquiry.`;

/* ------------------------------------------------------------------
   Navigation
   ------------------------------------------------------------------ */

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Sectors", href: "/sectors" },
  { label: "Leadership", href: "/leadership" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Downloads", href: "/downloads" },
  { label: "Contact", href: "/contact" },
];

/**
 * Desktop header links. Shorter than `navigation` so the bar fits at 1024px:
 * the logo already links home, and Downloads sits in the top bar. The mobile
 * menu, footer and sitemap use the full `navigation` list.
 */
export const headerNavigation: NavItem[] = navigation.filter(
  (item) => item.href !== "/" && item.href !== "/downloads",
);

export const quoteCta: NavItem = { label: "Request a quote", href: "/contact#enquiry" };

/* ------------------------------------------------------------------
   About
   ------------------------------------------------------------------ */

export const about = {
  /** Full introduction from the company profile */
  introduction: [
    "The British Family Limited is a diversified company based in Dar es Salaam, Tanzania, established in 2019. The company operates across four core business sectors: mining and mineral processing chemical supply, construction, electronics and home appliances supply, and educational services.",
    "The company is engaged in mining activities and the supply of mineral processing chemicals that support efficient extraction and industrial processing operations. In addition, it undertakes construction services, contributing to infrastructure development for both public and private sector projects.",
    "The company also supplies electronics and home appliances to meet growing market demand, while its educational services focus on supporting learning institutions and capacity development programmes.",
    "Guided by integrity, innovation, safety and sustainability, The British Family Limited is committed to delivering integrated solutions that connect industry, infrastructure, technology and education to support sustainable economic growth in Tanzania and beyond.",
  ],
  /** Shorter version for the home page */
  summary:
    "The British Family Limited is a diversified company based in Dar es Salaam, Tanzania, established in 2019. We deliver integrated solutions that connect industry, infrastructure, technology and education to support sustainable economic growth in Tanzania and beyond.",
  mission:
    "To deliver high-quality mining and mineral processing chemical supply services, construction solutions, electronics and home appliance supplies, and educational services by upholding the highest standards of professionalism, innovation, integrity, and customer satisfaction, contributing to sustainable economic growth and development.",
  vision:
    "To be a leading and trusted enterprise in Africa, recognised for excellence in mining and mineral processing chemical supply, construction, electronics and home appliance supply, and educational services, contributing to sustainable economic growth and community development.",
  /** Condensed statements used on the home page (approved design wording) */
  missionShort:
    "To deliver high-quality services across our four sectors by upholding the highest standards of professionalism, innovation, integrity and customer satisfaction, contributing to sustainable economic growth and development.",
  visionShort:
    "To be a leading and trusted enterprise in Africa, recognised for excellence in every sector we serve, contributing to sustainable economic growth and community development.",
  philosophy: [
    "At The British Family Limited, we believe that sustainable growth is achieved through innovation, professionalism and responsible business practices. We are committed to delivering quality solutions across mining and mineral processing chemical supply, construction, electronics and home appliance supply, and educational services.",
    "Our operations are guided by integrity, safety, efficiency and respect for the communities and environments in which we operate. We strive for continuous improvement, ensuring that our products and services consistently meet the highest standards of quality and reliability.",
    "Our philosophy is centred on creating lasting value by supporting industrial development, infrastructure growth, technological advancement and educational empowerment, contributing to national progress and sustainable economic development.",
  ],
  philosophyPullQuote:
    "Sustainable growth is achieved through innovation, professionalism and responsible business practices.",
};

export const values: Value[] = [
  {
    name: "Integrity",
    icon: "shield",
    description: "Honest, professional conduct in every client relationship and every project.",
  },
  {
    name: "Innovation",
    icon: "spark",
    description: "Continuous improvement in how we deliver products and services.",
  },
  {
    name: "Safety",
    icon: "check",
    description: "Safe operations for our people, our clients and the communities around us.",
  },
  {
    name: "Sustainability",
    icon: "leaf",
    description: "Respect for the environment and a focus on long-term economic growth.",
  },
];

/** "How the company works", from the profile's marketing plan */
export const approach: ApproachItem[] = [
  {
    title: "Quality across every sector",
    icon: "check",
    description:
      "A diverse range of products and services, committed to high-quality solutions that meet the needs of both institutional and individual clients.",
  },
  {
    title: "Competitive, value-driven pricing",
    icon: "tag",
    description:
      "Pricing that keeps our offer affordable and competitive while maintaining high standards of quality and customer satisfaction.",
  },
  {
    title: "Partnerships and direct engagement",
    icon: "users",
    description:
      "We reach clients through direct marketing, strategic partnerships, digital platforms, exhibitions and professional networking.",
  },
  {
    title: "Reliable delivery nationwide",
    icon: "truck",
    description:
      "Headquartered in Dar es Salaam, serving clients across the country through efficient distribution channels and reliable service delivery.",
  },
];

/* ------------------------------------------------------------------
   Sectors
   ------------------------------------------------------------------ */

export const sectors: Sector[] = [
  {
    slug: "mining-chemicals",
    name: "Mining and mineral processing chemical supply",
    shortName: "Mining and chemicals",
    icon: "flask",
    summary:
      "Mining activities and chemical supply that support efficient extraction and industrial processing.",
    headline: "Supporting efficient extraction and industrial processing",
    overview: [
      "The British Family Limited is engaged in mining activities and in the supply of mineral processing chemicals that support efficient extraction and industrial processing operations.",
      "Safety and sustainability guide how we work in this sector, alongside the professionalism and reliability that run through all of our operations.",
    ],
    focus: [
      "Mineral processing chemical supply",
      "Support for efficient extraction",
      "Industrial processing operations",
      "Safe and responsible practice",
    ],
    image: {
      src: "/images/mining.jpg",
      width: 735,
      height: 490,
      alt: "Excavator and loader working on a mining site at sunset",
    },
  },
  {
    slug: "construction",
    name: "Construction",
    shortName: "Construction",
    icon: "building",
    summary:
      "Construction services contributing to infrastructure development for public and private sector projects.",
    headline: "Contributing to infrastructure development",
    overview: [
      "The British Family Limited undertakes construction services, contributing to infrastructure development for both public and private sector projects.",
      "We support infrastructure growth as part of our wider commitment to national progress and sustainable economic development in Tanzania.",
    ],
    focus: [
      "Construction services",
      "Infrastructure development",
      "Public sector projects",
      "Private sector projects",
    ],
    image: {
      src: "/images/construction.jpg",
      width: 480,
      height: 800,
      alt: "Modern office towers seen from street level",
    },
  },
  {
    slug: "electronics-appliances",
    name: "Electronics and home appliances supply",
    shortName: "Electronics and appliances",
    icon: "plug",
    summary: "Supply of electronics and home appliances to meet growing market demand.",
    headline: "Meeting growing demand for electronics and appliances",
    overview: [
      "The British Family Limited supplies electronics and home appliances to meet growing market demand.",
      "We serve both institutional and individual clients, with competitive, value-driven pricing and reliable delivery from our base in Dar es Salaam.",
    ],
    focus: [
      "Electronics supply",
      "Home appliances supply",
      "Institutional clients",
      "Individual buyers",
    ],
    image: {
      src: "/images/electronics.jpg",
      width: 735,
      height: 490,
      alt: "Generators and power equipment lined up in a yard",
    },
  },
  {
    slug: "educational-services",
    name: "Educational services",
    shortName: "Educational services",
    icon: "cap",
    summary: "Supporting learning institutions and capacity development programmes.",
    headline: "Supporting learning institutions and capacity development",
    overview: [
      "The educational services of The British Family Limited focus on supporting learning institutions and capacity development programmes.",
      "Educational empowerment is central to our philosophy of creating lasting value and contributing to national progress.",
    ],
    focus: [
      "Support for learning institutions",
      "Capacity development programmes",
      "Educational empowerment",
      "Long-term community value",
    ],
    image: null,
  },
];

export const getSector = (slug: string) => sectors.find((s) => s.slug === slug);

export const sectorHref = (sector: Sector) => `/sectors/${sector.slug}`;

/* ------------------------------------------------------------------
   Leadership
   ------------------------------------------------------------------ */

export const leaders: Leader[] = [
  {
    slug: "kisambu-mathias-sakunda",
    name: "Kisambu Mathias Sakunda",
    role: "Managing Director",
    summary:
      "Provides strategic leadership and guides the company's overall direction across its key sectors, focusing on growth, operational efficiency and long-term sustainability.",
    bio: "Kisambu Mathias Sakunda is the Managing Director of The British Family Limited, responsible for providing strategic leadership and guiding the company's overall direction across its key sectors, including education, mining and industrial supply. He focuses on driving growth, operational efficiency and long-term sustainability.",
    email: "ksakunda945@gmail.com",
    photo: {
      src: "/images/kisambu-sakunda.jpg",
      width: 283,
      height: 318,
      alt: "Portrait of Kisambu Mathias Sakunda, Managing Director",
    },
  },
  {
    slug: "john-mathias-mushi",
    name: "John Mathias Mushi",
    role: "Operational Director",
    summary:
      "Oversees day-to-day operations and the coordination of activities across all business divisions, maintaining high standards of performance throughout the organisation.",
    bio: "Mr John Mathias Mushi serves as the Operational Director of The British Family Limited, overseeing the company's day-to-day operations and ensuring the effective coordination of activities across all business divisions. He plays a vital role in implementing strategic objectives, enhancing operational efficiency and maintaining high standards of performance throughout the organisation.",
    email: "jmushumj@gmail.com",
    photo: {
      src: "/images/john-mushi.jpg",
      width: 298,
      height: 372,
      alt: "Portrait of John Mathias Mushi, Operational Director",
    },
  },
];

/* ------------------------------------------------------------------
   Key facts (the only numeric facts available)
   ------------------------------------------------------------------ */

export type Fact = { value: string; label: string; icon?: IconName };

export const facts: Fact[] = [
  { value: "2019", label: "Year established" },
  { value: "4", label: "Core business sectors" },
  { value: "2", label: "Directors leading the company" }, // keep in step with `leaders`
  { value: "", label: "Headquartered in Dar es Salaam", icon: "pin" },
];

/* ------------------------------------------------------------------
   Page copy
   ------------------------------------------------------------------ */

export const home = {
  hero: {
    eyebrow: `Established ${company.established} · ${company.headquarters}`,
    titleLead: "Four sectors.",
    titleAccent: "One trusted",
    titleTail: "partner.",
    body: "Mining and mineral processing chemical supply, construction, electronics and home appliances, and educational services, delivered with integrity, innovation, safety and sustainability.",
    primary: { label: "Explore our sectors", href: "/sectors" },
    secondary: { label: "About the company", href: "/about" },
  },
  highlights: {
    sectorsLabel: "Core business sectors under one company",
    projectsLabel: "Public and private sector projects",
    projectsLink: { label: "Talk to our team", href: "/contact" },
  },
  about: {
    eyebrow: "About the company",
    title: "A diversified company supporting sustainable growth in Tanzania",
    link: { label: "More about us", href: "/about" },
  },
  sectors: {
    eyebrow: "What we do",
    titleLead: "Quality solutions across four core",
    titleAccent: "sectors",
  },
  mission: {
    eyebrow: "Mission and vision",
    title: "Creating lasting value for industry and communities",
  },
  leadership: {
    eyebrow: "The organisation",
    title: "Meet our leadership",
    link: { label: "Read full profiles", href: "/leadership" },
  },
};

export const cta = {
  title: "Have a project or a supply need?",
  body: "Our team serves institutional and individual clients across Tanzania.",
  emailLabel: "Email us",
};

export const pages = {
  about: {
    title: "About us",
    description:
      "Learn about The British Family Limited: a diversified Tanzanian company established in 2019, its mission, vision, philosophy and values.",
    eyebrow: "About us",
    heading: "A diversified company built on integrity",
    lead: "Established in 2019 in Dar es Salaam, we connect industry, infrastructure, technology and education to support sustainable economic growth in Tanzania and beyond.",
  },
  sectors: {
    title: "Our sectors",
    description:
      "Mining and mineral processing chemical supply, construction, electronics and home appliances supply, and educational services from The British Family Limited.",
    eyebrow: "Our sectors",
    heading: "Four core sectors, one company",
    lead: "Integrated solutions for institutional and individual clients, across public and private sector projects.",
  },
  leadership: {
    title: "Leadership",
    description:
      "Meet the directors of The British Family Limited: Kisambu Mathias Sakunda, Managing Director, and John Mathias Mushi, Operational Director.",
    eyebrow: "The organisation",
    heading: "Leadership",
    lead: "The directors guiding the strategy and day-to-day operations of The British Family Limited.",
  },
  gallery: {
    title: "Gallery",
    description:
      "Photos across the four sectors of The British Family Limited: mining and mineral processing chemicals, construction, electronics and home appliances, and educational services.",
    eyebrow: "Gallery",
    heading: "Our sectors in pictures",
    lead: "A look across mining and mineral processing chemicals, construction, electronics and home appliances, and educational services.",
  },
  news: {
    title: "News",
    description:
      "News and updates from The British Family Limited, a diversified company in Dar es Salaam, Tanzania.",
    eyebrow: "News",
    heading: "News and updates",
    lead: "The latest from The British Family Limited across our four sectors.",
  },
  downloads: {
    title: "Downloads",
    description:
      "Download The British Family Limited's company profile, contact card, forms and other documents.",
    eyebrow: "Downloads",
    heading: "Documents and downloads",
    lead: "Our company profile, forms and other documents, ready to download whenever you need them.",
  },
  contact: {
    title: "Contact us",
    description:
      "Contact The British Family Limited in Dar es Salaam. Call, email or send an enquiry about mining chemicals, construction, electronics and appliances, or educational services.",
    eyebrow: "Contact",
    heading: "Talk to our team",
    lead: "Send us an enquiry about any of our sectors, or reach us directly by phone, email or WhatsApp.",
  },
};
