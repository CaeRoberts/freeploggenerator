"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlogConfig, SectionInstance } from "./types";
import { ifrTemplate } from "./templates";

interface PlogStore {
  config: PlogConfig;
  setConfig: (config: PlogConfig) => void;
  patchConfig: (patch: Partial<PlogConfig>) => void;
  updateSection: (
    id: string,
    update: (section: SectionInstance) => SectionInstance
  ) => void;
  moveSection: (activeId: string, overId: string) => void;
}

export const usePlogStore = create<PlogStore>()(
  persist(
    (set) => ({
      config: ifrTemplate(),
      setConfig: (config) => set({ config }),
      patchConfig: (patch) =>
        set((state) => ({ config: { ...state.config, ...patch } })),
      updateSection: (id, update) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: state.config.sections.map((s) =>
              s.id === id ? update(s) : s
            ),
          },
        })),
      moveSection: (activeId, overId) =>
        set((state) => {
          const sections = [...state.config.sections];
          const from = sections.findIndex((s) => s.id === activeId);
          const to = sections.findIndex((s) => s.id === overId);
          if (from < 0 || to < 0) return state;
          const [moved] = sections.splice(from, 1);
          sections.splice(to, 0, moved);
          return { config: { ...state.config, sections } };
        }),
    }),
    {
      name: "freeflyingplog-config",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
