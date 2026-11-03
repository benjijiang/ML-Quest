/**
 * Player levels. Threshold for level n: 25 · (n − 1) · (n + 2)
 *   L2 = 100, L3 = 250, L4 = 450, L5 = 700, L6 = 1000 …
 * The full curriculum (≈ 2,700 XP incl. write-ups) lands near level 10.
 */
export const LEVEL_TITLES = [
  "AI Apprentice",
  "Tensor Initiate",
  "Gradient Walker",
  "Network Builder",
  "Deep Learner",
  "Pattern Architect",
  "Policy Strategist",
  "Embodiment Engineer",
  "Research Scholar",
  "Frontier Researcher",
  "AI Researcher",
];

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level + 2);
}

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  /** XP at the start of the current level. */
  floor: number;
  /** XP required for the next level. */
  ceil: number;
  /** 0–1 progress through the current level. */
  progress: number;
  toNext: number;
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return {
    level,
    title: levelTitle(level),
    xp,
    floor,
    ceil,
    progress: (xp - floor) / (ceil - floor),
    toNext: ceil - xp,
  };
}
