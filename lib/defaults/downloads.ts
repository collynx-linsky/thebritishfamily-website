/**
 * Default downloads (used until the admin panel manages documents).
 * Only real documents are listed. Forms and brochures will be added by the
 * administrator once BFL supplies them (see docs/TODO-for-BFL.md).
 */
import type { DownloadItem } from "../content/types";
import { contactCardBytes } from "../vcard";

export const defaultDownloads: DownloadItem[] = [
  {
    id: "company-profile",
    title: "Company profile",
    description:
      "An overview of The British Family Limited: our introduction, mission and vision, philosophy, leadership, how we work and contact details.",
    category: "company",
    file: {
      url: "/downloads/bfl-company-profile.pdf",
      fileName: "BFL-Company-Profile.pdf",
      format: "PDF",
      sizeBytes: 1395898,
      pages: 8,
    },
    publishedAt: "2026-11-16",
    featured: true,
  },
  {
    id: "contact-card",
    title: "Contact card",
    description:
      "Save our phone numbers, email address and office address straight to your phone or email contacts.",
    category: "company",
    file: {
      url: "/downloads/bfl-contact-card.vcf",
      fileName: "The-British-Family-Limited.vcf",
      format: "vCard",
      sizeBytes: contactCardBytes(),
    },
    publishedAt: "2026-11-16",
  },
];
