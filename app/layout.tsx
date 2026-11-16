import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { getCompany, getPages } from "@/lib/content/site-content";
import { siteUrl } from "@/lib/seo";
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
 * Root layout: document, fonts and site-wide metadata only.
 * The public chrome (and the "every public page is static" rule) lives in
 * app/(site)/layout.tsx; the admin area has its own layout in app/(admin).
 */
export async function generateMetadata(): Promise<Metadata> {
  const [company, pages] = await Promise.all([getCompany(), getPages()]);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: pages.home.title,
      template: `%s | ${company.name}`,
    },
    description: pages.home.description,
    applicationName: company.name,
    openGraph: {
      siteName: company.name,
      locale: "en_GB",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#1E3A6E",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next.js disables the CSS smooth scrolling during route transitions
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${inter.variable}`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
