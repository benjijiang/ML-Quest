import type { Quest, QuestType, WorldId } from "../types";
import { WORLD1_QUESTS } from "./world1";
import { WORLD2TO5_QUESTS } from "./worlds2to5";

export const QUESTS: Quest[] = [...WORLD1_QUESTS, ...WORLD2TO5_QUESTS];

export const QUEST_BY_ID: Record<string, Quest> = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

export function getQuest(id: string | null | undefined): Quest | undefined {
  return id ? QUEST_BY_ID[id] : undefined;
}

export function questsForWorld(worldId: WorldId): Quest[] {
  return QUESTS.filter((q) => q.worldId === worldId);
}

/** XP table — rewards demonstrated learning, not time spent. */
export const XP_REWARDS: Record<QuestType, number> = {
  concept: 20,
  challenge: 40,
  project: 100,
  boss: 200,
};

export const WRITEUP_XP = 30;

export const QUEST_TYPE_META: Record<QuestType, { label: string; plural: string; color: string }> = {
  concept: { label: "Concept Quest", plural: "Concept Quests", color: "#00E5FF" },
  challenge: { label: "Coding Challenge", plural: "Coding Challenges", color: "#8B5CF6" },
  project: { label: "Mini-Project", plural: "Mini-Projects", color: "#34D399" },
  boss: { label: "Boss Battle", plural: "Boss Battles", color: "#CDB07A" },
};

export function questXP(q: Quest): number {
  return XP_REWARDS[q.type];
}
