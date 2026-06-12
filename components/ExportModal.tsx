"use client";

import { useEffect, useState } from "react";
import { usePlogStore } from "@/lib/store";
import type { ExportLayout } from "@/lib/types";
import { downloadPdf, sanitizeFilename } from "./downloadPdf";
import { AdSlot } from "./AdSlot";
import { TextInput, Toggle } from "./ui";

const FLIP_TOOLTIP =
  "Rotates the back page 180° so it reads upright when you flip the card's bottom edge up over a kneeboard clip. Disable for two separate sheets or short-edge duplex.";

const LAYOUTS: {
  value: ExportLayout;
  label: string;
  blurb: string;
  defaultFile: string;
}[] = [
  {
    value: "duplexA5",
    label: "Double-sided A5",
    blurb: "Two A5 pages — print double-sided.",
    defaultFile: "plog-a5.pdf",
  },
  {
    value: "sideBySideA4",
    label: "Single sheet A4",
    blurb: "One landscape sheet, two A5 cards side by side.",
    defaultFile: "plog-a4.pdf",
  },
];

const DEFAULT_FILES = LAYOUTS.map((l) => l.defaultFile);

export function ExportModal({ onClose }: { onClose: () => void }) {
  const config = usePlogStore((s) => s.config);
  const patchConfig = usePlogStore((s) => s.patchConfig);
  const [layout, setLayout] = useState<ExportLayout>("duplexA5");
  const [filename, setFilename] = useState("plog-a5.pdf");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const chooseLayout = (next: ExportLayout) => {
    setLayout(next);
    setDone(false);
    // Swap the default filename unless the user has typed their own.
    setFilename((current) =>
      DEFAULT_FILES.includes(current)
        ? LAYOUTS.find((l) => l.value === next)!.defaultFile
        : current
    );
  };

  const download = async () => {
    setBusy(true);
    try {
      await downloadPdf(config, filename, layout);
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  const note =
    layout === "duplexA5" ? (
      <>
        Print double-sided, <strong>flip on long edge</strong>. Clip the card
        at the top of your kneeboard; flip the bottom edge up and the back reads
        upright.
      </>
    ) : (
      <>
        Print one A4 sheet <strong>landscape, single-sided</strong>, then cut
        down the dashed centre line into two A5 cards.{" "}
        {config.invertBack
          ? "The back card is inverted, so placed behind the front it reads upright on the bottom-flip."
          : "Both cards print upright."}
      </>
    );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Download PDF"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-ink bg-paper p-6 shadow-page sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-[22px]">Download PDF</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[14px] text-ink-faint hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="pt-5">
          <AdSlot placement="modal" height={280} />
        </div>

        <div className="space-y-4 pt-5">
          <fieldset>
            <legend className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              Format
            </legend>
            <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LAYOUTS.map((l) => {
                const active = layout === l.value;
                return (
                  <button
                    key={l.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => chooseLayout(l.value)}
                    className={`border p-3 text-left transition-colors ${
                      active
                        ? "border-navy bg-navy/5"
                        : "border-hairline hover:border-ink"
                    }`}
                  >
                    <span className="block text-[13px] font-medium text-ink">
                      {l.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                      {l.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="block min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                Filename
              </span>
              <TextInput
                value={filename}
                onChange={setFilename}
                ariaLabel="Filename"
                className="font-mono"
              />
            </label>

            <div className="flex shrink-0 items-center gap-3 pb-1">
              <span
                className="text-[12px] text-ink-soft underline decoration-dotted underline-offset-2"
                title={FLIP_TOOLTIP}
              >
                Invert back page for bottom-flip
              </span>
              <Toggle
                checked={config.invertBack}
                label="Invert back page"
                title={FLIP_TOOLTIP}
                onChange={(invertBack) => patchConfig({ invertBack })}
              />
            </div>
          </div>

          <p className="border-l-2 border-hairline pl-3 text-[12px] leading-relaxed text-ink-soft">
            {note}
          </p>

          <button
            onClick={download}
            disabled={busy}
            className="w-full bg-navy px-4 py-3 text-[13px] tracking-wide text-paper hover:bg-navy-deep disabled:opacity-60"
          >
            {busy
              ? "Rendering…"
              : done
                ? `Saved ${sanitizeFilename(filename)} — download again`
                : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
