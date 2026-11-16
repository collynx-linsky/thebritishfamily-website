import type { IconName } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Share an article. Plain links (no third-party scripts, nothing tracked),
 * each opening the service's own share page.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links: { label: string; href: string; icon: IconName | "linkedin" | "facebook" }[] = [
    { label: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: "whatsapp" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "linkedin" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "facebook" },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}`, icon: "mail" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-semibold text-navy">Share this article</p>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={`Share on ${link.label}`}
              className="inline-flex size-11 items-center justify-center rounded-full border-2 border-line text-navy transition-[transform,border-color,background-color,color] duration-500 ease-premium hover:border-navy hover:bg-navy hover:text-white motion-safe:hover:-translate-y-0.5"
            >
              {link.icon === "linkedin" ? (
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
                </svg>
              ) : link.icon === "facebook" ? (
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21z" />
                </svg>
              ) : (
                <Icon name={link.icon} size={18} strokeWidth={2} />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
