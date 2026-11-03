"use client";

import { create } from "zustand";

/** Transient UI state — never persisted. */
export type Celebration =
  | { id: string; kind: "xp"; amount: number; label: string }
  | { id: string; kind: "achievement"; achievementId: string }
  | { id: string; kind: "level"; level: number }
  | { id: string; kind: "boss"; questId: string; nextWorldId?: string }
  | { id: string; kind: "unlock"; worldId: string };

export const MODAL_KINDS = new Set<Celebration["kind"]>(["level", "boss"]);

type NewCelebration = Celebration extends infer C ? (C extends Celebration ? Omit<C, "id"> : never) : never;

interface UIState {
  openQuestId: string | null;
  openQuest: (id: string) => void;
  closeQuest: () => void;
  celebrations: Celebration[];
  celebrate: (c: NewCelebration) => void;
  dismiss: (id: string) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
}

let seq = 0;

export const useUI = create<UIState>((set) => ({
  openQuestId: null,
  openQuest: (id) => set({ openQuestId: id }),
  closeQuest: () => set({ openQuestId: null }),
  celebrations: [],
  celebrate: (c) => set((s) => ({ celebrations: [...s.celebrations, { ...c, id: `c${++seq}` } as Celebration] })),
  dismiss: (id) => set((s) => ({ celebrations: s.celebrations.filter((c) => c.id !== id) })),
  settingsOpen: false,
  setSettingsOpen: (v) => set({ settingsOpen: v }),
}));
