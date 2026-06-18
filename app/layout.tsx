import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
