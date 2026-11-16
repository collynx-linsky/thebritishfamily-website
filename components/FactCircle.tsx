import type { Fact } from "@/lib/site";
import { CountUp } from "./home/CountUp";
import { Icon } from "./Icon";

/** Round fact counter from the approved design. Numbers count up on scroll. */
export function FactCircle({ fact }: { fact: Fact }) {
  const numeric = /^\d+$/.test(fact.value) ? Number(fact.value) : null;
  return (
    <li className="flex aspect-square w-full max-w-[190px] flex-col items-center justify-center gap-1.5 rounded-full border-2 border-line bg-white p-4 text-center shadow-card transition-[border-color] duration-500 hover:border-gold">
      {fact.icon ? (
        <Icon name={fact.icon} size={40} className="text-gold-deep" />
      ) : (
        <span className="font-display text-[2.5rem] leading-none font-extrabold text-gold-deep sm:text-[2.875rem]">
          {numeric !== null ? <CountUp value={numeric} /> : fact.value}
        </span>
      )}
      <span className="max-w-[8.5rem] text-sm leading-[1.3] font-semibold text-navy">
        {fact.label}
      </span>
    </li>
  );
}
