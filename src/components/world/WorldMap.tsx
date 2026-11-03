"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Lock, Swords } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ParticleField } from "@/components/fx/ParticleField";
import { Badge, ButtonLink, HudLabel, PageHeader, Panel, ProgressBar } from "@/components/ui/primitives";
import { getQuest } from "@/data/quests";
import type { World, WorldId } from "@/data/types";
import { WORLDS } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { currentWorld, worldProgress, worldStatus, type WorldStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { WorldEmblem } from "./WorldEmblem";

/** Node positions in a 1000 × 600 coordinate space. */
const POS: Record<WorldId, [number, number]> = {
  w1: [120, 380],
  w2: [310, 190],
  w3: [500, 370],
  w4: [690, 180],
  w5: [870, 330],
};

function segment(a: [number, number], b: [number, number]) {
  const dx = (b[0] - a[0]) * 0.5;
  return `M ${a[0]} ${a[1]} C ${a[0] + dx} ${a[1]}, ${b[0] - dx} ${b[1]}, ${b[0]} ${b[1]}`;
}

export const STATUS_LABEL: Record<WorldStatus, string> = {
  locked: "Locked",
  unlocked: "Unlocked",
  "in-progress": "In progress",
  completed: "Completed",
};

export function WorldMap() {
  const game = useGame();
  const router = useRouter();
  const reduce = useReducedMotion();
  const cur = currentWorld(game);
  const [focus, setFocus] = useState<WorldId>(cur.id);
  const focused = WORLDS.find((w) => w.id === focus)!;

  // Worlds that became unlocked since the map was last viewed get a reveal animation.
  const freshUnlocks = useMemo(
    () => WORLDS.filter((w) => worldStatus(game, w.id) !== "locked" && !game.seenUnlocks.includes(w.id)).map((w) => w.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const markUnlockSeen = useGame((s) => s.markUnlockSeen);
  useEffect(() => {
    if (!freshUnlocks.length) return;
    const t = setTimeout(() => freshUnlocks.forEach((id) => markUnlockSeen(id)), 2500);
    return () => clearTimeout(t);
  }, [freshUnlocks, markUnlockSeen]);

  return (
    <div>
      <PageHeader
        eyebrow="World Map"
        title="Chart Your Ascent"
        description="Five worlds, each guarded by a Boss Battle. Defeat a boss to light the path to the next world. Locked worlds can always be previewed."
      >
        <div className="flex items-center gap-4 text-[11px] text-ink-faint">
          <Legend className="bg-gold" label="Completed" />
          <Legend className="bg-cyan" label="Active" />
          <Legend className="bg-ink-faint/40" label="Locked" />
        </div>
      </PageHeader>

      {/* Desktop map */}
      <Panel className="relative hidden overflow-hidden md:block" glow>
        <div className="relative aspect-[1000/600] w-full">
          <div className="grid-bg absolute inset-0 opacity-70" aria-hidden="true" />
          {WORLDS.map((w) => (
            <div
              key={w.id}
              aria-hidden="true"
              className="absolute h-[44%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] transition-opacity duration-700"
              style={{
                left: `${POS[w.id][0] / 10}%`,
                top: `${POS[w.id][1] / 6}%`,
                background: worldStatus(game, w.id) === "locked" ? "rgba(90,100,118,0.06)" : `${w.theme.accent}14`,
              }}
            />
          ))}
          <ParticleField density={0.00004} />

          {/* Paths */}
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="path-lit" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#00E5FF" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
              <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {WORLDS.slice(0, -1).map((w, i) => {
              const nextW = WORLDS[i + 1];
              const d = segment(POS[w.id], POS[nextW.id]);
              const lit = worldStatus(game, w.id) === "completed";
              const fresh = freshUnlocks.includes(nextW.id);
              return (
                <g key={w.id}>
                  <path d={d} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="1.2" strokeDasharray="3 7" />
                  {lit && (
                    <>
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="url(#path-lit)"
                        strokeWidth="2"
                        filter="url(#path-glow)"
                        initial={{ pathLength: fresh ? 0 : 1, opacity: fresh ? 0 : 0.9 }}
                        animate={{ pathLength: 1, opacity: 0.9 }}
                        transition={{ duration: fresh ? 2.2 : 0, delay: fresh ? 0.6 : 0, ease: "easeInOut" }}
                      />
                      {!reduce && (
                        <circle r="2.6" fill="#E8FDFF">
                          <animateMotion dur="3.2s" repeatCount="indefinite" path={d} />
                        </circle>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {WORLDS.map((w, i) => (
            <MapNode
              key={w.id}
              world={w}
              status={worldStatus(game, w.id)}
              pct={worldProgress(game, w.id).pct}
              active={focus === w.id}
              current={cur.id === w.id}
              fresh={freshUnlocks.includes(w.id)}
              delay={i * 0.08}
              onFocus={() => setFocus(w.id)}
              onOpen={() => router.push(`/world-map/${w.id}`)}
            />
          ))}

          <div className="hud-label absolute bottom-4 left-5">Sector map · ML-Q/01–05</div>
          <div className="hud-label absolute bottom-4 right-5">Hover or focus a world to inspect · Enter to travel</div>
        </div>
      </Panel>

      {/* Mobile: vertical route */}
      <ol className="relative space-y-4 md:hidden">
        <span className="absolute bottom-6 left-[39px] top-6 w-px bg-gradient-to-b from-cyan/40 via-violet/30 to-gold/30" aria-hidden="true" />
        {WORLDS.map((w) => {
          const st = worldStatus(game, w.id);
          return (
            <li key={w.id}>
              <Link href={`/world-map/${w.id}`} className="panel panel-hover relative flex items-center gap-4 p-4">
                <div className="rounded-full bg-void">
                  <WorldEmblem world={w} size={48} dim={st === "locked"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] tracking-[0.2em] text-ink-faint">WORLD 0{w.index}</div>
                  <div className={cn("text-[15px] font-medium", st === "locked" ? "text-ink-muted" : "text-ink")}>{w.name}</div>
                  <ProgressBar value={worldProgress(game, w.id).pct} height={3} className="mt-2" color={st === "completed" ? "gold" : w.theme.accent} />
                </div>
                <StatusChip status={st} />
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Inspector */}
      <div className="mt-6 hidden md:block">
        <Inspector world={focused} />
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", className)} />
      {label}
    </span>
  );
}

export function StatusChip({ status }: { status: WorldStatus }) {
  if (status === "completed")
    return (
      <Badge color="#CDB07A">
        <Check size={10} strokeWidth={3} /> Cleared
      </Badge>
    );
  if (status === "locked")
    return (
      <Badge>
        <Lock size={10} /> Locked
      </Badge>
    );
  return <Badge color="#00E5FF">{status === "in-progress" ? "In progress" : "Unlocked"}</Badge>;
}

function MapNode({
  world,
  status,
  pct,
  active,
  current,
  fresh,
  delay,
  onFocus,
  onOpen,
}: {
  world: World;
  status: WorldStatus;
  pct: number;
  active: boolean;
  current: boolean;
  fresh: boolean;
  delay: number;
  onFocus: () => void;
  onOpen: () => void;
}) {
  const [x, y] = POS[world.id];
  const locked = status === "locked";
  const done = status === "completed";
  const size = 104;
  const r = 60;
  const c = 2 * Math.PI * r;

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x / 10}%`, top: `${y / 6}%` }}>
    <motion.button
      className="group relative flex flex-col items-center outline-none"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: fresh ? 2.4 : delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onOpen}
      aria-label={`World ${world.index}: ${world.name}. ${STATUS_LABEL[status]}. ${Math.round(pct * 100)}% complete.`}
    >
      <div className="relative grid place-items-center" style={{ width: size + 36, height: size + 36 }}>
        {/* Progress ring */}
        <svg viewBox="0 0 140 140" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="rgba(8,10,15,0.85)" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
          {!locked && (
            <motion.circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={done ? "#CDB07A" : world.theme.accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c * (1 - pct) }}
              transition={{ duration: 1.4, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ filter: `drop-shadow(0 0 5px ${done ? "#CDB07A" : world.theme.accent})` }}
            />
          )}
        </svg>
        {/* Pulse for the current world */}
        {current && !done && (
          <span className="absolute inset-[14px] animate-ping rounded-full border opacity-20 [animation-duration:2.8s]" style={{ borderColor: world.theme.accent }} aria-hidden="true" />
        )}
        <div className={cn("relative transition-transform duration-500 group-hover:scale-[1.06] group-focus-visible:scale-[1.06]", active && "scale-[1.04]")}>
          <WorldEmblem world={world} size={size - 18} dim={locked} />
        </div>
        {/* Corner state badge */}
        <span
          className={cn(
            "absolute right-[18px] top-[18px] grid h-6 w-6 place-items-center rounded-full border bg-void",
            done ? "border-gold/60 text-gold" : locked ? "border-line-strong text-ink-faint" : "border-cyan/50 text-cyan",
          )}
          aria-hidden="true"
        >
          {done ? <Check size={12} strokeWidth={3} /> : locked ? <Lock size={11} /> : <span className="font-mono text-[10px]">{Math.round(pct * 100)}</span>}
        </span>
        {/* Focus ring */}
        <span className="pointer-events-none absolute inset-[6px] rounded-full ring-0 ring-cyan/70 transition-all group-focus-visible:ring-2" aria-hidden="true" />
      </div>
      <div className="absolute left-1/2 top-full -mt-3 -translate-x-1/2 text-center">
        <div className="font-mono text-[10px] tracking-[0.24em] text-ink-faint">WORLD 0{world.index}</div>
        <div className={cn("mt-0.5 whitespace-nowrap text-[13.5px] font-medium transition-colors", locked ? "text-ink-muted" : "text-ink", active && !locked && "text-white")} style={active && !locked ? { textShadow: `0 0 18px ${world.theme.accent}` } : undefined}>
          {world.name}
        </div>
      </div>
    </motion.button>
    </div>
  );
}

function Inspector({ world }: { world: World }) {
  const game = useGame();
  const st = worldStatus(game, world.id);
  const p = worldProgress(game, world.id);
  const boss = getQuest(world.bossQuestId)!;
  const prev = WORLDS[world.index - 2];
  return (
    <motion.div key={world.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Panel className="grid gap-6 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-4">
          <WorldEmblem world={world} size={64} dim={st === "locked"} />
          <div>
            <HudLabel>World 0{world.index}</HudLabel>
            <div className="display text-xl font-semibold" style={{ color: st === "locked" ? undefined : world.theme.accent }}>
              {world.name}
            </div>
            <div className="mt-1">
              <StatusChip status={st} />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <HudLabel className="mb-1.5">Topics</HudLabel>
            <ul className="space-y-0.5 text-[13px] text-ink-muted">
              {world.topics.map((t) => (
                <li key={t.id}>{t.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <HudLabel className="mb-1.5">Boss</HudLabel>
            <div className="flex items-start gap-1.5 text-[13px] text-gold-soft">
              <Swords size={13} className="mt-0.5 shrink-0" /> {boss.title}
            </div>
            {st === "locked" && prev && <div className="mt-2 text-[11.5px] text-ink-faint">Requires: defeat the {prev.name} boss</div>}
          </div>
          <div>
            <HudLabel className="mb-1.5">Completion</HudLabel>
            <div className="font-mono text-lg tabular-nums">{Math.round(p.pct * 100)}%</div>
            <div className="text-[11.5px] text-ink-faint">
              {p.done} of {p.total} quests
            </div>
          </div>
        </div>
        <ButtonLink href={`/world-map/${world.id}`} variant={st === "locked" ? "secondary" : "primary"}>
          {st === "locked" ? "Preview world" : st === "completed" ? "Replay world" : "Enter world"} <ChevronRight size={15} />
        </ButtonLink>
      </Panel>
    </motion.div>
  );
}
