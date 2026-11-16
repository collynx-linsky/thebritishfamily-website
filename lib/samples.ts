/**
 * TEMPORARY SAMPLE PHOTOS. Replace before public launch.
 *
 * Free photos from Unsplash (Unsplash License: free for commercial use, no
 * attribution required), stored in public/images/samples/. They show other
 * people's sites and people, NOT The British Family Limited's own work, so
 * they must be replaced with real BFL photos before the site goes public.
 * The full list and replacement plan is in docs/TODO-for-BFL.md.
 *
 * Real photos always win: `sectorImage()` returns a sector's real photo from
 * lib/site.ts when there is one, and a sample only when there is not.
 * To remove the samples, delete this file and fix the imports TypeScript
 * reports.
 */
import type { ImageAsset, Sector } from "./site";

export type SamplePhoto = ImageAsset & {
  /** Sector this sample illustrates, or "company" for general use */
  topic: "mining-chemicals" | "construction" | "electronics-appliances" | "educational-services" | "company";
  credit: string;
  sample: true;
};

const sample = (
  file: string,
  width: number,
  height: number,
  topic: SamplePhoto["topic"],
  alt: string,
  credit: string,
): SamplePhoto => ({ src: `/images/samples/${file}.jpg`, width, height, topic, alt, credit, sample: true });

export const samples = {
  miningHaulTruck: sample("mining-haul-truck", 1600, 901, "mining-chemicals", "Haul truck carrying a load through an open-pit mine", "Prahlad Inala"),
  miningOpenPit: sample("mining-open-pit-aerial", 1600, 1067, "mining-chemicals", "Aerial view of a large open-pit mine", "Chenyue Huang"),
  miningTruckRoad: sample("mining-truck-road", 1600, 1067, "mining-chemicals", "Mining truck on a dirt road at an excavation site", "MiningWatch Portugal"),
  chemTestTube: sample("chem-test-tube", 1600, 2400, "mining-chemicals", "Gloved hand holding a test tube in a laboratory", "Akram Huseyn"),
  chemLabBench: sample("chem-lab-bench", 1600, 1067, "mining-chemicals", "Laboratory workbench with analytical equipment", "Trnava University"),
  constructionCrane: sample("construction-crane", 1600, 1067, "construction", "Tower cranes beside a building under construction", "Frames For Your Heart"),
  constructionFrame: sample("construction-frame", 1600, 2400, "construction", "Steel building frame beside a tower crane", "Jacek Dylag"),
  constructionWorker: sample("construction-worker", 1600, 2395, "construction", "Worker in a hat on a construction site", "Mugabi Owen"),
  constructionBricks: sample("construction-bricks", 1600, 1200, "construction", "Builders laying walls on a construction site", "E. Diop"),
  appliancesStore: sample("appliances-store", 1600, 900, "electronics-appliances", "Retail store interior with kitchen appliances on display", "Ulises Ramirez"),
  appliancesShop: sample("appliances-stoves-shop", 1600, 1067, "electronics-appliances", "Shop front displaying stoves and household appliances", "Adhitya Sibikumar"),
  educationTeacher: sample("education-teacher", 1600, 1068, "educational-services", "Teacher reading with students in a classroom", "Emmanuel Ikwuegbu"),
  educationClassroom: sample("education-classroom", 1600, 900, "educational-services", "Children learning in a classroom", "Antoine Demare"),
  educationBooks: sample("education-books", 1600, 1067, "educational-services", "Students holding their books", "Fatima Yusuf"),
  teamMeeting: sample("team-meeting", 1600, 1068, "company", "Team meeting around a conference table", "wocintechchat.com"),
  logisticsForklift: sample("logistics-forklift", 1600, 1067, "company", "Forklift loading goods into a delivery truck", "Elevate"),
  logisticsBoxes: sample("logistics-boxes", 1600, 1067, "company", "Goods being loaded for delivery", "Elevate"),
} satisfies Record<string, SamplePhoto>;

export const allSamples: SamplePhoto[] = Object.values(samples);

/** Banner backgrounds for the inner pages */
export const bannerImages = {
  about: samples.teamMeeting,
  sectors: samples.constructionCrane,
  leadership: samples.constructionWorker,
  contact: samples.constructionBricks,
  gallery: samples.miningOpenPit,
};

/** Extra photos shown for each sector (sector pages, sectors overview, gallery) */
export const sectorSamples: Record<string, SamplePhoto[]> = {
  "mining-chemicals": [samples.miningOpenPit, samples.chemLabBench, samples.miningTruckRoad, samples.chemTestTube, samples.miningHaulTruck],
  construction: [samples.constructionCrane, samples.constructionBricks, samples.constructionWorker, samples.constructionFrame],
  "electronics-appliances": [samples.appliancesStore, samples.appliancesShop],
  "educational-services": [samples.educationTeacher, samples.educationBooks, samples.educationClassroom],
};

/** The sector's real photo, or its first sample when it has none yet. */
export function sectorImage(sector: Sector): ImageAsset {
  return sector.image ?? sectorSamples[sector.slug]?.[0] ?? samples.teamMeeting;
}

/** Real photo first (if any), then samples: for mini galleries */
export function sectorPhotos(sector: Sector): ImageAsset[] {
  const extra = sectorSamples[sector.slug] ?? [];
  return sector.image ? [sector.image, ...extra] : extra;
}

export const isSample = (image: ImageAsset): image is SamplePhoto =>
  "sample" in image && (image as SamplePhoto).sample === true;
