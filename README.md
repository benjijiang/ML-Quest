# ML QUEST

**Level Up Your Intelligence.**

ML QUEST is a gamified learning platform. It turns the path through Machine Learning, Deep Learning, Reinforcement Learning and Embodied AI into an RPG-style progression: *Learn → Build → Conquer → Level Up.*

Five worlds, 42 quests, 26 skills and five boss battles. Each boss is a real project that ends up in your portfolio.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production
npm run typecheck
npm run lint
```

Progress is saved in your browser's `localStorage`. You can export, import or reset your save from **Settings** (the gear icon in the sidebar).

## What's inside

| Section | What it does |
| --- | --- |
| **Onboarding** | A five-step opening sequence: welcome, the five worlds, your identity (callsign and sigil), your first quest, then launch. |
| **Command Center** | Player profile with level ring, animated XP, active mission with **Continue Mission**, learning rhythm, stats, Daily Quests, world progress and achievements. |
| **World Map** | Five worlds on a connected path. Each has its own SVG emblem, a progress ring, and a locked, unlocked, in-progress or completed state. A completed boss lights the path to the next world, and newly unlocked worlds play a reveal animation. Locked worlds can always be previewed. |
| **World detail** | Topics, quest cards, boss readiness and prerequisites. Completed worlds stay replayable. |
| **Skill Tree** | A React Flow graph you can pan and zoom, with one lane per category. Mastered skills light up their outgoing connections. An inspector shows prerequisites, related coding challenges, associated projects and XP. There is also a keyboard-friendly **List** view. |
| **Quest Log** | Every quest, filterable by type, status and world. Each quest drawer has its objectives checklist, completion criteria, resources and skills. |
| **Boss Battle** | A full-screen, multi-stage project. A "boss integrity" bar drops as you complete objectives, and finishing them all plays the **BOSS DEFEATED** sequence. |
| **Research Vault** | Portfolio cards for completed projects and bosses: technologies, skills, completion date, an editable GitHub link and write-up publishing. All achievements are listed here too. |

## Progression rules

| Action | XP |
| --- | --- |
| Concept quest | +20 |
| Coding challenge | +40 |
| Mini-project | +100 |
| Defeat a world boss | +200 |
| Publish a project write-up | +30 |

- **Levels** follow `25 · (n − 1) · (n + 2)` XP, with titles from *AI Apprentice* up to *Frontier Researcher*. The full curriculum lands around level 10.
- **XP is an append-only ledger with idempotency keys.** Replaying a quest never awards XP twice.
- **Defeating a boss unlocks the next world.** You can challenge a boss at any time. The readiness meter is advice, not a gate.
- **Streaks are forgiving.** A single rest day never breaks your learning rhythm. Streaks award no XP, and the dashboard suggests a break after a big session.
- **Completion is self-reported** and labelled that way in the UI. There is no fake AI grading. The save model leaves room for GitHub-based verification later.

## Architecture

```
src/
  app/                  Next.js App Router
    (game)/             Pages with the sidebar shell: /, /world-map, /skill-tree, /quests, /vault
    boss/[worldId]/     Full-screen boss battles
  data/                 Static, versioned content (worlds, quests, skills, achievements, levels)
  lib/
    save.ts             Persisted save schema (v1), designed to map onto database tables
    store.ts            Zustand store and actions (persisted to localStorage)
    progress.ts         Pure selectors: XP, levels, world/quest/skill status, achievements
    streak.ts           Forgiving learning-rhythm calculation
    daily.ts            Deterministic daily quest picks
    ui.ts               Transient UI state (quest drawer, celebrations queue)
  components/           Shell, UI primitives, onboarding, dashboard, world, skills, quest, boss, vault, effects
```

- **Content is kept separate from progress.** The save only references content by stable IDs, and every total (XP, levels, mastery, unlocks) is derived from it. Moving to authentication and a database means replacing the persistence layer in `store.ts`. The schema comment in `save.ts` sketches the tables.
- **Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, React Flow (`@xyflow/react`), Zustand, Lucide icons, Geist and Oxanium fonts. Fonts are bundled locally, so the build doesn't need network access.

## Accessibility

- Everything is reachable by keyboard. Dialogs trap focus, restore it when they close, and close on Escape (only the topmost dialog responds).
- Number keys **1–5** jump between the five sections.
- Checklists use native checkboxes. Progress bars and rings have ARIA labels, and skill nodes carry ARIA labels.
- The app respects `prefers-reduced-motion`. Framer Motion uses `reducedMotion="user"`, the particle field renders one static frame, and the map's path pulse is turned off.

## Content

World 01 (Neural Network Valley) has fully written content with concrete, checkable objectives. For example, a hand-computed gradient descent quest, a micrograd-style autograd engine, numerical gradient checking, an MNIST MLP, and the boss *THE NEURAL ARCHITECT*: a NumPy-only network on two-moons. Worlds 02–05 have structured starter quests that follow the same rhythm.
