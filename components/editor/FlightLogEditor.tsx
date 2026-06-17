"use client";

import { useState } from "react";
import type { ColumnDef, FlightLogOptions, SectionInstance } from "@/lib/types";
import { usePlogStore } from "@/lib/store";
import { newId } from "@/lib/templates";
import { GhostButton, IconButton, RangeRow, TextInput } from "../ui";

export function FlightLogEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: FlightLogOptions;
}) {
  const updateSection = usePlogStore((s) => s.updateSection);
  const [newColumn, setNewColumn] = useState("");

  const patch = (p: Partial<FlightLogOptions>) =>
    updateSection(
      sectionId,
      (s) => ({ ...s, options: { ...s.options, ...p } }) as SectionInstance
    );

  const patchColumn = (id: string, p: Partial<ColumnDef>) =>
    patch({
      columns: options.columns.map((c) => (c.id === id ? { ...c, ...p } : c)),
    });

  const moveColumn = (index: number, dir: -1 | 1) => {
    const next = [...options.columns];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    patch({ columns: next });
  };

  const addColumn = () => {
    const label = newColumn.trim();
    if (!label) return;
    patch({
      columns: [...options.columns, { id: newId("col"), label, shaded: false }],
    });
    setNewColumn("");
  };

  const setCell = (colId: string, row: number, value: string) => {
    const key = `${colId}:${row}`;
    const next = { ...(options.values ?? {}) };
    if (value) next[key] = value;
    else delete next[key];
    patch({ values: next });
  };

  const hasData = Object.keys(options.values ?? {}).length > 0;

  return (
    <div className="space-y-1">
      <RangeRow
        label="Legs"
        value={options.rows}
        min={4}
        max={16}
        onChange={(rows) => patch({ rows })}
      />
      <RangeRow
        label="Height"
        value={options.heightFraction}
        min={0.3}
        max={0.6}
        step={0.05}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(heightFraction) => patch({ heightFraction })}
      />

      <div className="pt-2">
        <div className="flex items-baseline justify-between pb-1">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Columns
          </span>
          <span className="text-[10px] text-ink-faint">shade = figure to fly</span>
        </div>
        <ul className="divide-y divide-hairline border-y border-hairline">
          {options.columns.map((col, i) => (
            <li key={col.id} className="flex items-center gap-1 py-1">
              <span className="min-w-0 flex-1 truncate font-mono text-[11px]">
                {col.label}
              </span>
              <label className="flex items-center gap-1 text-[10px] text-ink-faint">
                <input
                  type="checkbox"
                  checked={col.shaded}
                  onChange={(e) => patchColumn(col.id, { shaded: e.target.checked })}
                  className="h-3 w-3 accent-navy"
                />
                shaded
              </label>
              <IconButton label={`Move ${col.label} left`} onClick={() => moveColumn(i, -1)} disabled={i === 0}>
                ↑
              </IconButton>
              <IconButton
                label={`Move ${col.label} right`}
                onClick={() => moveColumn(i, 1)}
                disabled={i === options.columns.length - 1}
              >
                ↓
              </IconButton>
              <IconButton
                label={`Remove ${col.label}`}
                onClick={() =>
                  patch({ columns: options.columns.filter((c) => c.id !== col.id) })
                }
                disabled={options.columns.length <= 1}
              >
                ✕
              </IconButton>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2 pt-2">
          <TextInput
            value={newColumn}
            onChange={setNewColumn}
            placeholder="Custom column, e.g. RAS"
            ariaLabel="New column name"
          />
          <GhostButton onClick={addColumn}>Add</GhostButton>
        </div>
      </div>

      <div className="pt-3">
        <div className="flex items-baseline justify-between pb-1">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Leg data
          </span>
          {hasData && (
            <button
              type="button"
              onClick={() => patch({ values: {} })}
              className="text-[10px] text-ink-faint underline underline-offset-2 hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="pb-1.5 text-[10px] leading-relaxed text-ink-faint">
          Type to pre-fill the table; leave blank to write by hand. Scroll
          sideways for more columns.
        </p>
        <div className="overflow-x-auto border border-hairline">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-paper-deep px-1 py-0.5 text-[9px] font-medium text-ink-faint">
                  #
                </th>
                {options.columns.map((c) => (
                  <th
                    key={c.id}
                    className="border-l border-hairline px-1 py-0.5 text-[9px] font-medium text-ink-soft"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: options.rows }).map((_, r) => (
                <tr key={r} className="border-t border-hairline">
                  <td className="sticky left-0 z-10 bg-paper-deep px-1 text-center font-mono text-[9px] text-ink-faint">
                    {r + 1}
                  </td>
                  {options.columns.map((c) => (
                    <td key={c.id} className="border-l border-hairline">
                      <input
                        type="text"
                        value={options.values?.[`${c.id}:${r}`] ?? ""}
                        onChange={(e) => setCell(c.id, r, e.target.value)}
                        aria-label={`${c.label} leg ${r + 1}`}
                        className="w-[52px] bg-transparent px-1 py-0.5 text-center text-[11px] text-ink outline-none focus:bg-paper-deep/60"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
