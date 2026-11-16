import Image from "next/image";
import Link from "next/link";
import { getCompany } from "@/lib/content/site-content";
import { company as defaults } from "@/lib/site";

/** Logo mark (in code) with the two-line wordmark (editable company name). */
export async function Logo({ onDark = false, size = "md" }: { onDark?: boolean; size?: "md" | "sm" }) {
  const company = await getCompany();
  const mark = size === "md" ? { w: 68, h: 56 } : { w: 60, h: 50 };
  return (
    <Link
      href="/"
      className="group inline-flex min-h-11 shrink-0 items-center gap-3 rounded-sm"
      aria-label={`${company.name}, home`}
    >
      <Image
        src={defaults.logo.src}
        width={mark.w}
        height={mark.h}
        alt=""
        loading="eager"
        className="object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
        style={{ width: mark.w, height: mark.h }}
      />
      <span
        className={`font-display text-[1.125rem] leading-[1.1] font-extrabold sm:text-[1.1875rem] ${onDark ? "text-white" : "text-navy"}`}
      >
        {company.wordmark[0]}
        <br />
        {company.wordmark[1]}
      </span>
    </Link>
  );
}
