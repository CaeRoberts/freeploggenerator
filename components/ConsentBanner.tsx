"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@/lib/consent";
import { ADS_ENABLED } from "@/lib/ads";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

/**
 * UK/EU cookie consent. Shown only when ads are enabled and no choice has
 * been recorded. The AdSense script is injected only after consent — with
 * no consent (or ads disabled) no ad scripts ever load.
 */
export function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const status = useConsent((s) => s.status);
  const setStatus = useConsent((s) => s.setStatus);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ADS_ENABLED || status !== "granted" || !ADSENSE_CLIENT) return;
    if (document.querySelector("script[data-adsense]")) return;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.adsense = "true";
    document.head.appendChild(script);
  }, [status]);

  if (!mounted || !ADS_ENABLED || status !== "unknown") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="max-w-xl text-[12px] leading-relaxed text-ink-soft">
          This site is funded by ads. With your consent, Google AdSense sets
          cookies to show them; decline and no ad scripts load at all. Your
          PLOG layouts stay in your browser either way.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("denied")}
            className="border border-hairline px-3 py-1.5 text-[12px] text-ink-soft hover:border-ink hover:text-ink"
          >
            Decline
          </button>
          <button
            onClick={() => setStatus("granted")}
            className="bg-navy px-3 py-1.5 text-[12px] text-paper hover:bg-navy-deep"
          >
            Allow ads
          </button>
        </div>
      </div>
    </div>
  );
}
