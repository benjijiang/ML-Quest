/**
 * Pure, side-effect-free selectors over the player's save data.
 * Everything that can be derived is derived — the save stores only facts
 * (objectives ticked, quests completed, XP events), never cached totals.
 */
import { ACHIEVEMENTS } from "@/data/achievements";
import { levelInfo } from "@/data/levels";
import { QUESTS, XP_REWARDS, getQuest, questsForWorld } from "@/data/quests";
import { SKILLS } from "@/data/skills";
import type { Quest, Skill, World, WorldId } from "@/data/types";
import { WORLDS, WORLD_BY_ID } from "@/data/worlds";
import { dayKey } from "./date";
import { computeStreak } from "./streak";
import type { SaveData } from "./save";

// ─────────────────────────── XP & level ───────────────────────────

export function totalXP(s: SaveData): number {
  return s.xpLedger.reduce((sum, e) => sum + e.amount, 0);
}

export function playerLevel(s: SaveData) {
  return levelInfo(totalXP(s));
}

// ─────────────────────────── Quests ───────────────────────────

export function isQuestComplete(s: SaveData, questId: string): boolean {
  return !!s.quests[questId]?.completedAt;
}

export function objectivesDone(s: SaveData, quest: Quest): number {
  const done = s.quests[quest.id]?.done ?? [];
  return quest.objectives.filter((o) => done.includes(o.id)).length;
}

export function questProgress(s: SaveData, quest: Quest): number {
  if (isQuestComplete(s, quest.id) && (s.quests[quest.id]?.done.length ?? 0) === 0) return 1;
  return objectivesDone(s, quest) / quest.objectives.length;
}

export type QuestStatus = "locked" | "available" | "in-progress" | "ready" | "completed";

export function questStatus(s: SaveData, quest: Quest): QuestStatus {
  if (!isWorldUnlocked(s, quest.worldId)) return "locked";
  if (isQuestComplete(s, quest.id)) return "completed";
  const n = objectivesDone(s, quest);
  if (n === quest.objectives.length) return "ready";
  if (n > 0) return "in-progress";
  return "available";
}

// ─────────────────────────── Worlds ───────────────────────────

export function isBossDefeated(s: SaveData, worldId: WorldId): boolean {
  return isQuestComplete(s, WORLD_BY_ID[worldId].bossQuestId);
}

export function isWorldUnlocked(s: SaveData, worldId: WorldId): boolean {
  const w = WORLD_BY_ID[worldId];
  if (w.index === 1) return true;
  return isBossDefeated(s, WORLDS[w.index - 2].id);
}

export type WorldStatus = "locked" | "unlocked" | "in-progress" | "completed";

export function worldProgress(s: SaveData, worldId: WorldId) {
  const qs = questsForWorld(worldId);
  const done = qs.filter((q) => isQuestComplete(s, q.id)).length;
  return { done, total: qs.length, pct: qs.length ? done / qs.length : 0 };
}

export function worldStatus(s: SaveData, worldId: WorldId): WorldStatus {
  if (!isWorldUnlocked(s, worldId)) return "locked";
  if (isBossDefeated(s, worldId)) return "completed";
  const qs = questsForWorld(worldId);
  const touched = qs.some((q) => isQuestComplete(s, q.id) || (s.quests[q.id]?.done.length ?? 0) > 0);
  return touched ? "in-progress" : "unlocked";
}

/** The furthest unlocked world that is not yet completed (or the last world). */
export function currentWorld(s: SaveData): World {
  const open = WORLDS.filter((w) => isWorldUnlocked(s, w.id) && !isBossDefeated(s, w.id));
  return open[0] ?? WORLDS[WORLDS.length - 1];
}

/** What the player should do next. */
export function nextMission(s: SaveData): Quest | undefined {
  const active = getQuest(s.activeQuestId);
  if (active && !isQuestComplete(s, active.id) && isWorldUnlocked(s, active.worldId)) return active;
  const world = currentWorld(s);
  const qs = questsForWorld(world.id).filter((q) => !isQuestComplete(s, q.id));
  // Prefer in-progress quests, then the first remaining non-boss quest, then the boss.
  return (
    qs.find((q) => objectivesDone(s, q) > 0) ??
    qs.find((q) => q.type !== "boss") ??
    qs[0] ??
    QUESTS.find((q) => isWorldUnlocked(s, q.worldId) && !isQuestComplete(s, q.id))
  );
}

/** Boss readiness: share of non-boss quests in the world completed. */
export function bossReadiness(s: SaveData, worldId: WorldId): number {
  const qs = questsForWorld(worldId).filter((q) => q.type !== "boss");
  return qs.filter((q) => isQuestComplete(s, q.id)).length / qs.length;
}

// ─────────────────────────── Skills ───────────────────────────

export type SkillStatus = "locked" | "available" | "in-progress" | "mastered";

export function skillProgress(s: SaveData, skill: Skill) {
  const done = skill.questIds.filter((id) => isQuestComplete(s, id)).length;
  return { done, total: skill.questIds.length, pct: done / skill.questIds.length };
}

export function isSkillMastered(s: SaveData, skill: Skill): boolean {
  return skill.questIds.every((id) => isQuestComplete(s, id));
}

export function skillStatus(s: SaveData, skill: Skill): SkillStatus {
  if (isSkillMastered(s, skill)) return "mastered";
  const { done } = skillProgress(s, skill);
  if (done > 0) return "in-progress";
  const prereqsMet = skill.prerequisites.every((p) => {
    const ps = SKILLS.find((x) => x.id === p);
    return ps ? isSkillMastered(s, ps) : true;
  });
  return prereqsMet ? "available" : "locked";
}

export function masteredSkills(s: SaveData): Skill[] {
  return SKILLS.filter((sk) => isSkillMastered(s, sk));
}

export function skillXP(skill: Skill): number {
  return skill.questIds.reduce((sum, id) => {
    const q = getQuest(id);
    return sum + (q ? XP_REWARDS[q.type] : 0);
  }, 0);
}

// ─────────────────────────── Stats ───────────────────────────

export function playerStats(s: SaveData) {
  const completed = QUESTS.filter((q) => isQuestComplete(s, q.id));
  return {
    questsCompleted: completed.length,
    challengesCompleted: completed.filter((q) => q.type === "challenge").length,
    projectsCompleted: completed.filter((q) => q.type === "project" || q.type === "boss").length,
    bossesDefeated: completed.filter((q) => q.type === "boss").length,
    skillsMastered: masteredSkills(s).length,
    totalSkills: SKILLS.length,
    worldsCompleted: WORLDS.filter((w) => isBossDefeated(s, w.id)).length,
    writeups: Object.values(s.vault).filter((v) => v.writeupUrl).length,
    completedToday: completed.filter((q) => s.quests[q.id]?.completedAt?.startsWith(dayKey())).length,
  };
}

// ─────────────────────────── Achievements ───────────────────────────

export function satisfiedAchievements(s: SaveData): string[] {
  const st = playerStats(s);
  const streak = computeStreak(s.activeDays);
  const lvl = playerLevel(s).level;
  const checks: Record<string, boolean> = {
    "first-quest": st.questsCompleted >= 1,
    "first-challenge": st.challengesCompleted >= 1,
    "five-challenges": st.challengesCompleted >= 5,
    "first-project": QUESTS.some((q) => q.type === "project" && isQuestComplete(s, q.id)),
    "first-writeup": st.writeups >= 1,
    "open-source": Object.values(s.vault).some((v) => !!v.repoUrl),
    "streak-3": streak.longest >= 3,
    "streak-7": streak.longest >= 7,
    "skills-5": st.skillsMastered >= 5,
    "level-5": lvl >= 5,
    "boss-w1": isBossDefeated(s, "w1"),
    "boss-w2": isBossDefeated(s, "w2"),
    "boss-w3": isBossDefeated(s, "w3"),
    "boss-w4": isBossDefeated(s, "w4"),
    "boss-w5": isBossDefeated(s, "w5"),
    "all-worlds": st.worldsCompleted === WORLDS.length,
  };
  return ACHIEVEMENTS.filter((a) => checks[a.id]).map((a) => a.id);
}

// ─────────────────────────── Vault ───────────────────────────

export function vaultProjects(s: SaveData): Quest[] {
  return QUESTS.filter((q) => (q.type === "project" || q.type === "boss") && isQuestComplete(s, q.id)).sort(
    (a, b) => (s.quests[b.id]?.completedAt ?? "").localeCompare(s.quests[a.id]?.completedAt ?? ""),
  );
}
