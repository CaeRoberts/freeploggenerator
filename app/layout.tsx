import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { ConsentBanner } from "@/components/ConsentBanner";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz"],
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "freeflyingplog — kneeboard PLOG builder",
  description:
    "Design a custom kneeboard PLOG and download it as a print-ready A5 PDF. Free, no sign-up, runs entirely in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
