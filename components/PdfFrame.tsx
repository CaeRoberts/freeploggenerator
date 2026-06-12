"use client";

import { useEffect, useState } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { PlogDocument } from "./pdf/PlogDocument";
import type { PageSide, PlogConfig } from "@/lib/types";

interface FrameProps {
  tab: PageSide;
  config: PlogConfig;
}

export function DesktopViewer({ tab, config }: FrameProps) {
  return (
    <div className="mx-auto h-full w-full max-w-[560px]">
      <div className="h-full w-full shadow-page">
        <PDFViewer
          showToolbar={false}
          className="h-full w-full border border-hairline"
          style={{ backgroundColor: "#f1ede4" }}
        >
          <PlogDocument config={config} previewPage={tab} />
        </PDFViewer>
      </div>
    </div>
  );
}

export function MobilePreview({ tab, config }: FrameProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [stale, setStale] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStale(true);
  }, [config, tab]);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setBusy(true);
    try {
      const blob = await pdf(
        <PlogDocument config={config} previewPage={tab} />
      ).toBlob();
      setUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setStale(false);
    } finally {
      setBusy(false);
    }
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
