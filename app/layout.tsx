import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ConsentBanner } from "@/components/ConsentBanner";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz"],
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const SITE_URL = "https://www.freeploggenerator.com";
const TITLE = "freeploggenerator — free kneeboard PLOG builder & A5 PDF maker";
const DESCRIPTION =
  "Build a custom kneeboard PLOG (pilot's log) and download it as a print-ready A5 PDF. Editable flight log, checklists, fuel plan and frequencies. Free, no sign-up, runs in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — freeploggenerator",
  },
  description: DESCRIPTION,
  applicationName: "freeploggenerator",
  keywords: [
    "PLOG",
    "pilot's log",
    "kneeboard",
    "flight log",
    "nav log",
    "VFR",
    "IFR",
    "A5 PDF",
    "flight planning",
    "free",
  ],
  authors: [{ name: "freeploggenerator" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "freeploggenerator",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "freeploggenerator — kneeboard PLOG builder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "freeploggenerator",
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body
        className={`${serif.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        {children}
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
