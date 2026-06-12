"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ConsentStatus = "unknown" | "granted" | "denied";

interface ConsentStore {
  status: ConsentStatus;
  setStatus: (status: ConsentStatus) => void;
}

export const useConsent = create<ConsentStore>()(
  persist(
    (set) => ({
      status: "unknown",
      setStatus: (status) => set({ status }),
    }),
    {
      name: "freeflyingplog-consent",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
