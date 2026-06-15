"use client";

import type {
  RtCallBlock,
  RtCallLine,
  RtCallOptions,
  SectionInstance,
} from "@/lib/types";
import { usePlogStore } from "@/lib/store";
import { newId } from "@/lib/templates";
import { GhostButton, IconButton, TextInput } from "../ui";

export function RtCallEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: RtCallOptions;
}) {
  const updateSection = usePlogStore((s) => s.updateSection);

  const patch = (p: Partial<RtCallOptions>) =>
    updateSection(
      sectionId,
      (s) => ({ ...s, options: { ...s.options, ...p } }) as SectionInstance
    );

  const patchBlock = (blockId: string, up: Partial<RtCallBlock>) =>
    patch({
      blocks: options.blocks.map((b) =>
        b.id === blockId ? { ...b, ...up } : b
      ),
    });

  const patchLine = (
    blockId: string,
    lineId: string,
    up: Partial<RtCallLine>
  ) =>
    patch({
      blocks: options.blocks.map((b) =>
        b.id === blockId
          ? {
              ...b,
              lines: b.lines.map((l) =>
                l.id === lineId ? { ...l, ...up } : l
              ),
            }
          : b
      ),
    });

  return (
    <div className="space-y-3">
      {options.blocks.map((block) => (
        <div key={block.id} className="border border-hairline p-2">
          <div className="flex items-center gap-1 pb-1">
            <TextInput
              value={block.title}
              onChange={(title) => patchBlock(block.id, { title })}
              ariaLabel="Block title"
              className="font-medium uppercase"
            />
            <IconButton
              label="Remove block"
              onClick={() =>
                patch({ blocks: options.blocks.filter((b) => b.id !== block.id) })
              }
              disabled={options.blocks.length <= 1}
            >
              ✕
            </IconButton>
          </div>

          <ul>
            {block.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-center gap-1 border-b border-hairline py-0.5"
              >
                {line.text !== undefined ? (
                  <TextInput
                    value={line.text}
                    onChange={(text) => patchLine(block.id, line.id, { text })}
                    ariaLabel="Spoken line"
                    placeholder="Spoken text (no blank)"
                  />
                ) : (
                  <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                    {(line.fields ?? []).map((field, fi) => (
                      <div key={fi} className="flex min-w-0 flex-1 items-center gap-1">
                        <TextInput
                          value={field.label}
                          onChange={(label) =>
                            patchLine(block.id, line.id, {
                              fields: (line.fields ?? []).map((f, j) =>
                                j === fi ? { ...f, label } : f
                              ),
                            })
                          }
                          ariaLabel="Prompt"
                          placeholder="prompt"
                        />
                        <TextInput
                          value={field.hint}
                          onChange={(hint) =>
                            patchLine(block.id, line.id, {
                              fields: (line.fields ?? []).map((f, j) =>
                                j === fi ? { ...f, hint } : f
                              ),
                            })
                          }
                          ariaLabel="Hint"
                          placeholder="hint"
                          className="text-[11px] text-ink-faint"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <IconButton
                  label="Remove line"
                  onClick={() =>
                    patchBlock(block.id, {
                      lines: block.lines.filter((l) => l.id !== line.id),
                    })
                  }
                >
                  ✕
                </IconButton>
              </li>
            ))}
          </ul>

          <div className="flex gap-2 pt-1.5">
            <GhostButton
              onClick={() =>
                patchBlock(block.id, {
                  lines: [
                    ...block.lines,
                    {
                      id: newId("rt"),
                      fields: [
                        { label: "prompt", hint: "" },
                        { label: "", hint: "" },
                      ],
                    },
                  ],
                })
              }
            >
              Add blank line
            </GhostButton>
            <GhostButton
              onClick={() =>
                patchBlock(block.id, {
                  lines: [...block.lines, { id: newId("rt"), text: "New line" }],
                })
              }
            >
              Add spoken line
            </GhostButton>
          </div>
        </div>
      ))}

      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Footer note
          </span>
          <TextInput
            value={options.note}
            onChange={(note) => patch({ note })}
            ariaLabel="Footer note"
          />
        </label>
        <GhostButton
          onClick={() =>
            patch({
              blocks: [
                ...options.blocks,
                { id: newId("rtb"), title: "NEW BLOCK", lines: [] },
              ],
            })
          }
        >
          Add block
        </GhostButton>
      </div>
    </div>
  );
}
