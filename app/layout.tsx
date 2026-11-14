import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { company } from "@/lib/site";
import { siteUrl } from "@/lib/seo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopBar } from "@/components/TopBar";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Every route must be fully prerendered at build time. If a future change
 * introduces request-time rendering anywhere, `next build` fails.
 */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} | Mining chemicals, construction, electronics and education`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  applicationName: company.name,
  openGraph: {
    siteName: company.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#1E3A6E",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
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
      </body>
    </html>
  );
}
