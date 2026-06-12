"use client";

import { useRef, useState } from "react";
import { usePlogStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { shareUrl } from "@/lib/share";

export function HeaderActions({ onDownload }: { onDownload: () => void }) {
  const setConfig = usePlogStore((s) => s.setConfig);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();

  const applyTemplate = (id: string) => {
    const template = TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    if (
      window.confirm(
        `Replace your current layout with the ${template.name}? Your edits will be overwritten.`
      )
    ) {
      setConfig(template.build());
    }
  };

  const share = async () => {
    const url = shareUrl(usePlogStore.getState().config);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <label className="flex items-center gap-1.5">
        <span className="hidden text-[10px] uppercase tracking-[0.12em] text-ink-faint sm:inline">
          Template
        </span>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) applyTemplate(e.target.value);
            e.target.value = "";
          }}
          aria-label="Apply a template"
          className="border border-hairline bg-transparent px-1.5 py-1 text-[12px] text-ink outline-none hover:border-ink"
        >
          <option value="" disabled>
            Choose…
          </option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={share}
        title="Copies a link that reproduces this layout"
        className="border border-hairline px-3 py-1.5 text-[12px] tracking-wide text-ink-soft hover:border-ink hover:text-ink"
      >
        {copied ? "Link copied" : "Share layout"}
      </button>

      <button
        onClick={onDownload}
        className="bg-navy px-3.5 py-1.5 text-[12px] tracking-wide text-paper hover:bg-navy-deep"
      >
        Download PDF
      </button>
    </>
  );
}
