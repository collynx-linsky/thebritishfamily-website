import { SiteChrome } from "@/components/SiteChrome";

/**
 * Every public route must be fully prerendered at build time. If a future
 * change introduces request-time rendering anywhere in the public site,
 * `next build` fails. (The admin area is outside this group.)
 */
export const ensureStatic = "navigation";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}
