import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "What is a PLOG? — freeflyingplog",
  description:
    "A short guide to the kneeboard pilot's log: what goes on a PLOG, how the bottom-flip trick works, and how to build and print your own A5 card for free.",
};

export default function GuidePage() {
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
          <h1 className="font-serif text-[32px] leading-tight">
            What is a PLOG, and how to build one
          </h1>
          <p className="text-ink-soft">
            A PLOG — pilot&apos;s log — is the one-page flight log a pilot
            clips to a kneeboard. Everything the flight needs at a glance, on
            one card: the route broken into legs, the headings to fly, the
            checks for each phase, the frequencies, the fuel sums.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">The anatomy of a good card</h2>
          <p>
            The front carries the flight log table — one row per leg, with
            track, wind, heading, distance, time and fuel — plus a phase
            checklist and, for instrument flying, a minima box. The heading
            column is shaded because it is <em>the</em> figure you fly; your
            eye should land on it first. The back carries the things you
            scribble or glance at: a route sketch, space to copy a clearance
            or ATIS, the fuel plan and a comms/nav frequency table.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">The bottom-flip trick</h2>
          <p>
            A kneeboard clips the card at the top, so you cannot turn it over
            like a page. Instead you flip the bottom edge up over the clip —
            which presents the back of the card upside down. The fix: print
            the back rotated 180°. Flipped over the clip, it reads upright.
          </p>
          <p>
            That is exactly what this builder does when “invert back page” is
            on (it is by default). Print the PDF double-sided,{" "}
            <strong>flip on long edge</strong>. If you print two separate
            sheets, or your printer only does short-edge duplex, switch the
            inversion off.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">Using the builder</h2>
          <p>
            Start from the IFR or VFR template, or a blank canvas. Every
            section is a card in the left panel: toggle it on or off, send it
            to the front or back page, drag to set the order, and open it to
            tune rows, columns and checklist content. The preview is the PDF —
            what you see is pixel-for-pixel what prints. When a page gets too
            full, a quiet warning chip appears rather than a clipped surprise.
          </p>
          <p>
            Your layout saves itself to your browser as you work — no account,
            no upload. “Share layout” copies a link that carries the whole
            design in the URL, so a club or instructor can pass a standard
            card around with one message.
          </p>

          <h2 className="pt-3 font-serif text-[22px]">Printing</h2>
          <p>
            The card is A5 portrait — half a sheet of A4. Print at 100% (no
            “fit to page”), double-sided, long-edge flip, and trim if your
            printer cannot take A5 directly. Card stock survives a flight bag
            noticeably better than 80&nbsp;gsm paper.
          </p>

          <p className="border-t border-hairline pt-5 text-ink-soft">
            Ready when you are:{" "}
            <Link href="/" className="underline underline-offset-2">
              build your PLOG
            </Link>
            . Free, no sign-up.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
