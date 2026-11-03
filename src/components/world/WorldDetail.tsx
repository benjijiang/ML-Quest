"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, RotateCcw, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import { ParticleField } from "@/components/fx/ParticleField";
import { QuestCard } from "@/components/quest/QuestCard";
import { Badge, ButtonLink, DifficultyPips, HudLabel, Panel, ProgressBar, Ring, XpBadge } from "@/components/ui/primitives";
import { getQuest, questsForWorld, questXP } from "@/data/quests";
import type { WorldId } from "@/data/types";
import { nextWorld, previousWorld, WORLD_BY_ID } from "@/data/worlds";
import { bossReadiness, worldProgress, worldStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { StatusChip } from "./WorldMap";
import { WorldEmblem } from "./WorldEmblem";

export function WorldDetail({ worldId }: { worldId: WorldId }) {
  const game = useGame();
  const world = WORLD_BY_ID[worldId];
  const st = worldStatus(game, worldId);
  const p = worldProgress(game, worldId);
  const quests = questsForWorld(worldId);
  const boss = getQuest(world.bossQuestId)!;
  const prev = previousWorld(worldId);
  const next = nextWorld(worldId);
  const locked = st === "locked";
  const readiness = bossReadiness(game, worldId);

  return (
    <div className="space-y-10">
      <Link href="/world-map" className="inline-flex items-center gap-2 text-[13px] text-ink-faint hover:text-ink">
        <ArrowLeft size={14} /> World Map
      </Link>

      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Panel glow className="relative overflow-hidden">
          <div className="grid-bg absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full blur-[110px]" style={{ background: `${locked ? "#5A6476" : world.theme.accent}1F` }} aria-hidden="true" />
          <ParticleField density={0.00006} color={locked ? "148,163,184" : hexToRgb(world.theme.accent)} />
          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="justify-self-center">
              <WorldEmblem world={world} size={180} dim={locked} />
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <HudLabel className="text-ink-muted">World 0{world.index}</HudLabel>
                <StatusChip status={st} />
              </div>
              <h1 className="display mt-3 text-3xl font-semibold sm:text-5xl" style={{ color: locked ? undefined : world.theme.accent }}>
                {world.name}
              </h1>
              <p className="mt-2 text-[15px] text-ink">{world.tagline}</p>
              <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-muted">{world.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {world.topics.map((t) => (
                  <Badge key={t.id} color={locked ? undefined : world.theme.accent}>
                    {t.title}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 justify-self-center">
              <Ring value={p.pct} size={112} stroke={4} color={st === "completed" ? "#CDB07A" : world.theme.accent} label={`World ${Math.round(p.pct * 100)}% complete`}>
                <div className="text-center">
                  <div className="display text-2xl font-semibold tabular-nums">{Math.round(p.pct * 100)}%</div>
                  <div className="hud-label">explored</div>
                </div>
              </Ring>
              <div className="text-[12px] text-ink-faint">
                {p.done}/{p.total} quests
              </div>
            </div>
          </div>
          {locked && prev && (
            <div className="relative flex flex-wrap items-center gap-3 border-t border-line bg-white/[0.015] px-6 py-4 text-[13px] text-ink-muted sm:px-10">
              <Lock size={14} className="text-ink-faint" />
              <span>
                <span className="text-ink">Prerequisite:</span> defeat <span className="text-gold-soft">{getQuest(prev.bossQuestId)?.boss?.codename}</span> in {prev.name}. Preview everything below in the meantime.
              </span>
              <ButtonLink href={`/world-map/${prev.id}`} size="sm" variant="ghost" className="ml-auto">
                Go to {prev.name} <ArrowRight size={13} />
              </ButtonLink>
            </div>
          )}
          {st === "completed" && (
            <div className="relative flex items-center gap-3 border-t border-line bg-gold/[0.03] px-6 py-4 text-[13px] text-ink-muted sm:px-10">
              <Trophy size={14} className="text-gold" />
              World cleared. Every quest here is replayable — revisit them any time to sharpen your skills (no duplicate XP).
              <RotateCcw size={13} className="ml-auto text-ink-faint" />
            </div>
          )}
        </Panel>
      </motion.section>

      {/* Topics */}
      {world.topics.map((t, ti) => {
        const qs = quests.filter((q) => q.topicId === t.id);
        if (!qs.length) return null;
        const done = qs.filter((q) => game.quests[q.id]?.completedAt).length;
        return (
          <motion.section key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + ti * 0.08 }} aria-labelledby={`topic-${t.id}`}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <HudLabel className="mb-1" >Topic 0{ti + 1}</HudLabel>
                <h2 id={`topic-${t.id}`} className="display text-xl font-semibold">
                  {t.title}
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">{t.blurb}</p>
              </div>
              <div className="flex w-40 items-center gap-2">
                <ProgressBar value={done / qs.length} height={3} color={world.theme.accent} label={`${t.title} progress`} />
                <span className="font-mono text-[11px] text-ink-faint">
                  {done}/{qs.length}
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {qs.map((q) => (
                <QuestCard key={q.id} quest={q} />
              ))}
            </div>
          </motion.section>
        );
      })}

      {/* Boss */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} aria-labelledby="boss-h">
        <HudLabel className="mb-3 text-gold/80">Final challenge</HudLabel>
        <Panel glow="gold" className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(205,176,122,0.10),transparent_60%)]" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Swords size={18} className="text-gold" />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">Boss 0{world.index}</span>
              </div>
              <h2 id="boss-h" className="display mt-3 text-3xl font-bold tracking-[0.06em] text-gradient-gold sm:text-4xl">
                {boss.boss?.codename}
              </h2>
              <p className="mt-2 text-[15px] text-ink">{boss.boss?.mission}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[12px] text-ink-muted">
                <span className="flex items-center gap-2">
                  <HudLabel>Threat</HudLabel>
                  <DifficultyPips level={boss.difficulty} />
                </span>
                <span>{boss.estimate}</span>
                <span className="flex items-center gap-2">
                  <HudLabel>Reward</HudLabel>
                  <XpBadge amount={questXP(boss)} />
                </span>
                <span>{boss.boss?.stages.length} stages</span>
              </div>
              {!locked && st !== "completed" && (
                <div className="mt-6 max-w-md">
                  <div className="mb-1.5 flex justify-between text-[11.5px] text-ink-faint">
                    <span>Readiness — recommended quests cleared</span>
                    <span className="font-mono">{Math.round(readiness * 100)}%</span>
                  </div>
                  <ProgressBar value={readiness} height={4} color="gold" label="Boss readiness" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <ButtonLink href={`/boss/${world.id}`} variant={locked ? "secondary" : "gold"} size="lg">
                {locked ? <Lock size={15} /> : <Swords size={16} />}
                {locked ? "Preview Boss Battle" : st === "completed" ? "Replay Boss Battle" : "Enter Boss Battle"}
              </ButtonLink>
              {!locked && st !== "completed" && readiness < 1 && <p className="max-w-[240px] text-[11.5px] text-ink-faint lg:text-right">You may challenge the boss at any time — readiness is a recommendation, not a gate.</p>}
            </div>
          </div>
        </Panel>
      </motion.section>

      {/* Prev / next */}
      <nav className="flex items-center justify-between border-t border-line pt-6" aria-label="Adjacent worlds">
        {prev ? (
          <Link href={`/world-map/${prev.id}`} className="group flex items-center gap-3 text-[13px] text-ink-muted hover:text-ink">
            <ArrowLeft size={14} /> <WorldEmblem world={prev} size={28} /> {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/world-map/${next.id}`} className="group flex items-center gap-3 text-[13px] text-ink-muted hover:text-ink">
            {next.name} <WorldEmblem world={next} size={28} dim={worldStatus(game, next.id) === "locked"} /> <ArrowRight size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
