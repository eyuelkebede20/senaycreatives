import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { site, SITE_URL } from "@/lib/site";

// Display face — characterful, variable. Carries the brand.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

// Body face — quiet, precise.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SenayCreatives — Digital agency in Addis Ababa",
    template: "%s · SenayCreatives",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "digital agency",
    "Addis Ababa",
    "Ethiopia",
    "web development",
    "app development",
    "digital marketing",
    "landing page",
    "automation",
    "AI integration",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "SenayCreatives — Digital agency in Addis Ababa",
    description: site.description,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SenayCreatives — Digital agency in Addis Ababa",
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <SiteHeader />
        <div id="main-content" className="flex flex-1 flex-col">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
