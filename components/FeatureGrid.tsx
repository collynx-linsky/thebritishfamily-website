import type { IconName } from "@/lib/site";
import { Icon } from "./Icon";
import { CheckDot } from "./ui";

export type Feature = { title: string; description: string; icon: IconName };

/** Grid of icon cards: used for "How we work" and the company values. */
export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.title}
          className="reveal group flex flex-col gap-3 rounded-lg border border-line bg-white p-7 transition duration-300 hover:border-gold hover:shadow-card"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-mist text-navy transition-colors duration-300 group-hover:bg-gold group-hover:text-ink">
            <Icon name={item.icon} size={24} />
          </span>
          <h3 className="mt-1 text-lg leading-tight font-bold text-navy">{item.title}</h3>
          <p className="text-[0.9375rem] text-muted">{item.description}</p>
        </li>
      ))}
    </ul>
  );
}

/** Checklist of short statements with gold ticks. */
export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3 sm:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 font-semibold text-navy">
          <CheckDot className="mt-0.5" />
          {item}
        </li>
      ))}
    </ul>
  );
}
