"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Check, CheckCircle2, Clock, ExternalLink, Lock, RotateCcw, Swords, Trophy, X } from "lucide-react";
import Link from "next/link";
import { ParticleField } from "@/components/fx/ParticleField";
import { ObjectiveItem } from "@/components/quest/ObjectiveList";
import { Badge, Button, DifficultyPips, HudLabel, Panel, ProgressBar, SelfReportedNote, XpBadge } from "@/components/ui/primitives";
import { ACHIEVEMENT_BY_ID } from "@/data/achievements";
import { getQuest, questXP } from "@/data/quests";
import { SKILL_BY_ID } from "@/data/skills";
import type { WorldId } from "@/data/types";
import { previousWorld, WORLD_BY_ID } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { Icon } from "@/lib/icons";
import { objectivesDone, questStatus, skillStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { WorldEmblem } from "@/components/world/WorldEmblem";

export function BossBattle({ worldId }: { worldId: WorldId }) {
  const game = useGame();
  const world = WORLD_BY_ID[worldId];
  const quest = getQuest(world.bossQuestId)!;
  const boss = quest.boss!;
  const status = questStatus(game, quest);
  const locked = status === "locked";
  const n = objectivesDone(game, quest);
  const total = quest.objectives.length;
  const done = game.quests[quest.id]?.done ?? [];
  const defeated = status === "completed";
  const fullyChecked = n === total;
  const integrity = defeated && fullyChecked ? 0 : 1 - n / total;
  const achievement = ACHIEVEMENT_BY_ID[boss.achievementId];
  const prev = previousWorld(worldId);

  const stageDone = (idx: number) => quest.objectives.filter((o) => o.stage === idx).every((o) => done.includes(o.id));
  const currentStage = boss.stages.find((s) => !stageDone(s.index))?.index ?? boss.stages.length + 1;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-void">
      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-[-200px] h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(205,176,122,0.12),transparent_65%)]" />
        <div className="absolute bottom-[-200px] right-[-100px] h-[500px] w-[700px] rounded-full blur-[120px]" style={{ background: `${world.theme.accent}10` }} />
        <ParticleField color="205,176,122" density={0.00003} />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-void/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-8">
          <Link href={`/world-map/${world.id}`} className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink">
            <ArrowLeft size={14} /> {world.name}
          </Link>
          <div className="hud-label hidden text-gold/80 sm:block">Boss Battle · World 0{world.index}</div>
          <Link href="/world-map" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-faint hover:text-ink" aria-label="Exit boss battle">
            <X size={15} />
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1280px] px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="absolute inset-0 -m-6 animate-pulse-soft rounded-full border border-gold/15" aria-hidden="true" />
            <WorldEmblem world={world} size={110} dim={locked} />
          </motion.div>
          <motion.div initial={{ opacity: 0, letterSpacing: "0.9em" }} animate={{ opacity: 1, letterSpacing: "0.4em" }} transition={{ duration: 1.1, delay: 0.2 }} className="mt-8 font-mono text-[12px] uppercase text-gold">
            Boss 0{world.index}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="display mt-3 text-4xl font-bold tracking-[0.08em] text-gradient-gold sm:text-6xl lg:text-7xl"
          >
            {boss.codename}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-5 max-w-2xl text-[16px] text-ink">
            <span className="text-ink-faint">Mission — </span>
            {boss.mission}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Badge color="#A78BFA" className="gap-2 px-3 py-1">
              Threat <DifficultyPips level={quest.difficulty} />
            </Badge>
            <Badge className="px-3 py-1">
              <Clock size={11} /> {quest.estimate}
            </Badge>
            <Badge color="#CDB07A" className="px-3 py-1">
              Reward +{questXP(quest)} XP
            </Badge>
            {achievement && (
              <Badge color="#CDB07A" className="px-3 py-1">
                <Icon name={achievement.icon} size={11} /> “{achievement.name}”
              </Badge>
            )}
          </motion.div>

          {/* Boss integrity */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="mt-10 w-full max-w-xl">
            <div className="mb-2 flex items-center justify-between">
              <HudLabel className="text-gold/80">Boss integrity</HudLabel>
              <span className="font-mono text-[12px] tabular-nums text-ink-muted">{Math.round(integrity * 100)}%</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full border border-gold/20 bg-white/[0.03]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#9A8152] via-gold to-gold-soft"
                initial={{ width: "100%" }}
                animate={{ width: `${integrity * 100}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ boxShadow: "0 0 16px rgba(205,176,122,0.5)" }}
              />
              {Array.from({ length: total - 1 }, (_, i) => (
                <span key={i} className="absolute inset-y-0 w-px bg-void/70" style={{ left: `${((i + 1) / total) * 100}%` }} />
              ))}
            </div>
            <div className="mt-2 text-[11.5px] text-ink-faint">Each objective you complete deals damage. {n}/{total} objectives cleared.</div>
          </motion.div>
        </section>

        {/* Status banners */}
        {locked && (
          <div className="mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-xl border border-line-strong bg-surface/70 px-5 py-4 text-[13px] text-ink-muted">
            <Lock size={15} className="shrink-0 text-ink-faint" />
            Preview mode — defeat the {prev?.name} boss to engage this battle.
          </div>
        )}
        {defeated && (
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border border-gold/30 bg-gold/[0.05] px-5 py-4 text-[13px] text-gold-soft">
            <Trophy size={15} className="shrink-0" />
            Defeated on {formatDate(game.quests[quest.id]!.completedAt!)}. This project lives in your Research Vault.
            {fullyChecked && (
              <Button size="sm" variant="ghost" className="ml-auto text-gold-soft" onClick={() => game.replayQuest(quest.id)}>
                <RotateCcw size={13} /> Replay battle
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Sidebar intel */}
          <aside className="space-y-6">
            <Panel className="p-6">
              <HudLabel className="mb-3">Project overview</HudLabel>
              <h2 className="text-[15px] font-medium text-ink">{quest.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{quest.description}</p>
              {quest.technologies && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {quest.technologies.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="p-6">
              <HudLabel className="mb-3">Required skills</HudLabel>
              <ul className="space-y-2">
                {quest.skillIds.map((id) => {
                  const sk = SKILL_BY_ID[id];
                  const st = skillStatus(game, sk);
                  const prereqs = sk.prerequisites.map((p) => SKILL_BY_ID[p]);
                  return (
                    <li key={id}>
                      <Link href={`/skill-tree?skill=${id}`} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-line-strong">
                        <Icon name={sk.icon} size={15} className={st === "mastered" ? "text-cyan" : "text-ink-faint"} />
                        <span className="flex-1 text-[13px] text-ink">{sk.name}</span>
                        <span className={cn("font-mono text-[10px] uppercase tracking-wider", st === "mastered" ? "text-cyan" : "text-ink-faint")}>{st === "mastered" ? "Mastered" : st.replace("-", " ")}</span>
                      </Link>
                      {prereqs.length > 0 && <div className="mt-1 pl-3 text-[11px] text-ink-faint">Builds on: {prereqs.map((p) => p.name).join(", ")}</div>}
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel className="p-6">
              <HudLabel className="mb-3 flex items-center gap-2">
                <CheckCircle2 size={12} /> Victory conditions
              </HudLabel>
              <ul className="space-y-2.5">
                {quest.completionCriteria.map((c) => (
                  <li key={c} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {c}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="p-6">
              <HudLabel className="mb-3 flex items-center gap-2">
                <BookOpen size={12} /> Intel
              </HudLabel>
              <ul className="space-y-1.5">
                {quest.resources.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer noopener" className="group flex items-center justify-between gap-2 text-[12.5px] text-ink-muted hover:text-ink">
                      <span className="truncate">{r.title}</span>
                      <ExternalLink size={12} className="shrink-0 text-ink-faint group-hover:text-gold" />
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>

          {/* Stages */}
          <section aria-labelledby="stages-h">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <HudLabel className="mb-1 text-gold/80">Battle sequence</HudLabel>
                <h2 id="stages-h" className="display text-xl font-semibold">
                  {boss.stages.length} stages to victory
                </h2>
              </div>
              <span className="font-mono text-[12px] text-ink-faint">
                Stage {Math.min(currentStage, boss.stages.length)}/{boss.stages.length}
              </span>
            </div>
            <ol className="relative space-y-5">
              <span className="absolute bottom-8 left-[19px] top-8 w-px bg-gradient-to-b from-gold/40 via-line-strong to-line" aria-hidden="true" />
              {boss.stages.map((stage) => {
                const objs = quest.objectives.filter((o) => o.stage === stage.index);
                const sDone = stageDone(stage.index);
                const isCurrent = stage.index === currentStage;
                const cleared = objs.filter((o) => done.includes(o.id)).length;
                return (
                  <motion.li key={stage.index} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + stage.index * 0.08 }} className="relative pl-14">
                    <span
                      className={cn(
                        "absolute left-0 top-5 grid h-10 w-10 place-items-center rounded-xl border bg-void font-mono text-[13px]",
                        sDone ? "border-gold/60 text-gold shadow-glow-gold" : isCurrent ? "border-cyan/50 text-cyan shadow-glow" : "border-line-strong text-ink-faint",
                      )}
                      aria-hidden="true"
                    >
                      {sDone ? <Check size={16} strokeWidth={2.5} /> : `0${stage.index}`}
                    </span>
                    <Panel className={cn("p-5 transition-colors", isCurrent && !locked && "border-cyan/20", sDone && "border-gold/15")}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                            Stage 0{stage.index} {isCurrent && !locked && <span className="text-cyan">· Engaged</span>}
                            {sDone && <span className="text-gold">· Cleared</span>}
                          </div>
                          <h3 className="mt-1 text-[16px] font-medium text-ink">{stage.title}</h3>
                          <p className="mt-0.5 text-[12.5px] text-ink-muted">{stage.summary}</p>
                        </div>
                        <span className="font-mono text-[11px] text-ink-faint">
                          {cleared}/{objs.length}
                        </span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {objs.map((o) => (
                          <ObjectiveItem
                            key={o.id}
                            quest={quest}
                            objective={o}
                            index={quest.objectives.indexOf(o)}
                            disabled={locked || (defeated && fullyChecked)}
                            accent="#CDB07A"
                          />
                        ))}
                      </ul>
                    </Panel>
                  </motion.li>
                );
              })}
            </ol>

            {/* Claim */}
            <Panel glow={fullyChecked && !locked ? "gold" : undefined} className="mt-8 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[15px] font-medium text-ink">
                    <Swords size={16} className="text-gold" />
                    {defeated && fullyChecked ? "Boss defeated" : fullyChecked ? "The boss is vulnerable." : "Clear every objective to finish the boss."}
                  </div>
                  <ProgressBar value={n / total} height={4} color="gold" className="mt-3 max-w-sm" label="Battle progress" />
                  <SelfReportedNote className="mt-3 max-w-lg" />
                </div>
                {!(defeated && fullyChecked) && (
                  <Button variant="gold" size="lg" disabled={!fullyChecked || locked} onClick={() => game.completeQuest(quest.id)}>
                    <Trophy size={16} /> {defeated ? "Complete replay" : "Claim victory"} {!defeated && <XpBadge amount={questXP(quest)} className="text-void" />}
                  </Button>
                )}
              </div>
            </Panel>
          </section>
        </div>
      </main>
    </div>
  );
}
