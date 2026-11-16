import Link from "next/link";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/site";

/* ------------------------------------------------------------------
   Layout primitives: one container width and one spacing scale.
   ------------------------------------------------------------------ */

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-site px-5 sm:px-6 ${className}`}>{children}</div>;
}

type Tone = "white" | "mist" | "navy";

const toneClasses: Record<Tone, string> = {
  white: "bg-white",
  mist: "bg-mist",
  navy: "on-dark bg-navy text-white",
};

/** Standard page section. `size` follows the site spacing scale. */
export function Section({
  children,
  tone = "white",
  size = "default",
  className = "",
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  tone?: Tone;
  size?: "default" | "compact";
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  const spacing = size === "compact" ? "py-16 md:py-20" : "py-20 md:py-24 lg:py-28";
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${toneClasses[tone]} ${spacing} ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

/* ------------------------------------------------------------------
   Headings
   ------------------------------------------------------------------ */

export function Eyebrow({
  children,
  onDark = false,
  className = "",
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p className={`eyebrow ${onDark ? "text-gold" : "text-amber-ink"} ${className}`}>{children}</p>
  );
}

/**
 * Eyebrow + h2 pair used at the top of sections.
 * `accent` is appended to the title in the darker gold tone.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  accent,
  intro,
  align = "left",
  onDark = false,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
  align?: "left" | "center";
  onDark?: boolean;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-3 ${centered ? "mx-auto max-w-2xl items-center text-center" : "max-w-2xl"} ${className}`}
    >
      <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className={`text-section font-extrabold ${onDark ? "text-white" : "text-navy"}`}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span className={onDark ? "text-gold" : "text-gold-deep"}>{accent}</span>
          </>
        ) : null}
      </h2>
      {intro ? (
        <p className={`mt-1 text-lg ${onDark ? "text-on-navy" : "text-muted"}`}>{intro}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------
   Buttons and links
   ------------------------------------------------------------------ */

export type ButtonVariant = "gold" | "navy" | "outline" | "outline-light" | "white";

const variantClasses: Record<ButtonVariant, string> = {
  gold: "bg-gold text-ink hover:bg-gold-bright hover:shadow-lift",
  navy: "bg-navy text-white hover:bg-navy-deep hover:shadow-lift",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
  "outline-light": "border-2 border-white/70 text-white hover:border-white hover:bg-white hover:text-navy",
  white: "bg-white text-navy hover:bg-mist hover:shadow-lift",
};

export const buttonClasses = (variant: ButtonVariant = "gold", className = "") =>
  `inline-flex min-h-12 items-center justify-center gap-2.5 rounded-sm px-7 py-3 text-[0.9375rem] font-bold leading-tight transition duration-200 ease-out motion-safe:hover:-translate-y-0.5 ${variantClasses[variant]} ${className}`;

/**
 * Premium variant (home page): a fill slides in on hover, a soft shine sweeps
 * across, and the trailing arrow moves. Uses .btn-fx from globals.css.
 */
const fxVariantClasses: Record<ButtonVariant, string> = {
  gold: "bg-gold text-ink [--btn-fill:var(--color-gold-bright)]",
  navy: "bg-navy text-white hover:text-ink focus-visible:text-ink [--btn-fill:var(--color-gold)]",
  outline:
    "border-2 border-ink text-ink hover:text-white focus-visible:text-white [--btn-fill:var(--color-ink)]",
  "outline-light":
    "border-2 border-white/70 text-white hover:border-white hover:text-navy focus-visible:text-navy [--btn-fill:white]",
  white: "bg-white text-navy hover:text-ink focus-visible:text-ink [--btn-fill:var(--color-gold)]",
};

const fxButtonClasses = (variant: ButtonVariant, className: string) =>
  `btn-fx inline-flex min-h-12 items-center justify-center gap-2.5 rounded-sm px-7 py-3 text-[0.9375rem] font-bold leading-tight ${fxVariantClasses[variant]} ${className}`;

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  icon?: IconName;
  className?: string;
  external?: boolean;
  /** Premium hover effect with a trailing arrow (used on the home page) */
  fx?: boolean;
};

/** Link styled as a button. Internal hrefs use next/link. */
export function ButtonLink({
  href,
  children,
  variant = "gold",
  icon,
  className = "",
  external = false,
  fx = false,
}: ButtonLinkProps) {
  const content = (
    <>
      {icon ? <Icon name={icon} size={18} strokeWidth={2.2} /> : null}
      {children}
      {fx && !icon ? (
        <Icon name="arrow" size={18} strokeWidth={2.4} className="btn-fx-arrow" />
      ) : null}
    </>
  );
  const classes = fx ? fxButtonClasses(variant, className) : buttonClasses(variant, className);
  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

/** Text link with a trailing arrow that nudges on hover. */
export function ArrowLink({
  href,
  children,
  tone = "navy",
  className = "",
  prefetch,
  fx = false,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "navy" | "white" | "gold";
  className?: string;
  /** true resolves URL-specific content at prefetch time (Partial Prefetching) */
  prefetch?: boolean;
  /** Animated underline that draws in from the left (used on the home page) */
  fx?: boolean;
}) {
  const toneClass = {
    navy: "text-navy hover:text-navy-deep",
    white: "text-white hover:text-gold",
    gold: "text-gold hover:text-white",
  }[tone];
  const arrowClass = tone === "navy" ? "text-gold-deep" : "text-gold";
  const labelClass = fx
    ? "relative after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-right after:scale-x-0 after:rounded-full after:bg-current after:transition-transform after:duration-500 after:ease-premium group-hover:after:origin-left group-hover:after:scale-x-100 group-focus-visible:after:origin-left group-focus-visible:after:scale-x-100"
    : "underline decoration-transparent decoration-2 underline-offset-4 transition-colors group-hover:decoration-current";
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`group inline-flex min-h-11 items-center gap-2 font-bold transition-colors ${toneClass} ${className}`}
    >
      <span className={labelClass}>{children}</span>
      <Icon
        name="arrow"
        size={18}
        strokeWidth={2.4}
        className={`${tone === "gold" ? "" : arrowClass} transition-transform ${fx ? "duration-500 ease-premium motion-safe:group-hover:translate-x-1.5" : "duration-200 motion-safe:group-hover:translate-x-1"}`}
      />
    </Link>
  );
}

/** Round gold tick used in value lists. */
export function CheckDot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex size-5.5 shrink-0 items-center justify-center rounded-full bg-gold text-ink ${className}`}
    >
      <Icon name="check" size={12} strokeWidth={3.5} />
    </span>
  );
}

/** Square gold icon chip used on sector and approach cards. */
export function IconChip({
  icon,
  size = "md",
  className = "",
}: {
  icon: IconName;
  size?: "md" | "lg";
  className?: string;
}) {
  const box = size === "lg" ? "size-16" : "size-14";
  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-lg bg-gold text-ink ${className}`}
    >
      <Icon name={icon} size={size === "lg" ? 32 : 28} />
    </span>
  );
}
