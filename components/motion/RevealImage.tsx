import Image from "next/image";
import type { ImageAsset } from "@/lib/site";

/**
 * Photo in a rounded frame that is revealed by a navy wipe as it scrolls
 * into view, with optional gentle parallax and hover zoom. The frame's size
 * comes from `className` (for example "aspect-4/3" or "h-80").
 */
export function RevealImage({
  image,
  sizes,
  className = "",
  parallax = false,
  zoom = false,
  delayMs = 0,
  preload = false,
  decorative = false,
  fill = false,
}: {
  image: ImageAsset;
  sizes: string;
  className?: string;
  parallax?: boolean;
  zoom?: boolean;
  delayMs?: number;
  preload?: boolean;
  /** Empty alt text when the photo only illustrates nearby text */
  decorative?: boolean;
  /** Fill a positioned parent (which supplies the frame) instead of being a card */
  fill?: boolean;
}) {
  const frame = fill
    ? "absolute inset-0"
    : "group relative overflow-hidden rounded-lg bg-navy shadow-card";
  return (
    <div
      data-reveal="wipe"
      style={delayMs ? ({ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties) : undefined}
      className={`${frame} ${className}`}
    >
      <div className={`absolute inset-0 ${parallax ? "parallax" : ""}`}>
        <Image
          src={image.src}
          alt={decorative ? "" : image.alt}
          fill
          sizes={sizes}
          preload={preload}
          className={`object-cover ${zoom ? "transition-transform duration-700 ease-premium motion-safe:group-hover:scale-[1.06]" : ""}`}
        />
      </div>
    </div>
  );
}
