import Image from "next/image";
import type { Sector } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * A sector's photo, or a branded navy panel when no photo exists yet.
 * Always fills its (relatively positioned, sized) parent.
 */
export function SectorMedia({
  sector,
  sizes,
  preload = false,
  zoomOnHover = false,
}: {
  sector: Sector;
  sizes: string;
  preload?: boolean;
  zoomOnHover?: boolean;
}) {
  const zoom = zoomOnHover
    ? "transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
    : "";

  if (sector.image) {
    return (
      <Image
        src={sector.image.src}
        alt={sector.image.alt}
        fill
        sizes={sizes}
        preload={preload}
        className={`object-cover ${zoom}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden bg-[radial-gradient(120%_120%_at_85%_10%,var(--color-navy-soft)_0%,var(--color-navy)_55%,var(--color-navy-deep)_100%)] ${zoom}`}
    >
      {/* Concentric arcs echo the circle in the BFL logo */}
      <span className="absolute -right-[28%] -bottom-[70%] aspect-square w-[80%] rounded-full border-[26px] border-gold" />
      <span className="absolute -right-[10%] -bottom-[38%] aspect-square w-[46%] rounded-full border-2 border-white/15" />
      <span className="absolute -top-[30%] -left-[12%] aspect-square w-[55%] rounded-full border border-white/10" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex aspect-square h-[46%] min-h-16 items-center justify-center rounded-full bg-navy-deep text-gold shadow-lift ring-1 ring-gold/40">
          <Icon name={sector.icon} size={44} strokeWidth={1.5} className="size-1/2" />
        </span>
      </span>
    </div>
  );
}
