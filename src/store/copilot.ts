import { create } from "zustand";
import type { CopilotReply } from "@/lib/copilot/engine";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: CopilotReply;
  streaming?: boolean;
}

interface CopilotState {
  open: boolean;
  messages: ChatMessage[];
  pending: string | null;
  setOpen: (v: boolean) => void;
  ask: (q: string) => void;
  consumePending: () => string | null;
  add: (m: ChatMessage) => void;
  update: (id: string, patch: Partial<ChatMessage>) => void;
  clear: () => void;
}

export const useCopilot = create<CopilotState>((set, get) => ({
  open: false,
  messages: [],
  pending: null,
  setOpen: (open) => set({ open }),
  ask: (q) => set({ open: true, pending: q }),
  consumePending: () => {
    const p = get().pending;
    if (p) set({ pending: null });
    return p;
  },
  add: (m) => set((s) => ({ messages: [...s.messages, m] })),
  update: (id, patch) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
  clear: () => set({ messages: [] }),
}));
