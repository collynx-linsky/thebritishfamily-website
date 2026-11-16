/**
 * Image lists for the home slideshow, the home gallery strip and the
 * Gallery page. Real BFL photos come from lib/site.ts; temporary sample
 * photos come from lib/samples.ts (to be replaced before launch).
 * Photos are labelled only with the sector they illustrate: no captions,
 * project names or facts are invented.
 */
import { allSamples, samples, sectorImage, type SamplePhoto } from "./samples";
import { getSector, sectors, type ImageAsset, type Sector } from "./site";

const sector = (slug: string): Sector => {
  const found = getSector(slug);
  if (!found) throw new Error(`Unknown sector: ${slug}`);
  return found;
};

const mining = sector("mining-chemicals");
const construction = sector("construction");
const electronics = sector("electronics-appliances");
const education = sector("educational-services");

/** Hero slideshow, shown under the navy overlay. */
export const heroSlides: ImageAsset[] = [
  { src: "/images/skyline.jpg", width: 736, height: 1288, alt: "City skyline at sunset" },
  mining.image!,
  samples.constructionCrane,
  electronics.image!,
  samples.educationTeacher,
];

export type GalleryPhoto = { image: ImageAsset; sector: Sector | null };

/** "Our work in pictures" carousel on the home page */
export const homeGallery: GalleryPhoto[] = [
  { image: mining.image!, sector: mining },
  { image: sectorImage(education), sector: education },
  { image: construction.image!, sector: construction },
  { image: samples.chemLabBench, sector: mining },
  { image: electronics.image!, sector: electronics },
  { image: samples.constructionBricks, sector: construction },
  { image: samples.appliancesStore, sector: electronics },
];

const realPhotos: GalleryPhoto[] = sectors
  .filter((s) => s.image)
  .map((s) => ({ image: s.image!, sector: s }));

const topicSector = (photo: SamplePhoto): Sector | null =>
  photo.topic === "company" ? null : sector(photo.topic);

/** Every photo for the Gallery page: real ones first, then samples */
export const galleryPhotos: GalleryPhoto[] = [
  ...realPhotos,
  ...allSamples.map((photo) => ({ image: photo, sector: topicSector(photo) })),
];
