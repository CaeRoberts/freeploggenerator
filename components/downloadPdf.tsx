"use client";

import type { ExportLayout, PlogConfig } from "@/lib/types";

export function sanitizeFilename(name: string): string {
  const base = name.trim().replace(/\.pdf$/i, "");
  const safe = base.replace(/[\\/:*?"<>|]+/g, "-").trim() || "plog-a5";
  return `${safe}.pdf`;
}

/** Renders the export document for the chosen layout and saves it. */
export async function downloadPdf(
  config: PlogConfig,
  filename: string,
  exportLayout: ExportLayout = "duplexA5"
) {
  const [{ pdf }, { PlogDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./pdf/PlogDocument"),
  ]);
  const blob = await pdf(
    <PlogDocument config={config} exportLayout={exportLayout} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitizeFilename(filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
