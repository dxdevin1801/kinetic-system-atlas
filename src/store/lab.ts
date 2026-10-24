import { create } from "zustand";
import type { PartId } from "@/data/fan";

export type ViewPreset = "iso" | "front" | "side" | "rear";

interface LabState {
  selectedNode: string;
  hovered: PartId | null;
  exploded: number; // 0..1
  airflow: boolean;
  spinning: boolean;
  rpm: number;
  view: ViewPreset;
  viewNonce: number;
  select: (id: string) => void;
  hover: (id: PartId | null) => void;
  setExploded: (v: number) => void;
  toggleAirflow: () => void;
  toggleSpin: () => void;
  setRpm: (v: number) => void;
  setView: (v: ViewPreset) => void;
}

export const useLab = create<LabState>((set) => ({
  selectedNode: "blades",
  hovered: null,
  exploded: 0,
  airflow: true,
  spinning: true,
  rpm: 3000,
  view: "iso",
  viewNonce: 0,
  select: (selectedNode) => set({ selectedNode }),
  hover: (hovered) => set({ hovered }),
  setExploded: (exploded) => set({ exploded }),
  toggleAirflow: () => set((s) => ({ airflow: !s.airflow })),
  toggleSpin: () => set((s) => ({ spinning: !s.spinning })),
  setRpm: (rpm) => set({ rpm }),
  setView: (view) => set((s) => ({ view, viewNonce: s.viewNonce + 1 })),
}));
