import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { company } from "@/lib/site";
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
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
