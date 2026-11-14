import Image from "next/image";
import type { Leader } from "@/lib/site";
import { EmailText } from "./EmailText";
import { Icon } from "./Icon";

/**
 * Director card. `compact` shows the short summary (home page);
 * `full` shows the complete bio and email (leadership page).
 * Portraits are small originals, so they are never shown wider than 220px.
 */
export function LeaderCard({
  leader,
  variant = "compact",
  headingLevel = "h3",
}: {
  leader: Leader;
  variant?: "compact" | "full";
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const full = variant === "full";

  return (
    <article
      className={`flex h-full flex-col gap-6 rounded-lg border border-line bg-white p-6 transition duration-300 hover:shadow-card sm:flex-row sm:items-start ${full ? "md:p-8 lg:gap-8" : "sm:items-center"}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-md bg-navy ${full ? "aspect-[4/5] w-full max-w-[220px]" : "aspect-[9/11] w-full max-w-[180px]"}`}
      >
        <Image
          src={leader.photo.src}
          alt={leader.photo.alt}
          fill
          sizes={full ? "220px" : "180px"}
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Heading className="text-[1.375rem] leading-[1.2] font-bold text-navy">{leader.name}</Heading>
        <p className="eyebrow text-amber-ink">{leader.role}</p>
        <p className={`text-muted ${full ? "mt-2 text-base" : "text-[0.9375rem]"}`}>
          {full ? leader.bio : leader.summary}
        </p>
        {full ? (
          <a
            href={`mailto:${leader.email}`}
            className="mt-3 inline-flex min-h-11 w-fit items-center gap-2 font-semibold text-navy underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-gold"
          >
            <Icon name="mail" size={18} strokeWidth={2} className="shrink-0 text-gold-deep" />
            <span className="sr-only">Email {leader.name}: </span>
            <span>
              <EmailText email={leader.email} />
            </span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
