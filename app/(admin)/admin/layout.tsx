import type { Metadata } from "next";

/**
 * Admin area root. Kept out of search engines here, in robots.txt and by the
 * X-Robots-Tag header set in proxy.ts. Authentication is enforced in the
 * (panel) layout and inside every page and server action.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · BFL Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-paper text-ink">{children}</div>;
}
