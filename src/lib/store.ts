"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getQuest, questXP, WRITEUP_XP } from "@/data/quests";
import { levelInfo } from "@/data/levels";
import { nextWorld } from "@/data/worlds";
import { dayKey } from "./date";
import { isWorldUnlocked, satisfiedAchievements, totalXP } from "./progress";
import { freshSave, SAVE_KEY, type SaveData, type VaultEntry } from "./save";
import { useUI } from "./ui";

export interface CompleteResult {
  ok: boolean;
  firstTime: boolean;
  xp: number;
}

interface Actions {
  completeOnboarding: (username: string, avatarId: string) => void;
  setProfile: (p: Partial<SaveData["profile"]>) => void;
  toggleObjective: (questId: string, objectiveId: string) => void;
  setActiveQuest: (questId: string | null) => void;
  completeQuest: (questId: string) => CompleteResult;
  replayQuest: (questId: string) => void;
  updateVault: (questId: string, patch: Partial<VaultEntry>) => void;
  publishWriteup: (questId: string, url: string) => void;
  markUnlockSeen: (worldId: string) => void;
  importSave: (data: SaveData) => void;
  resetProgress: () => void;
}

export type GameState = SaveData & Actions;

/** Extracts the plain save data from the store state. */
export function toSave(s: GameState): SaveData {
  return {
    version: s.version,
    profile: s.profile,
    onboarded: s.onboarded,
    quests: s.quests,
    vault: s.vault,
    xpLedger: s.xpLedger,
    activeDays: s.activeDays,
    achievements: s.achievements,
    activeQuestId: s.activeQuestId,
    seenUnlocks: s.seenUnlocks,
  };
}

function withActivity(days: string[]): string[] {
  const today = dayKey();
  return days.includes(today) ? days : [...days, today];
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      /** Run after any mutation that could unlock achievements or level-ups. */
      const settle = (prevXP: number) => {
        const s = get();
        const save = toSave(s);
        const now = new Date().toISOString();
        const fresh = satisfiedAchievements(save).filter((id) => !s.achievements[id]);
        if (fresh.length) {
          set({ achievements: { ...s.achievements, ...Object.fromEntries(fresh.map((id) => [id, now])) } });
          fresh.forEach((achievementId) => useUI.getState().celebrate({ kind: "achievement", achievementId }));
        }
        const before = levelInfo(prevXP).level;
        const after = levelInfo(totalXP(save)).level;
        if (after > before) useUI.getState().celebrate({ kind: "level", level: after });
      };

      return {
        ...freshSave(),

        completeOnboarding: (username, avatarId) =>
          set((s) => ({
            onboarded: true,
            profile: { ...s.profile, username: username.trim() || "Apprentice", avatarId },
            activeQuestId: s.activeQuestId ?? "w1-q-tensors",
          })),

        setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

        toggleObjective: (questId, objectiveId) => {
          const s = get();
          const quest = getQuest(questId);
          if (!quest || !isWorldUnlocked(toSave(s), quest.worldId)) return;
          const prev = s.quests[questId] ?? { done: [], timesCompleted: 0 };
          const has = prev.done.includes(objectiveId);
          const done = has ? prev.done.filter((d) => d !== objectiveId) : [...prev.done, objectiveId];
          set({
            quests: {
              ...s.quests,
              [questId]: { ...prev, done, startedAt: prev.startedAt ?? new Date().toISOString() },
            },
            activeDays: has ? s.activeDays : withActivity(s.activeDays),
            activeQuestId: prev.completedAt ? s.activeQuestId : questId,
          });
          if (!has) settle(totalXP(toSave(get())));
        },

        setActiveQuest: (questId) => set({ activeQuestId: questId }),

        completeQuest: (questId) => {
          const s = get();
          const quest = getQuest(questId);
          const fail = { ok: false, firstTime: false, xp: 0 };
          if (!quest) return fail;
          const save = toSave(s);
          if (!isWorldUnlocked(save, quest.worldId)) return fail;
          const prev = s.quests[questId] ?? { done: [], timesCompleted: 0 };
          const allDone = quest.objectives.every((o) => prev.done.includes(o.id));
          if (!allDone) return fail;

          const prevXP = totalXP(save);
          const now = new Date().toISOString();
          const ledgerId = `quest:${questId}`;
          const firstTime = !s.xpLedger.some((e) => e.id === ledgerId);
          const xp = firstTime ? questXP(quest) : 0;

          set({
            quests: {
              ...s.quests,
              [questId]: { ...prev, completedAt: prev.completedAt ?? now, timesCompleted: prev.timesCompleted + 1 },
            },
            xpLedger: firstTime ? [...s.xpLedger, { id: ledgerId, amount: xp, label: quest.title, at: now }] : s.xpLedger,
            activeDays: withActivity(s.activeDays),
            activeQuestId: s.activeQuestId === questId ? null : s.activeQuestId,
          });

          const ui = useUI.getState();
          if (quest.type === "boss" && firstTime) {
            ui.celebrate({ kind: "boss", questId, nextWorldId: nextWorld(quest.worldId)?.id });
          } else {
            ui.celebrate({ kind: "xp", amount: xp, label: firstTime ? quest.title : `${quest.title} · replay complete` });
          }
          settle(prevXP);
          return { ok: true, firstTime, xp };
        },

        replayQuest: (questId) =>
          set((s) => {
            const prev = s.quests[questId];
            if (!prev) return {};
            return { quests: { ...s.quests, [questId]: { ...prev, done: [] } }, activeQuestId: questId };
          }),

        updateVault: (questId, patch) => {
          const prevXP = totalXP(toSave(get()));
          set((s) => ({ vault: { ...s.vault, [questId]: { ...s.vault[questId], ...patch } } }));
          settle(prevXP);
        },

        publishWriteup: (questId, url) => {
          const s = get();
          const quest = getQuest(questId);
          if (!quest || !url.trim()) return;
          const prevXP = totalXP(toSave(s));
          const now = new Date().toISOString();
          const ledgerId = `writeup:${questId}`;
          const firstTime = !s.xpLedger.some((e) => e.id === ledgerId);
          set({
            vault: {
              ...s.vault,
              [questId]: { ...s.vault[questId], writeupUrl: url.trim(), writeupPublishedAt: s.vault[questId]?.writeupPublishedAt ?? now },
            },
            xpLedger: firstTime
              ? [...s.xpLedger, { id: ledgerId, amount: WRITEUP_XP, label: `Write-up · ${quest.title}`, at: now }]
              : s.xpLedger,
            activeDays: withActivity(s.activeDays),
          });
          if (firstTime) useUI.getState().celebrate({ kind: "xp", amount: WRITEUP_XP, label: "Project write-up published" });
          settle(prevXP);
        },

        markUnlockSeen: (worldId) =>
          set((s) => (s.seenUnlocks.includes(worldId) ? {} : { seenUnlocks: [...s.seenUnlocks, worldId] })),

        importSave: (data) => set({ ...freshSave(), ...data }),

        resetProgress: () => set({ ...freshSave() }),
      };
    },
    {
      name: SAVE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => toSave(s),
    },
  ),
);
