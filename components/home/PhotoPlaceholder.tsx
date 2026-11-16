import type { IconName } from "@/lib/site";
import { Icon } from "../Icon";

/**
 * Branded tile shown where a real photo is still needed.
 * Fills its (relatively positioned, sized) parent. The label is real text,
 * so it is read out instead of a missing image.
 */
export function PhotoPlaceholder({
  icon,
  label,
  title,
  size = "md",
}: {
  icon: IconName;
  label: string;
  title?: string;
  size?: "sm" | "md";
}) {
  const small = size === "sm";
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_120%_at_85%_10%,var(--color-navy-soft)_0%,var(--color-navy)_55%,var(--color-navy-deep)_100%)] text-white">
      <span
        aria-hidden="true"
        className="absolute right-[-38%] bottom-[-62%] aspect-square w-[80%] rounded-full border-20 border-gold/90"
      />
      <span
        aria-hidden="true"
        className="absolute -top-[25%] -left-[15%] aspect-square w-[60%] rounded-full border border-white/10"
      />
      <div
        className={`relative flex h-full flex-col items-center justify-center text-center ${small ? "gap-0 p-2" : "gap-3 p-6"}`}
      >
        <span
          aria-hidden="true"
          className={`flex items-center justify-center rounded-full bg-navy-deep text-gold ring-1 ring-gold/40 ${small ? "size-10" : "size-16"}`}
        >
          <Icon name={icon} size={small ? 20 : 30} strokeWidth={1.6} />
        </span>
        {small ? (
          <span className="sr-only">{label}</span>
        ) : (
          <>
            {title ? <span className="font-display text-lg font-bold">{title}</span> : null}
            <span className="eyebrow rounded-sm bg-navy-deep px-3 py-1 text-gold ring-1 ring-gold/30">
              {label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
