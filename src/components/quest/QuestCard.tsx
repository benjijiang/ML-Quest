"use client";

import { Check, ChevronRight, Clock, Lock, Swords } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DifficultyPips, ProgressBar, XpBadge } from "@/components/ui/primitives";
import { QUEST_TYPE_META, questXP } from "@/data/quests";
import type { Quest } from "@/data/types";
import { WORLD_BY_ID } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { questProgress, questStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { useUI } from "@/lib/ui";

export function useOpenQuest() {
  const openQuest = useUI((s) => s.openQuest);
  const router = useRouter();
  return (q: Quest) => (q.type === "boss" ? router.push(`/boss/${q.worldId}`) : openQuest(q.id));
}

export function QuestTypeTag({ quest }: { quest: Quest }) {
  const meta = QUEST_TYPE_META[quest.type];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: meta.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
      {meta.label}
    </span>
  );
}

export function QuestCard({ quest, showWorld, compact }: { quest: Quest; showWorld?: boolean; compact?: boolean }) {
  const game = useGame();
  const status = questStatus(game, quest);
  const progress = questProgress(game, quest);
  const open = useOpenQuest();
  const done = status === "completed";
  const locked = status === "locked";

  return (
    <motion.button
      layout="position"
      onClick={() => open(quest)}
      className={cn(
        "panel panel-hover group flex w-full flex-col p-4 text-left",
        done && "border-cyan/15",
        locked && "opacity-60",
        quest.type === "boss" && !locked && "edge-glow edge-glow-gold",
      )}
      aria-label={`${quest.title} — ${QUEST_TYPE_META[quest.type].label}, ${status.replace("-", " ")}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <QuestTypeTag quest={quest} />
          {showWorld && <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">World 0{WORLD_BY_ID[quest.worldId].index} · {WORLD_BY_ID[quest.worldId].name}</span>}
        </div>
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
            done ? "border-cyan/50 bg-cyan/15 text-cyan" : locked ? "border-line text-ink-faint" : "border-line-strong text-ink-faint",
          )}
        >
          {done ? <Check size={12} strokeWidth={3} /> : locked ? <Lock size={11} /> : quest.type === "boss" ? <Swords size={11} className="text-gold" /> : null}
        </span>
      </div>
      <h3 className={cn("mt-3 text-[14.5px] font-medium leading-snug", done ? "text-ink-muted" : "text-ink")}>{quest.title}</h3>
      {!compact && <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">{quest.summary}</p>}
      <div className="mt-auto pt-4">
        {status === "in-progress" || status === "ready" ? (
          <div className="mb-3 flex items-center gap-2">
            <ProgressBar value={progress} height={3} label="Objective progress" />
            <span className="font-mono text-[10px] text-ink-faint">{Math.round(progress * 100)}%</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-ink-faint">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {quest.estimate}
            </span>
            <DifficultyPips level={quest.difficulty} />
          </div>
          <div className="flex items-center gap-1">
            <XpBadge amount={questXP(quest)} className={done ? "opacity-50" : ""} />
            <ChevronRight size={14} className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
