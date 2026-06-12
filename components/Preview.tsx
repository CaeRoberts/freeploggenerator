"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePlogStore } from "@/lib/store";
import { useDebounced } from "@/lib/useDebounced";
import { computePageLayout } from "@/lib/metrics";
import type { PageSide } from "@/lib/types";

// react-pdf must stay out of the SSR module graph; load it client-only.
const PdfFrame = dynamic(() => import("./PdfFrame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[300px] items-center justify-center text-[13px] text-ink-faint">
      Preparing preview…
    </div>
  ),
});

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function Preview() {
  const config = usePlogStore((s) => s.config);
  const debounced = useDebounced(config, 500);
  const [tab, setTab] = useState<PageSide>("front");
  const desktop = useIsDesktop();

  const layout = useMemo(
    () => computePageLayout(debounced, tab),
    [debounced, tab]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between border-b border-hairline pb-2">
        <div className="flex gap-5">
          {(["front", "back"] as const).map((side) => (
            <button
              key={side}
              onClick={() => setTab(side)}
              className={`pb-1 text-[13px] tracking-wide transition-colors ${
                tab === side
                  ? "border-b border-ink font-medium text-ink"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              {side === "front" ? "Front" : "Back"}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] text-ink-faint">
          A5 — 148 × 210 mm
        </span>
      </div>

      <div className="flex min-h-7 flex-wrap items-center gap-2 py-1.5">
        {tab === "back" && config.invertBack && (
          <span
            className="border border-hairline bg-paper-deep px-2 py-0.5 text-[11px] text-ink-soft"
            title="In the PDF this page is rotated 180° so it reads upright when you flip the bottom edge of the card up over a kneeboard clip."
          >
            printed inverted for bottom-flip
          </span>
        )}
        {layout.overflow && (
          <span className="border border-amber-700/40 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900">
            page overflows A5 — reduce rows or section heights
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <PdfFrame tab={tab} config={debounced} desktop={desktop} />
      </div>
    </div>
  );
}
