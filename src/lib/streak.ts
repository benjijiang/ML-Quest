import { addDays, dayKey, daysBetween } from "./date";

/**
 * Learning rhythm — a deliberately forgiving streak.
 *
 * A streak continues as long as there is at most ONE rest day between
 * learning days. Rest is part of training; the system never punishes a
 * night of sleep or a day off, and it never awards XP for streaks.
 */
export const REST_DAYS_ALLOWED = 1;

export interface StreakInfo {
  /** Learning days in the current rhythm. */
  current: number;
  longest: number;
  totalDays: number;
  learnedToday: boolean;
  /** Whether the current rhythm is still alive. */
  alive: boolean;
  /** Last 7 days (oldest → today) with activity flags. */
  week: { key: string; active: boolean; isToday: boolean }[];
}

export function computeStreak(activeDays: string[], today: string = dayKey()): StreakInfo {
  const days = Array.from(new Set(activeDays)).sort();
  const set = new Set(days);

  // Longest chain
  let longest = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    if (i === 0 || daysBetween(days[i - 1], days[i]) > REST_DAYS_ALLOWED + 1) run = 1;
    else run++;
    longest = Math.max(longest, run);
  }

  // Current chain, ending at the most recent active day
  let current = 0;
  const last = days[days.length - 1];
  const alive = !!last && daysBetween(last, today) <= REST_DAYS_ALLOWED + 1;
  if (alive) {
    current = 1;
    for (let i = days.length - 1; i > 0; i--) {
      if (daysBetween(days[i - 1], days[i]) <= REST_DAYS_ALLOWED + 1) current++;
      else break;
    }
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(today, i - 6);
    return { key, active: set.has(key), isToday: key === today };
  });

  return { current, longest, totalDays: days.length, learnedToday: set.has(today), alive, week };
}
