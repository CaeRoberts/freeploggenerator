"use client";

import { useEffect, useState } from "react";
import { usePlogStore } from "@/lib/store";
import { downloadPdf, sanitizeFilename } from "./downloadPdf";
import { AdSlot } from "./AdSlot";
import { TextInput, Toggle } from "./ui";

const FLIP_TOOLTIP =
  "Rotates the back page 180° in the PDF so it reads upright when you flip the card's bottom edge up over a kneeboard clip. Disable for two separate sheets or short-edge duplex.";

export function ExportModal({ onClose }: { onClose: () => void }) {
  const config = usePlogStore((s) => s.config);
  const patchConfig = usePlogStore((s) => s.patchConfig);
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

  const download = async () => {
    setBusy(true);
    try {
      await downloadPdf(config, filename);
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

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
            Print double-sided, <strong>flip on long edge</strong>. Clip the
            card at the top of your kneeboard; flip the bottom edge up and the
            back reads upright.
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
