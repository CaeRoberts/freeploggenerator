"use client";

import { useState } from "react";
import type {
  CommsNavOptions,
  FuelPlanOptions,
  FuelPlanRow,
  LinesOptions,
  RouteSketchOptions,
  SectionInstance,
} from "@/lib/types";
import { usePlogStore } from "@/lib/store";
import { newId } from "@/lib/templates";
import { GhostButton, IconButton, RangeRow, TextInput } from "../ui";

function usePatch<T extends object>(sectionId: string) {
  const updateSection = usePlogStore((s) => s.updateSection);
  return (p: Partial<T>) =>
    updateSection(
      sectionId,
      (s) => ({ ...s, options: { ...s.options, ...p } }) as SectionInstance
    );
}

export function FuelPlanEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: FuelPlanOptions;
}) {
  const patch = usePatch<FuelPlanOptions>(sectionId);
  const [newRow, setNewRow] = useState("");

  const patchRow = (id: string, p: Partial<FuelPlanRow>) =>
    patch({
      rows: options.rows.map((r) => (r.id === id ? { ...r, ...p } : r)),
    });

  const addRow = () => {
    const label = newRow.trim();
    if (!label) return;
    patch({ rows: [...options.rows, { id: newId("fr"), label, bold: false }] });
    setNewRow("");
  };

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-hairline border-y border-hairline">
        {options.rows.map((row) => (
          <li key={row.id} className="flex items-center gap-1 py-0.5">
            <TextInput
              value={row.label}
              onChange={(label) => patchRow(row.id, { label })}
              ariaLabel="Fuel row label"
              className={row.bold ? "font-semibold" : ""}
            />
            <label className="flex shrink-0 items-center gap-1 text-[10px] text-ink-faint">
              <input
                type="checkbox"
                checked={row.bold}
                onChange={(e) => patchRow(row.id, { bold: e.target.checked })}
                className="h-3 w-3 accent-navy"
              />
              bold
            </label>
            <IconButton
              label="Remove row"
              onClick={() =>
                patch({ rows: options.rows.filter((r) => r.id !== row.id) })
              }
              disabled={options.rows.length <= 1}
            >
              ✕
            </IconButton>
          </li>
        ))}
      </ul>
      <div className="flex items-end gap-2">
        <TextInput
          value={newRow}
          onChange={setNewRow}
          placeholder="New row label"
          ariaLabel="New fuel row label"
        />
        <GhostButton onClick={addRow}>Add</GhostButton>
      </div>
    </div>
  );
}

const COMMS_COLS = [
  ["station", "Station"],
  ["freq", "Freq"],
  ["id", "ID"],
] as const;

export function CommsNavEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: CommsNavOptions;
}) {
  const patch = usePatch<CommsNavOptions>(sectionId);
  const hasData = Object.keys(options.values ?? {}).length > 0;

  const setCell = (col: string, row: number, value: string) => {
    const key = `${col}:${row}`;
    const next = { ...(options.values ?? {}) };
    if (value) next[key] = value;
    else delete next[key];
    patch({ values: next });
  };

  return (
    <div className="space-y-2">
      <RangeRow
        label="Rows"
        value={options.rows}
        min={2}
        max={14}
        onChange={(rows) => patch({ rows })}
      />

      <div>
        <div className="flex items-baseline justify-between pb-1">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Frequencies
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
        <table className="w-full border-collapse border-y border-hairline">
          <thead>
            <tr>
              <th className="w-5" />
              {COMMS_COLS.map(([key, label]) => (
                <th
                  key={key}
                  className="border-l border-hairline px-1 py-0.5 text-left text-[9px] font-medium text-ink-soft"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: options.rows }).map((_, r) => (
              <tr key={r} className="border-t border-hairline">
                <td className="text-center font-mono text-[9px] text-ink-faint">
                  {r + 1}
                </td>
                {COMMS_COLS.map(([key, label]) => (
                  <td key={key} className="border-l border-hairline">
                    <input
                      type="text"
                      value={options.values?.[`${key}:${r}`] ?? ""}
                      onChange={(e) => setCell(key, r, e.target.value)}
                      aria-label={`${label} row ${r + 1}`}
                      className="w-full bg-transparent px-1 py-0.5 text-[11px] text-ink outline-none focus:bg-paper-deep/60"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LinesEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: LinesOptions;
}) {
  const patch = usePatch<LinesOptions>(sectionId);
  return (
    <RangeRow
      label="Lines"
      value={options.lines}
      min={2}
      max={14}
      onChange={(lines) => patch({ lines })}
    />
  );
}

export function RouteSketchEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: RouteSketchOptions;
}) {
  const patch = usePatch<RouteSketchOptions>(sectionId);
  return (
    <RangeRow
      label="Height"
      value={options.heightFraction}
      min={0.2}
      max={0.6}
      step={0.05}
      format={(v) => `${Math.round(v * 100)}%`}
      onChange={(heightFraction) => patch({ heightFraction })}
    />
  );
}

export function MinimaEditor() {
  return (
    <p className="py-1 text-[12px] leading-relaxed text-ink-faint">
      An open box labelled “MINIMA (DA / MDA)”. When the checklist on the same
      page is set to two columns, minima slots into the shorter column’s
      leftover space automatically.
    </p>
  );
}
