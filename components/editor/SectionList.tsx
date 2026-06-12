"use client";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { usePlogStore } from "@/lib/store";
import { SectionCard } from "./SectionCard";

export function SectionList() {
  const sections = usePlogStore((s) => s.config.sections);
  const moveSection = usePlogStore((s) => s.moveSection);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      moveSection(String(active.id), String(over.id));
    }
  };

  return (
    <div>
      <h2 className="border-b border-ink pb-1 font-serif text-[15px]">
        Sections
      </h2>
      <p className="py-2 text-[11px] leading-relaxed text-ink-faint">
        Drag to set the top-to-bottom order on each page. Toggle a section off
        to drop it from the card.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="border-t border-hairline">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
