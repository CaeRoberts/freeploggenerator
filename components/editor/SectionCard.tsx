"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SectionInstance } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";
import { usePlogStore } from "@/lib/store";
import { Segmented, Toggle } from "../ui";
import { FlightLogEditor } from "./FlightLogEditor";
import { ChecklistEditor } from "./ChecklistEditor";
import { RtCallEditor } from "./RtCallEditor";
import {
  CommsNavEditor,
  FuelPlanEditor,
  LinesEditor,
  MinimaEditor,
  RouteSketchEditor,
} from "./SimpleEditors";

function SectionOptionsEditor({ section }: { section: SectionInstance }) {
  switch (section.type) {
    case "flightLog":
      return <FlightLogEditor sectionId={section.id} options={section.options} />;
    case "checklist":
      return <ChecklistEditor sectionId={section.id} options={section.options} />;
    case "rtCall":
      return <RtCallEditor sectionId={section.id} options={section.options} />;
    case "fuelPlan":
      return <FuelPlanEditor sectionId={section.id} options={section.options} />;
    case "commsNav":
      return <CommsNavEditor sectionId={section.id} options={section.options} />;
    case "clearance":
    case "notes":
      return <LinesEditor sectionId={section.id} options={section.options} />;
    case "routeSketch":
      return <RouteSketchEditor sectionId={section.id} options={section.options} />;
    case "minima":
      return <MinimaEditor />;
  }
}

export function SectionCard({ section }: { section: SectionInstance }) {
  const updateSection = usePlogStore((s) => s.updateSection);
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border-b border-hairline ${isDragging ? "z-10 bg-paper-deep" : ""}`}
    >
      <div className="flex items-center gap-2 py-2.5">
        <button
          type="button"
          aria-label={`Drag to reorder ${SECTION_LABELS[section.type]}`}
          className="cursor-grab text-[13px] leading-none text-ink-faint hover:text-ink"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex min-w-0 flex-1 items-center gap-1.5 text-left text-[13px] ${
            section.enabled ? "text-ink" : "text-ink-faint"
          }`}
          aria-expanded={open}
        >
          <span className="truncate">{SECTION_LABELS[section.type]}</span>
          <span className="text-[10px] text-ink-faint">{open ? "▾" : "▸"}</span>
        </button>
        <Segmented
          value={section.page}
          options={[
            { value: "front", label: "Front" },
            { value: "back", label: "Back" },
          ]}
          onChange={(page) =>
            updateSection(section.id, (s) => ({ ...s, page }) as SectionInstance)
          }
        />
        <Toggle
          checked={section.enabled}
          label={`${SECTION_LABELS[section.type]} enabled`}
          onChange={(enabled) =>
            updateSection(section.id, (s) => ({ ...s, enabled }) as SectionInstance)
          }
        />
      </div>
      {open && (
        <div className={`pb-3 pl-6 ${section.enabled ? "" : "opacity-50"}`}>
          <SectionOptionsEditor section={section} />
        </div>
      )}
    </div>
  );
}
