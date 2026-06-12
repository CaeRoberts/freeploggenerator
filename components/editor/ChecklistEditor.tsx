"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  ChecklistItem,
  ChecklistOptions,
  ChecklistPhase,
  SectionInstance,
} from "@/lib/types";
import { usePlogStore } from "@/lib/store";
import { newId } from "@/lib/templates";
import { GhostButton, IconButton, Segmented, TextInput } from "../ui";

export function ChecklistEditor({
  sectionId,
  options,
}: {
  sectionId: string;
  options: ChecklistOptions;
}) {
  const updateSection = usePlogStore((s) => s.updateSection);

  const patch = (p: Partial<ChecklistOptions>) =>
    updateSection(
      sectionId,
      (s) => ({ ...s, options: { ...s.options, ...p } }) as SectionInstance
    );

  const patchPhase = (phaseId: string, p: Partial<ChecklistPhase>) =>
    patch({
      phases: options.phases.map((ph) =>
        ph.id === phaseId ? { ...ph, ...p } : ph
      ),
    });

  const movePhase = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= options.phases.length) return;
    patch({ phases: arrayMove(options.phases, index, target) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">
          Layout
        </span>
        <Segmented
          value={options.layout}
          options={[
            { value: "one-column", label: "One column" },
            { value: "two-column", label: "Two columns" },
          ]}
          onChange={(layout) => patch({ layout })}
        />
      </div>

      {options.phases.map((phase, i) => (
        <PhaseEditor
          key={phase.id}
          phase={phase}
          onPatch={(p) => patchPhase(phase.id, p)}
          onRemove={() =>
            patch({ phases: options.phases.filter((p) => p.id !== phase.id) })
          }
          onMoveUp={i > 0 ? () => movePhase(i, -1) : undefined}
          onMoveDown={
            i < options.phases.length - 1 ? () => movePhase(i, 1) : undefined
          }
        />
      ))}

      <GhostButton
        onClick={() =>
          patch({
            phases: [
              ...options.phases,
              { id: newId("ph"), name: "NEW PHASE", items: [] },
            ],
          })
        }
      >
        Add phase
      </GhostButton>
    </div>
  );
}

function PhaseEditor({
  phase,
  onPatch,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  phase: ChecklistPhase;
  onPatch: (p: Partial<ChecklistPhase>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = phase.items.findIndex((it) => it.id === active.id);
    const to = phase.items.findIndex((it) => it.id === over.id);
    if (from < 0 || to < 0) return;
    onPatch({ items: arrayMove(phase.items, from, to) });
  };

  const patchItem = (id: string, p: Partial<ChecklistItem>) =>
    onPatch({
      items: phase.items.map((it) => (it.id === id ? { ...it, ...p } : it)),
    });

  const addItem = () => {
    const label = newLabel.trim();
    if (!label) return;
    onPatch({
      items: [...phase.items, { id: newId("it"), label, action: "CHECK" }],
    });
    setNewLabel("");
  };

  return (
    <div className="border border-hairline p-2">
      <div className="flex items-center gap-1 pb-1">
        <TextInput
          value={phase.name}
          onChange={(name) => onPatch({ name })}
          ariaLabel="Phase name"
          className="font-medium uppercase"
        />
        <IconButton label="Move phase up" onClick={onMoveUp ?? (() => {})} disabled={!onMoveUp}>
          ↑
        </IconButton>
        <IconButton label="Move phase down" onClick={onMoveDown ?? (() => {})} disabled={!onMoveDown}>
          ↓
        </IconButton>
        <IconButton label="Remove phase" onClick={onRemove}>
          ✕
        </IconButton>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={phase.items.map((it) => it.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {phase.items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onPatch={(p) => patchItem(item.id, p)}
                onRemove={() =>
                  onPatch({ items: phase.items.filter((it) => it.id !== item.id) })
                }
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex items-end gap-2 pt-1">
        <TextInput
          value={newLabel}
          onChange={setNewLabel}
          placeholder="New item"
          ariaLabel="New checklist item"
        />
        <GhostButton onClick={addItem}>Add</GhostButton>
      </div>
    </div>
  );
}

function SortableItem({
  item,
  onPatch,
  onRemove,
}: {
  item: ChecklistItem;
  onPatch: (p: Partial<ChecklistItem>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 border-b border-hairline py-0.5 ${
        isDragging ? "bg-paper-deep opacity-80" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Drag to reorder item"
        className="cursor-grab px-0.5 text-[11px] text-ink-faint hover:text-ink"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <TextInput value={item.label} onChange={(label) => onPatch({ label })} ariaLabel="Item label" />
      <div className="w-24 shrink-0">
        <TextInput
          value={item.action}
          onChange={(action) => onPatch({ action: action.toUpperCase() })}
          ariaLabel="Item action"
          className="text-right font-mono uppercase"
        />
      </div>
      <IconButton label="Remove item" onClick={onRemove}>
        ✕
      </IconButton>
    </li>
  );
}
