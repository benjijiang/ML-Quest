"use client";

import { BookOpen, Check, CheckCircle2, Clock, ExternalLink, Lock, RotateCcw, Target, X, Crosshair } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Badge, Button, DifficultyPips, HudLabel, ProgressBar, SelfReportedNote, XpBadge } from "@/components/ui/primitives";
import { getQuest, questXP } from "@/data/quests";
import { SKILL_BY_ID } from "@/data/skills";
import type { Quest } from "@/data/types";
import { previousWorld, WORLD_BY_ID } from "@/data/worlds";
import { formatDate } from "@/lib/date";
import { objectivesDone, questProgress, questStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { ObjectiveList } from "./ObjectiveList";
import { QuestTypeTag } from "./QuestCard";

export function QuestDrawer() {
  const id = useUI((s) => s.openQuestId);
  const close = useUI((s) => s.closeQuest);
  const quest = getQuest(id);
  return (
    <Modal open={!!quest} onClose={close} label={quest ? `Quest: ${quest.title}` : "Quest"} variant="drawer">
      {quest && <QuestDetail quest={quest} onClose={close} />}
    </Modal>
  );
}

const RESOURCE_LABEL: Record<string, string> = {
  docs: "Docs",
  video: "Video",
  article: "Article",
  book: "Book",
  paper: "Paper",
  course: "Course",
  repo: "Repo",
};

export function QuestDetail({ quest, onClose }: { quest: Quest; onClose: () => void }) {
  const game = useGame();
  const status = questStatus(game, quest);
  const progress = questProgress(game, quest);
  const n = objectivesDone(game, quest);
  const record = game.quests[quest.id];
  const world = WORLD_BY_ID[quest.worldId];
  const locked = status === "locked";
  const completedFully = status === "completed" && n === quest.objectives.length;
  const replaying = status === "completed" && n < quest.objectives.length;
  const prev = previousWorld(quest.worldId);
  const isActive = game.activeQuestId === quest.id;

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-line px-6 pb-6 pt-6 sm:px-8">
        <div className="grid-bg absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[90px]" style={{ background: `${world.theme.accent}18` }} aria-hidden="true" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <QuestTypeTag quest={quest} />
              <Link href={`/world-map/${world.id}`} onClick={onClose} className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint hover:text-ink-muted">
                World 0{world.index} · {world.name}
              </Link>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-faint hover:border-line-strong hover:text-ink" aria-label="Close quest">
              <X size={16} />
            </button>
          </div>
          <h2 className="display mt-4 text-2xl font-semibold leading-tight text-ink">{quest.title}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{quest.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-ink-muted">
            <span className="flex items-center gap-2">
              <HudLabel>Difficulty</HudLabel>
              <DifficultyPips level={quest.difficulty} />
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-ink-faint" /> {quest.estimate}
            </span>
            <span className="flex items-center gap-2">
              <HudLabel>Reward</HudLabel>
              <XpBadge amount={questXP(quest)} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-8 px-6 py-7 sm:px-8">
        {locked && (
          <div className="flex items-start gap-3 rounded-xl border border-line-strong bg-white/[0.02] p-4 text-sm text-ink-muted">
            <Lock size={16} className="mt-0.5 shrink-0 text-ink-faint" />
            <p>
              <span className="text-ink">Preview mode.</span> This world unlocks after you defeat the boss of{" "}
              <span className="text-ink">{prev?.name}</span>. Explore freely — objectives can be tracked once unlocked.
            </p>
          </div>
        )}

        {/* Objectives */}
        <section aria-labelledby="obj-h">
          <div className="mb-3 flex items-center justify-between">
            <h3 id="obj-h" className="flex items-center gap-2 text-sm font-medium text-ink">
              <Target size={15} className="text-cyan" /> Objectives
            </h3>
            <span className="font-mono text-[11px] text-ink-faint">
              {n}/{quest.objectives.length}
            </span>
          </div>
          <ProgressBar value={progress} height={3} className="mb-4" label="Quest progress" />
          <ObjectiveList quest={quest} disabled={locked || completedFully} />
          <SelfReportedNote className="mt-4" />
        </section>

        {/* Completion criteria */}
        <section aria-labelledby="crit-h">
          <h3 id="crit-h" className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <CheckCircle2 size={15} className="text-violet-soft" /> Completion criteria
          </h3>
          <ul className="space-y-2">
            {quest.completionCriteria.map((c) => (
              <li key={c} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-soft" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Skills */}
        <section aria-labelledby="skills-h">
          <h3 id="skills-h" className="mb-3 text-sm font-medium text-ink">Skills trained</h3>
          <div className="flex flex-wrap gap-2">
            {quest.skillIds.map((id) => (
              <Link key={id} href={`/skill-tree?skill=${id}`} onClick={onClose}>
                <Badge className="hover:border-cyan/40 hover:text-ink">{SKILL_BY_ID[id]?.name ?? id}</Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section aria-labelledby="res-h">
          <h3 id="res-h" className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <BookOpen size={15} className="text-ink-muted" /> Related resources
          </h3>
          <ul className="space-y-1.5">
            {quest.resources.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center justify-between gap-3 rounded-lg border border-line px-3.5 py-2.5 text-[13px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-faint">{RESOURCE_LABEL[r.kind]}</span>
                    <span className="truncate">{r.title}</span>
                  </span>
                  <ExternalLink size={13} className="shrink-0 text-ink-faint group-hover:text-cyan" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 border-t border-line bg-abyss/95 px-6 py-4 backdrop-blur-xl sm:px-8">
        {locked ? (
          <div className="flex items-center gap-2 text-sm text-ink-faint">
            <Lock size={14} /> Locked — defeat the {prev?.name} boss to begin.
          </div>
        ) : completedFully ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-cyan">
              <Check size={16} strokeWidth={2.5} /> Completed {record?.completedAt && formatDate(record.completedAt)}
            </div>
            <Button size="sm" variant="ghost" onClick={() => game.replayQuest(quest.id)}>
              <RotateCcw size={13} /> Replay quest
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            {!isActive ? (
              <Button size="sm" variant="ghost" onClick={() => game.setActiveQuest(quest.id)}>
                <Crosshair size={13} /> Set as active mission
              </Button>
            ) : (
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-cyan/80">● Active mission</span>
            )}
            <Button
              variant="primary"
              disabled={status !== "ready" && !(replaying && n === quest.objectives.length)}
              onClick={() => game.completeQuest(quest.id)}
            >
              {replaying ? "Complete replay" : `Complete quest · +${questXP(quest)} XP`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
