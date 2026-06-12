import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy — freeflyingplog",
  description:
    "freeflyingplog runs entirely in your browser: no accounts, no databases, no tracking without consent.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header
        actions={
          <Link
            href="/"
            className="bg-navy px-3.5 py-1.5 text-[12px] tracking-wide text-paper hover:bg-navy-deep"
          >
            Open the builder
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-[640px] px-5 py-12">
        <article className="space-y-5 text-[15px] leading-relaxed text-ink">
          <h1 className="font-serif text-[32px] leading-tight">Privacy</h1>
          <p className="text-ink-soft">
            The short version: this site runs entirely in your browser. There
            is no account, no database, and your PLOG designs never leave your
            device unless you choose to share them.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">What stays on your device</h2>
          <p>
            Your layout is saved to your browser&apos;s local storage so it is
            still there when you come back. Your cookie choice is recorded the
            same way. Clearing your browser data removes both. PDFs are
            generated locally — nothing is uploaded.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">Share links</h2>
          <p>
            “Share layout” encodes your design into the link itself (the part
            after <span className="font-mono text-[13px]">#</span>). Fragments
            are not sent to any server by your browser; the design travels
            only to whoever you give the link.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">Advertising</h2>
          <p>
            The site may show Google AdSense adverts to cover its costs. Ad
            scripts load <strong>only after you consent</strong> via the
            cookie banner; if you decline, no advertising scripts load and no
            advertising cookies are set. When enabled, Google&apos;s use of
            cookies is described in{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="underline underline-offset-2"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google&apos;s advertising policy
            </a>
            . You can change your mind at any time by clearing this site&apos;s
            data in your browser, which resets the banner.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">Analytics</h2>
          <p>None. No analytics, no fingerprinting, no pixels.</p>

          <h2 className="pt-3 font-serif text-[22px]">Contact</h2>
          <p>
            Questions? Open an issue on the project repository or contact the
            site operator.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
