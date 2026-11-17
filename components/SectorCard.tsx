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
  showcase = false,
}: {
  sector: Sector;
  headingLevel?: "h2" | "h3";
  sizes?: string;
  /**
   * Home page treatment: smooth lift, stronger photo zoom and a navy overlay
   * with the sector icon on hover.
   */
  showcase?: boolean;
}) {
  const Heading = headingLevel;

  const card = (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card ${showcase ? "" : "transition duration-300 ease-out focus-within:shadow-lift hover:shadow-lift motion-safe:hover:-translate-y-1"}`}
    >
      <div className="relative h-48 overflow-hidden">
        <SectorMedia
          sector={sector}
          sizes={sizes}
          zoomOnHover
          strongZoom={showcase}
        />
        {showcase ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-navy/75 opacity-0 transition-opacity duration-500 ease-premium group-focus-within:opacity-100 group-hover:opacity-100"
          >
            <span className="flex size-16 scale-90 items-center justify-center rounded-full bg-gold text-ink opacity-0 transition-[transform,opacity] delay-75 duration-500 ease-premium group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:opacity-100">
              <Icon name={sector.icon} size={30} />
            </span>
          </div>
        ) : null}
      </div>
      {/* Not positioned, so the title link's overlay stretches over the whole card, photo included */}
      <div className="flex flex-1 flex-col items-start gap-2.5 px-6 pb-7">
        <IconChip icon={sector.icon} className="relative -mt-7 shadow-card" />
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
            className={`text-gold-deep transition-transform motion-safe:group-hover:translate-x-1 ${showcase ? "duration-500 ease-premium" : "duration-200"}`}
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

  // The lift shadow lives on a wrapper: the card clips its own overflow.
  return showcase ? <div className="lift h-full rounded-lg">{card}</div> : card;
}
