import Image from "next/image";
import { sectorImage } from "@/lib/samples";
import type { Sector } from "@/lib/site";

/**
 * A sector's photo: the real one from lib/site.ts, or a temporary sample
 * (lib/samples.ts) while the real photo is still missing.
 * Always fills its (relatively positioned, sized) parent.
 */
export function SectorMedia({
  sector,
  sizes,
  preload = false,
  zoomOnHover = false,
  strongZoom = false,
}: {
  sector: Sector;
  sizes: string;
  preload?: boolean;
  zoomOnHover?: boolean;
  /** Slower, deeper zoom (showcase cards) */
  strongZoom?: boolean;
}) {
  const zoom = !zoomOnHover
    ? ""
    : strongZoom
      ? "transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.08]"
      : "transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]";
  const image = sectorImage(sector);

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      className={`object-cover ${zoom}`}
    />
  );
}
