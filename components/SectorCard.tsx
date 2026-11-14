import Link from "next/link";
import { sectorHref, type Sector } from "@/lib/site";
import { Icon } from "./Icon";
import { SectorMedia } from "./SectorMedia";
import { IconChip } from "./ui";

/** Sector card from the approved design. The whole card is one link. */
export function SectorCard({
  sector,
  headingLevel = "h3",
  sizes = "(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw",
}: {
  sector: Sector;
  headingLevel?: "h2" | "h3";
  sizes?: string;
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card transition duration-300 ease-out focus-within:shadow-lift hover:shadow-lift motion-safe:hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <SectorMedia sector={sector} sizes={sizes} zoomOnHover />
      </div>
      <div className="relative flex flex-1 flex-col items-start gap-2.5 px-6 pb-7">
        <IconChip icon={sector.icon} className="-mt-7 shadow-card" />
        <Heading className="mt-1 text-xl leading-[1.2] font-bold text-navy">
          <Link
            href={sectorHref(sector)}
            prefetch
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {sector.shortName}
          </Link>
        </Heading>
        <p className="text-[0.9375rem] text-muted">{sector.summary}</p>
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-2 pt-2 text-[0.9375rem] font-bold text-navy"
        >
          Learn more
          <Icon
            name="arrow"
            size={18}
            strokeWidth={2.4}
            className="text-gold-deep transition-transform duration-200 motion-safe:group-hover:translate-x-1"
          />
        </span>
      </div>
      {/* Focus ring for the stretched link, drawn around the whole card */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg ring-navy ring-offset-2 group-has-[a:focus-visible]:ring-3"
      />
    </article>
  );
}
