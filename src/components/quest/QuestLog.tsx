"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { HudLabel, PageHeader, Panel, ProgressBar } from "@/components/ui/primitives";
import { WorldEmblem } from "@/components/world/WorldEmblem";
import { QUEST_TYPE_META, QUESTS, WRITEUP_XP, XP_REWARDS } from "@/data/quests";
import type { QuestType, WorldId } from "@/data/types";
import { WORLDS } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { questStatus, worldStatus, type QuestStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { QuestCard } from "./QuestCard";

type TypeFilter = "all" | QuestType;
type StatusFilter = "all" | "active" | "available" | "completed";

const STATUS_MATCH: Record<StatusFilter, (s: QuestStatus) => boolean> = {
  all: () => true,
  active: (s) => s === "in-progress" || s === "ready",
  available: (s) => s === "available" || s === "in-progress" || s === "ready",
  completed: (s) => s === "completed",
};

export function QuestLog() {
  const game = useGame();
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [world, setWorld] = useState<"all" | WorldId>("all");

  const filtered = useMemo(
    () =>
      QUESTS.filter(
        (q) => (type === "all" || q.type === type) && (world === "all" || q.worldId === world) && STATUS_MATCH[status](questStatus(game, q)),
      ),
    [game, type, status, world],
  );

  const counts = (t: QuestType) => {
    const all = QUESTS.filter((q) => q.type === t);
    return { done: all.filter((q) => questStatus(game, q) === "completed").length, total: all.length };
  };

  return (
    <div>
      <PageHeader
        eyebrow="Quest Log"
        title="Missions & Challenges"
        description="Small daily concepts, hands-on coding challenges, multi-skill mini-projects and world-ending boss battles. Tick objectives as you go — progress saves automatically."
      />

      {/* Type overview / XP economy */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(Object.keys(QUEST_TYPE_META) as QuestType[]).map((t) => {
          const c = counts(t);
          const meta = QUEST_TYPE_META[t];
          const active = type === t;
          return (
            <button
              key={t}
              onClick={() => setType(active ? "all" : t)}
              aria-pressed={active}
              className={cn("panel panel-hover p-4 text-left", active && "border-white/20")}
              style={active ? { boxShadow: `0 0 0 1px ${meta.color}55` } : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: meta.color }}>
                  {meta.plural}
                </span>
                <span className="font-mono text-[11px] text-gold">+{XP_REWARDS[t]}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="display text-2xl font-semibold tabular-nums">{c.done}</span>
                <span className="text-[12px] text-ink-faint">/ {c.total}</span>
              </div>
              <ProgressBar value={c.done / c.total} height={3} className="mt-2" color={meta.color} label={`${meta.plural} completed`} />
            </button>
          );
        })}
        <Panel className="col-span-2 p-4 lg:col-span-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">Project write-ups</span>
          <div className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">
            Publish a write-up for any vault project for <span className="text-gold">+{WRITEUP_XP} XP</span>.
          </div>
        </Panel>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <FilterGroup
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            ["all", "All"],
            ["available", "Available"],
            ["active", "In progress"],
            ["completed", "Completed"],
          ]}
        />
        <FilterGroup
          label="World"
          value={world}
          onChange={setWorld}
          options={[["all", "All worlds"], ...WORLDS.map((w) => [w.id, `0${w.index}`] as [WorldId, string])]}
        />
        {type !== "all" && (
          <button onClick={() => setType("all")} className="text-[12px] text-ink-faint underline-offset-4 hover:text-ink hover:underline">
            Clear type filter
          </button>
        )}
        <span className="ml-auto font-mono text-[11px] text-ink-faint">{filtered.length} quests</span>
      </div>

      {/* Grouped by world */}
      <div className="space-y-10">
        {WORLDS.filter((w) => world === "all" || w.id === world).map((w) => {
          const qs = filtered.filter((q) => q.worldId === w.id);
          if (!qs.length) return null;
          const locked = worldStatus(game, w.id) === "locked";
          return (
            <motion.section key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-labelledby={`ql-${w.id}`}>
              <div className="mb-4 flex items-center gap-3">
                <WorldEmblem world={w} size={32} dim={locked} />
                <div>
                  <HudLabel>World 0{w.index}</HudLabel>
                  <h2 id={`ql-${w.id}`} className="text-[15px] font-medium" style={{ color: locked ? undefined : w.theme.accent }}>
                    {w.name}
                  </h2>
                </div>
                {locked && (
                  <span className="ml-2 flex items-center gap-1 text-[11.5px] text-ink-faint">
                    <Lock size={11} /> Preview
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {qs.map((q) => (
                  <QuestCard key={q.id} quest={q} />
                ))}
              </div>
            </motion.section>
          );
        })}
        {filtered.length === 0 && <Panel className="p-10 text-center text-[13px] text-ink-faint">No quests match these filters.</Panel>}
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-surface/60 p-1" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={cn("h-7 rounded-lg px-2.5 text-[12px] transition-colors", value === v ? "bg-white/[0.07] text-ink" : "text-ink-faint hover:text-ink")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
