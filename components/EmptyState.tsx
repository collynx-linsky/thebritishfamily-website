import type { IconName } from "@/lib/site";
import { Icon } from "./Icon";
import { ArrowLink } from "./ui";

/**
 * Designed "nothing here yet" panel for admin-managed lists (news, forms),
 * so an empty category still looks intentional.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-line bg-white px-6 py-7 text-center sm:flex-row sm:text-left">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mist text-navy">
        <Icon name={icon} size={24} />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-display text-lg font-bold text-navy">{title}</p>
        <p className="text-[0.9375rem] text-muted">{body}</p>
      </div>
      {action ? (
        <ArrowLink href={action.href} fx className="shrink-0">
          {action.label}
        </ArrowLink>
      ) : null}
    </div>
  );
}
