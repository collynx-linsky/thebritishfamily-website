/**
 * Image lists for the home page slideshow, sector strip and gallery.
 *
 * Every photo and alt text comes from lib/site.ts (or the image list in
 * docs/content.md). No captions, project names or facts are added here:
 * photos are labelled only with the sector they illustrate.
 *
 * Placeholders mark where a real photo is still needed. Each one is listed
 * in docs/TODO-for-BFL.md; replace it by changing `kind` to "photo".
 */
import { getSector, type ImageAsset, type Sector } from "./site";

const sector = (slug: string): Sector => {
  const found = getSector(slug);
  if (!found) throw new Error(`Unknown sector: ${slug}`);
  return found;
};

const mining = sector("mining-chemicals");
const construction = sector("construction");
const electronics = sector("electronics-appliances");
const education = sector("educational-services");

export const placeholderLabels = {
  project: "Project photo coming soon",
  sector: "Photo coming soon",
};

/** Hero slideshow: real photos only, shown under the navy overlay. */
export const heroSlides: ImageAsset[] = [
  {
    src: "/images/skyline.jpg",
    width: 736,
    height: 1288,
    alt: "City skyline at sunset",
  },
  mining.image!,
  construction.image!,
  electronics.image!,
];

export type GalleryItem =
  | { kind: "photo"; sector: Sector; image: ImageAsset }
  | { kind: "placeholder"; sector: Sector; label: string };

/** "Our work in pictures": three real photos, three marked placeholders. */
export const galleryItems: GalleryItem[] = [
  { kind: "photo", sector: mining, image: mining.image! },
  { kind: "placeholder", sector: education, label: placeholderLabels.sector },
  { kind: "photo", sector: construction, image: construction.image! },
  { kind: "placeholder", sector: mining, label: placeholderLabels.project },
  { kind: "photo", sector: electronics, image: electronics.image! },
  { kind: "placeholder", sector: construction, label: placeholderLabels.project },
];
