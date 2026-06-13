"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { PlogDocument } from "./pdf/PlogDocument";
import type { PageSide, PlogConfig } from "@/lib/types";

interface FrameProps {
  tab: PageSide;
  config: PlogConfig;
}

/**
 * Renders the document to a fresh PDF blob. We deliberately avoid
 * @react-pdf's <PDFViewer>, whose incremental reconciler leaves ghost nodes
 * when columns/rows/sections are added or reordered (the preview kept stale
 * duplicate columns until it was forced to remount). Each render here builds
 * a brand-new document, so the preview can never accumulate stale nodes.
 */
function usePreviewBlob(config: PlogConfig, tab: PageSide) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const latest = useRef(0);
  const urlRef = useRef<string | null>(null);

  const render = useCallback(async () => {
    const id = ++latest.current;
    setBusy(true);
    try {
      const blob = await pdf(
        <PlogDocument config={config} previewPage={tab} />
      ).toBlob();
      if (id !== latest.current) return; // a newer render superseded this one
      const next = URL.createObjectURL(blob);
      const prev = urlRef.current;
      urlRef.current = next;
      setUrl(next);
      if (prev) URL.revokeObjectURL(prev);
    } finally {
      if (id === latest.current) setBusy(false);
    }
  }, [config, tab]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  return { url, busy, render };
}

export function DesktopViewer({ tab, config }: FrameProps) {
  const { url, render } = usePreviewBlob(config, tab);

  // Re-render whenever the (already debounced) config or page changes. The
  // previous frame stays on screen until the new blob is ready, so updates
  // don't flash blank.
  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="mx-auto h-full w-full max-w-[560px]">
      <div className="h-full w-full shadow-page">
        {url ? (
          <iframe
            src={`${url}#toolbar=0&navpanes=0&view=FitH`}
            className="h-full w-full border border-hairline"
            title="PLOG preview"
            style={{ backgroundColor: "#f1ede4" }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center border border-hairline text-[13px] text-ink-faint"
            style={{ backgroundColor: "#f1ede4" }}
          >
            Rendering preview…
          </div>
        )}
      </div>
    </div>
  );
}

export function MobilePreview({ tab, config }: FrameProps) {
  const { url, busy, render } = usePreviewBlob(config, tab);
  const [stale, setStale] = useState(true);

  useEffect(() => {
    setStale(true);
  }, [config, tab]);

  const generate = async () => {
    await render();
    setStale(false);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <button
        onClick={generate}
        disabled={busy}
        className="border border-ink px-4 py-2 text-[13px] text-ink hover:bg-paper-deep disabled:opacity-50"
      >
        {busy ? "Rendering…" : stale ? "Generate preview" : "Refresh preview"}
      </button>
      {url ? (
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className="aspect-[148/210] w-full border border-hairline shadow-page"
          title="PLOG preview"
        />
      ) : (
        <div className="flex aspect-[148/210] w-full items-center justify-center border border-hairline bg-white text-[13px] text-ink-faint">
          Tap “Generate preview” to render the {tab} page
        </div>
      )}
    </div>
  );
}

export default function PdfFrame({
  tab,
  config,
  desktop,
}: FrameProps & { desktop: boolean }) {
  return desktop ? (
    <DesktopViewer tab={tab} config={config} />
  ) : (
    <MobilePreview tab={tab} config={config} />
  );
}
