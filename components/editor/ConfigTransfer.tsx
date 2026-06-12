"use client";

import { useRef } from "react";
import { usePlogStore } from "@/lib/store";
import type { PlogConfig } from "@/lib/types";

export function ConfigTransfer() {
  const setConfig = usePlogStore((s) => s.setConfig);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const config = usePlogStore.getState().config;
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plog-config.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as PlogConfig;
      if (parsed?.version === 1 && Array.isArray(parsed.sections)) {
        setConfig(parsed);
      } else {
        window.alert("That file doesn't look like a freeflyingplog config.");
      }
    } catch {
      window.alert("Couldn't read that file as JSON.");
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-hairline py-3 text-[11px] text-ink-faint">
      <span className="uppercase tracking-[0.12em]">Config</span>
      <button onClick={exportJson} className="underline underline-offset-2 hover:text-ink">
        Export JSON
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="underline underline-offset-2 hover:text-ink"
      >
        Import JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
