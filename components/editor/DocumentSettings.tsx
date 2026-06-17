"use client";

import { useRef, useState } from "react";
import { usePlogStore } from "@/lib/store";
import { fileToLogoDataUrl } from "@/lib/logo";
import { DEFAULT_LOGO_H_MM, DEFAULT_LOGO_W_MM } from "@/lib/metrics";
import { GhostButton, IconButton, RangeRow, TextInput, Toggle } from "../ui";

const FLIP_TOOLTIP =
  "Rotates the back page 180° in the PDF so it reads upright when you flip the card's bottom edge up over a kneeboard clip. Print duplex, flip on long edge. Disable for two separate sheets or short-edge duplex.";

export function DocumentSettings() {
  const config = usePlogStore((s) => s.config);
  const patchConfig = usePlogStore((s) => s.patchConfig);
  const [newField, setNewField] = useState("");
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const addField = () => {
    const f = newField.trim();
    if (!f) return;
    patchConfig({ headerFields: [...config.headerFields, f] });
    setNewField("");
  };

  const onLogoFile = async (file: File) => {
    setLogoError(null);
    try {
      patchConfig({
        logo: await fileToLogoDataUrl(file),
        logoWidth: config.logoWidth ?? DEFAULT_LOGO_W_MM,
        logoHeight: config.logoHeight ?? DEFAULT_LOGO_H_MM,
      });
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Could not load that image.");
    }
  };

  return (
    <div className="pb-5">
      <h2 className="border-b border-ink pb-1 font-serif text-[15px]">
        Document
      </h2>
      <div className="space-y-3 pt-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Title
          </span>
          <TextInput
            value={config.title}
            onChange={(title) => patchConfig({ title })}
            ariaLabel="PLOG title"
          />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Version
          </span>
          <TextInput
            value={config.versionLabel ?? ""}
            onChange={(versionLabel) => patchConfig({ versionLabel })}
            ariaLabel="Version"
            placeholder="e.g. 2.1 — footer shows “Rev 2.1”"
          />
        </label>

        <div>
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Logo
          </span>
          <div className="flex items-center gap-3 pt-1.5">
            <div className="flex h-10 w-24 shrink-0 items-center justify-center border border-hairline bg-paper-deep/40">
              {config.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logo}
                  alt="PLOG logo"
                  className="max-h-9 max-w-[88px] object-contain"
                />
              ) : (
                <span className="text-[10px] text-ink-faint">No logo</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <GhostButton onClick={() => logoInput.current?.click()}>
                {config.logo ? "Replace" : "Upload logo"}
              </GhostButton>
              {config.logo && (
                <button
                  type="button"
                  onClick={() => {
                    patchConfig({ logo: undefined });
                    setLogoError(null);
                  }}
                  className="text-left text-[11px] text-ink-faint underline underline-offset-2 hover:text-ink"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onLogoFile(f);
                e.target.value = "";
              }}
            />
          </div>
          <p className="pt-1 text-[10px] leading-relaxed text-ink-faint">
            {logoError ? (
              <span className="text-amber-800">{logoError}</span>
            ) : (
              "Replaces the title on the card. Saved on this device and in JSON export / PDF; not carried in share links."
            )}
          </p>
          {config.logo && (
            <div className="pt-1">
              <RangeRow
                label="Logo width"
                value={config.logoWidth ?? DEFAULT_LOGO_W_MM}
                min={10}
                max={90}
                format={(v) => `${v} mm`}
                onChange={(logoWidth) => patchConfig({ logoWidth })}
              />
              <RangeRow
                label="Logo height"
                value={config.logoHeight ?? DEFAULT_LOGO_H_MM}
                min={4}
                max={30}
                format={(v) => `${v} mm`}
                onChange={(logoHeight) => patchConfig({ logoHeight })}
              />
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Header fields
          </span>
          <ul className="divide-y divide-hairline border-y border-hairline">
            {config.headerFields.map((field, i) => (
              <li key={i} className="flex items-center gap-1 py-0.5">
                <TextInput
                  value={field}
                  onChange={(v) =>
                    patchConfig({
                      headerFields: config.headerFields.map((f, j) =>
                        j === i ? v : f
                      ),
                    })
                  }
                  ariaLabel={`Header field ${i + 1}`}
                />
                <IconButton
                  label="Remove field"
                  onClick={() =>
                    patchConfig({
                      headerFields: config.headerFields.filter((_, j) => j !== i),
                    })
                  }
                >
                  ✕
                </IconButton>
              </li>
            ))}
          </ul>
          <div className="flex items-end gap-2 pt-1.5">
            <TextInput
              value={newField}
              onChange={setNewField}
              placeholder="New field, e.g. PIC"
              ariaLabel="New header field"
            />
            <GhostButton onClick={addField}>Add</GhostButton>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
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
    </div>
  );
}
