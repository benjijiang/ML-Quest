import { QUESTS } from "@/data/quests";
import type { Quest } from "@/data/types";
import { dayKey } from "./date";
import { currentWorld, isWorldUnlocked } from "./progress";
import type { SaveData } from "./save";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Three small, achievable quests for today. Picks are stable for the whole
 * day: quests completed today stay in the list (shown as done) instead of
 * being replaced, so the list never turns into an endless treadmill.
 */
export function dailyQuests(s: SaveData, today: string = dayKey()): Quest[] {
  const world = currentWorld(s);
  const eligible = (q: Quest) => {
    const at = s.quests[q.id]?.completedAt;
    return (q.type === "concept" || q.type === "challenge") && isWorldUnlocked(s, q.worldId) && (!at || at.startsWith(today));
  };
  const pool = QUESTS.filter(eligible);
  const rank = (q: Quest) => (q.worldId === world.id ? 0 : 1) * 1e10 + (hash(today + q.id) % 1e9);
  const sorted = [...pool].sort((a, b) => rank(a) - rank(b));
  // Prefer a gentle mix: at least one concept quest when available.
  const picks: Quest[] = [];
  const concept = sorted.find((q) => q.type === "concept");
  if (concept) picks.push(concept);
  for (const q of sorted) {
    if (picks.length >= 3) break;
    if (!picks.includes(q)) picks.push(q);
  }
  return picks;
}
