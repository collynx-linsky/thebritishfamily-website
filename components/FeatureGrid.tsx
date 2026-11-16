import type { IconName } from "@/lib/site";
import { Icon } from "./Icon";
import { CheckDot } from "./ui";

export type Feature = { title: string; description: string; icon: IconName };

/**
 * Grid of icon cards: used for "How we work" and the company values.
 * Cards appear one after another on scroll and lift on hover; the icon chip
 * turns gold and the gold rule underneath draws in.
 */
export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <ul data-reveal="stagger" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <li key={item.title}>
          <div className="group lift flex h-full flex-col gap-3 rounded-lg border border-line bg-white p-7 transition-colors duration-500 hover:border-gold">
            <div className="flex items-center justify-between">
              <span className="inline-flex size-12 items-center justify-center rounded-lg bg-mist text-navy transition-colors duration-500 group-hover:bg-gold group-hover:text-ink">
                <Icon
                  name={item.icon}
                  size={24}
                  className="transition-transform duration-500 ease-premium motion-safe:group-hover:scale-110"
                />
              </span>
              <span aria-hidden="true" className="font-display text-sm font-bold text-line">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-1 text-lg leading-tight font-bold text-navy">{item.title}</h3>
            <p className="text-[0.9375rem] text-muted">{item.description}</p>
            <span
              aria-hidden="true"
              className="mt-auto block h-0.5 w-12 origin-left scale-x-50 rounded-full bg-gold transition-transform duration-500 ease-premium group-hover:scale-x-100"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Checklist of short statements with gold ticks; items appear one by one. */
export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul data-reveal="stagger" className={`grid gap-x-8 gap-y-3 sm:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 font-semibold text-navy">
          <CheckDot className="mt-0.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}
