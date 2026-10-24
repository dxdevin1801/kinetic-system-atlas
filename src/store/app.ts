import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "dark" | "light";
export type Quality = "high" | "balanced";

export interface Settings {
  theme: Theme;
  reduceMotion: boolean;
  particles: boolean;
  quality: Quality;
  units: "SI" | "Imperial";
  copilotDepth: "simple" | "technical";
  notifySimulations: boolean;
  notifyFailures: boolean;
}

export const PROJECTS = [
  { id: "fan-rig", name: "Cooling Fan Rig", code: "SX-201" },
  { id: "ev-drive", name: "EV Drivetrain Study", code: "SX-118" },
  { id: "arm-cell", name: "Robotic Work Cell", code: "SX-095" },
] as const;

interface AppState extends Settings {
  projectId: string;
  set: (patch: Partial<Settings>) => void;
  setProject: (id: string) => void;
  reset: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  reduceMotion: false,
  particles: true,
  quality: "high",
  units: "SI",
  copilotDepth: "simple",
  notifySimulations: true,
  notifyFailures: true,
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      projectId: "fan-rig",
      set: (patch) => set(patch),
      setProject: (projectId) => set({ projectId }),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: "systemx-settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export interface Notice {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "sim" | "failure" | "system";
  read: boolean;
}

interface NoticeState {
  items: Notice[];
  markAll: () => void;
  mark: (id: string) => void;
  push: (n: Omit<Notice, "id" | "read" | "time">) => void;
}

export const useNotices = create<NoticeState>((set) => ({
  items: [
    {
      id: "n1",
      title: "Simulation complete",
      body: "Spin-up run #128 settled at 3,594 rpm in 6.2 s.",
      time: "4 min ago",
      kind: "sim",
      read: false,
    },
    {
      id: "n2",
      title: "High RPN detected",
      body: "Front bearing grease degradation scored RPN 240.",
      time: "1 h ago",
      kind: "failure",
      read: false,
    },
    {
      id: "n3",
      title: "New system available",
      body: "Rocket Propulsion overview added to Explore Systems.",
      time: "Yesterday",
      kind: "system",
      read: true,
    },
  ],
  markAll: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
  mark: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)) })),
  push: (n) =>
    set((s) => ({
      items: [{ ...n, id: crypto.randomUUID(), read: false, time: "Just now" }, ...s.items].slice(0, 12),
    })),
}));
