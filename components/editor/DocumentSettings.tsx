"use client";

import { useState } from "react";
import { usePlogStore } from "@/lib/store";
import { GhostButton, IconButton, TextInput, Toggle } from "../ui";

const FLIP_TOOLTIP =
  "Rotates the back page 180° in the PDF so it reads upright when you flip the card's bottom edge up over a kneeboard clip. Print duplex, flip on long edge. Disable for two separate sheets or short-edge duplex.";

export function DocumentSettings() {
  const config = usePlogStore((s) => s.config);
  const patchConfig = usePlogStore((s) => s.patchConfig);
  const [newField, setNewField] = useState("");

  const addField = () => {
    const f = newField.trim();
    if (!f) return;
    patchConfig({ headerFields: [...config.headerFields, f] });
    setNewField("");
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
