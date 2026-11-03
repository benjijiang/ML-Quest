import type { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-quest", name: "First Light", description: "Complete your first quest.", icon: "sparkles", tier: "bronze" },
  { id: "first-challenge", name: "Hello, World", description: "Complete your first coding challenge.", icon: "terminal", tier: "bronze" },
  { id: "five-challenges", name: "Code Runner", description: "Complete five coding challenges.", icon: "code", tier: "silver" },
  { id: "first-project", name: "Builder", description: "Ship your first mini-project.", icon: "rocket", tier: "silver" },
  { id: "first-writeup", name: "Scholar's Quill", description: "Publish your first project write-up.", icon: "pen", tier: "bronze" },
  { id: "open-source", name: "Open Source", description: "Link a GitHub repository to a vault project.", icon: "git", tier: "bronze" },
  { id: "streak-3", name: "Steady Signal", description: "Learn on three consecutive days.", icon: "activity", tier: "bronze" },
  { id: "streak-7", name: "Stable Orbit", description: "Keep a seven-day learning rhythm.", icon: "orbit", tier: "silver" },
  { id: "skills-5", name: "Skill Collector", description: "Master five skills.", icon: "gem", tier: "silver" },
  { id: "level-5", name: "Ascendant", description: "Reach level 5.", icon: "trending-up", tier: "silver" },
  { id: "boss-w1", name: "Neural Architect", description: "Defeat THE NEURAL ARCHITECT.", icon: "network", tier: "gold" },
  { id: "boss-w2", name: "Pattern Seer", description: "Defeat THE PATTERN SEER.", icon: "eye", tier: "gold" },
  { id: "boss-w3", name: "Equilibrium", description: "Defeat THE EQUILIBRIUM WARDEN.", icon: "scale", tier: "gold" },
  { id: "boss-w4", name: "Locomotion Engineer", description: "Defeat THE LOCOMOTION ENGINE.", icon: "bot", tier: "gold" },
  { id: "boss-w5", name: "Frontier Researcher", description: "Defeat THE FRONTIER ORACLE.", icon: "telescope", tier: "gold" },
  { id: "all-worlds", name: "Cartographer of Mind", description: "Complete every world.", icon: "crown", tier: "gold", secret: true },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
