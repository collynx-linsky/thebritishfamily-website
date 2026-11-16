import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { TopBar } from "./TopBar";

/** Skip link, top bar, header and footer around public page content. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-100 -translate-y-24 rounded-sm bg-gold px-5 py-3 font-bold text-ink shadow-lift transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <TopBar />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
