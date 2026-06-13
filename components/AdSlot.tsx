"use client";

import { useEffect, useRef } from "react";
import { useConsent } from "@/lib/consent";
import { ADS_ENABLED } from "@/lib/ads";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

const SLOT_IDS: Record<string, string> = {
  panel: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PANEL ?? "",
  modal: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MODAL ?? "",
};

/**
 * One of exactly two ad placements. When ads are disabled it renders
 * nothing at all (no placeholder, no reserved space). When enabled it
 * reserves its height to avoid layout shift and shows a quiet placeholder
 * until a real ad loads (consent granted + client configured).
 */
export function AdSlot({
  placement,
  height,
}: {
  placement: "panel" | "modal";
  height: number;
}) {
  const consent = useConsent((s) => s.status);
  const live = ADS_ENABLED && consent === "granted" && ADSENSE_CLIENT !== "";
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blocked or script missing — the reserved space stays quiet
    }
  }, [live]);

  // Disabled => occupy no space whatsoever.
  if (!ADS_ENABLED) return null;

  return (
    <div
      className="flex w-full flex-col border border-hairline"
      style={{ height }}
      aria-label="advertisement"
    >
      <span className="px-1.5 pt-1 text-[9px] uppercase tracking-[0.18em] text-ink-faint">
        advertisement
      </span>
      {live ? (
        <ins
          className="adsbygoogle block min-h-0 flex-1"
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={SLOT_IDS[placement]}
          data-ad-format="auto"
          data-full-width-responsive="false"
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center text-[11px] text-ink-faint" />
      )}
    </div>
  );
}
