/**
 * The focal point chosen in the media library decides how a photo is
 * cropped wherever it fills a fixed shape (cards, banners, the slideshow).
 * Components pass this to next/image as `style`.
 */
export type Focal = { x: number; y: number };

export function focalStyle(image: { focal?: Focal } | null | undefined): { objectPosition: string } | undefined {
  const f = image?.focal;
  if (!f || (f.x === 50 && f.y === 50)) return undefined;
  return { objectPosition: `${f.x}% ${f.y}%` };
}
