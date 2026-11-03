/**
 * ML QUEST — content data model.
 *
 * Content (worlds, quests, skills, achievements) is static and versioned with
 * the codebase. Player progress lives separately (see `src/lib/store.ts`) and
 * only references content by stable string ids, so it can later be moved to a
 * database keyed by user id without touching the content definitions.
 */

export type WorldId = "w1" | "w2" | "w3" | "w4" | "w5";

export type QuestType = "concept" | "challenge" | "project" | "boss";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Resource {
  title: string;
  url: string;
  kind: "docs" | "video" | "article" | "book" | "paper" | "course" | "repo";
}

export interface Objective {
  id: string;
  label: string;
  /** Optional extra guidance shown under the objective. */
  hint?: string;
  /** Boss battles group objectives into stages. */
  stage?: number;
}

export interface BossStage {
  index: number;
  title: string;
  summary: string;
}

export interface Quest {
  id: string;
  worldId: WorldId;
  /** Topic id within the world. Boss quests use the special topic "boss". */
  topicId: string;
  type: QuestType;
  title: string;
  /** One-line summary for cards. */
  summary: string;
  /** Longer description shown in quest detail. */
  description: string;
  difficulty: Difficulty;
  /** Human readable estimate, e.g. "45 min" or "3–5 h". */
  estimate: string;
  objectives: Objective[];
  /** How the learner knows the quest is genuinely complete. */
  completionCriteria: string[];
  resources: Resource[];
  /** Ids of skills this quest builds. */
  skillIds: string[];
  /** Tech stack used (projects & bosses — surfaced in the Research Vault). */
  technologies?: string[];
  boss?: BossInfo;
}

export interface BossInfo {
  codename: string; // e.g. "THE NEURAL ARCHITECT"
  mission: string;
  achievementId: string;
  stages: BossStage[];
}

export interface Topic {
  id: string;
  title: string;
  blurb: string;
}

export interface WorldTheme {
  /** Primary hue used for the world's emblem and accents. */
  accent: string;
  /** Secondary hue. */
  accent2: string;
  /** Emblem renderer key. */
  emblem: "neural" | "forest" | "arena" | "lab" | "frontier";
}

export interface World {
  id: WorldId;
  index: number; // 1-based
  name: string;
  tagline: string;
  description: string;
  topics: Topic[];
  bossQuestId: string;
  theme: WorldTheme;
}

export type SkillCategoryId = "math" | "ml" | "dl" | "rl" | "robotics" | "research";

export interface SkillCategory {
  id: SkillCategoryId;
  name: string;
  color: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategoryId;
  icon: string; // lucide icon key, see src/lib/icons.ts
  description: string;
  prerequisites: string[];
  /** Quests whose completion demonstrates this skill. */
  questIds: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  /** Hidden achievements show as "???" until unlocked. */
  secret?: boolean;
}
