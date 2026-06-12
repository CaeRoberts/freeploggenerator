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

export function CommsNavEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: CommsNavOptions;
}) {
  const patch = usePatch<CommsNavOptions>(sectionId);
  return (
    <RangeRow
      label="Rows"
      value={options.rows}
      min={2}
      max={14}
      onChange={(rows) => patch({ rows })}
    />
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
