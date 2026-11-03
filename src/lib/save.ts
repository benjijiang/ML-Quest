/**
 * Player save schema (v1).
 *
 * Designed to map 1:1 onto a future backend:
 *   users(id, username, avatar_id, created_at, onboarded)
 *   quest_progress(user_id, quest_id, done[], completed_at, times_completed)
 *   vault_entries(user_id, quest_id, repo_url, writeup_url, notes)
 *   xp_events(user_id, id, amount, label, at)        ← append-only ledger
 *   activity_days(user_id, day)
 *   achievements(user_id, achievement_id, unlocked_at)
 */
export interface QuestProgress {
  /** Completed objective ids. */
  done: string[];
  startedAt?: string;
  /** First completion time — completion is permanent; replays don't clear it. */
  completedAt?: string;
  timesCompleted: number;
}

export interface VaultEntry {
  repoUrl?: string;
  writeupUrl?: string;
  writeupPublishedAt?: string;
  notes?: string;
}

export interface XpEvent {
  /** Idempotency key, e.g. "quest:w1-boss" or "writeup:w1-boss". */
  id: string;
  amount: number;
  label: string;
  at: string;
}

export interface SaveData {
  version: 1;
  profile: { username: string; avatarId: string; createdAt: string };
  onboarded: boolean;
  quests: Record<string, QuestProgress>;
  vault: Record<string, VaultEntry>;
  xpLedger: XpEvent[];
  activeDays: string[];
  achievements: Record<string, string>;
  activeQuestId: string | null;
  /** Worlds whose unlock animation has already been shown on the map. */
  seenUnlocks: string[];
}

export const SAVE_KEY = "ml-quest:save";

export function freshSave(): SaveData {
  return {
    version: 1,
    profile: { username: "Apprentice", avatarId: "synapse", createdAt: new Date().toISOString() },
    onboarded: false,
    quests: {},
    vault: {},
    xpLedger: [],
    activeDays: [],
    achievements: {},
    activeQuestId: null,
    seenUnlocks: ["w1"],
  };
}
