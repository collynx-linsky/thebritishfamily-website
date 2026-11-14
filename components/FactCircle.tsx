import type { Fact } from "@/lib/site";
import { Icon } from "./Icon";

/** Round fact counter from the approved design. */
export function FactCircle({ fact }: { fact: Fact }) {
  return (
    <li className="flex aspect-square w-full max-w-[190px] flex-col items-center justify-center gap-1.5 rounded-full border-2 border-line bg-white p-4 text-center shadow-card transition duration-300 hover:border-gold">
      {fact.icon ? (
        <Icon name={fact.icon} size={40} className="text-gold-deep" />
      ) : (
        <span className="font-display text-[2.5rem] leading-none font-extrabold text-gold-deep sm:text-[2.875rem]">
          {fact.value}
        </span>
      )}
      <span className="max-w-[8.5rem] text-sm leading-[1.3] font-semibold text-navy">
        {fact.label}
      </span>
    </li>
  );
}
