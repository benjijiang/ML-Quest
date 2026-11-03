"use client";

import { motion } from "framer-motion";
import { Archive, ArrowRight, Check, Coffee, Flame, Gem, Pencil, ScrollText, Swords, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/fx/Avatar";
import { useCountUp } from "@/components/celebrate/CelebrationLayer";
import { QuestTypeTag, useOpenQuest } from "@/components/quest/QuestCard";
import { Button, ButtonLink, DifficultyPips, HudLabel, Panel, ProgressBar, Ring, XpBadge } from "@/components/ui/primitives";
import { WorldEmblem } from "@/components/world/WorldEmblem";
import { ACHIEVEMENTS } from "@/data/achievements";
import { questXP } from "@/data/quests";
import { levelTitle } from "@/data/levels";
import { WORLDS, WORLD_BY_ID } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { dailyQuests } from "@/lib/daily";
import { dayKey, parseDayKey } from "@/lib/date";
import { Icon } from "@/lib/icons";
import { currentWorld, nextMission, playerLevel, playerStats, questProgress, questStatus, worldProgress, worldStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { computeStreak, REST_DAYS_ALLOWED } from "@/lib/streak";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function CommandCenter() {
  const game = useGame();
  const lvl = playerLevel(game);
  const stats = playerStats(game);
  const streak = computeStreak(game.activeDays);
  const world = currentWorld(game);
  const mission = nextMission(game);
  const open = useOpenQuest();
  const xp = useCountUp(lvl.xp, 1.2);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={rise} className="flex items-center justify-between">
        <div>
          <HudLabel className="flex items-center gap-2 text-cyan/80">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cyan" />
            Command Center · Online
          </HudLabel>
        </div>
        <div className="hud-label hidden sm:block">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
      </motion.div>

      {/* ── Hero: player + active mission ── */}
      <motion.div variants={rise} className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Panel glow className="relative flex flex-col justify-between overflow-hidden p-6 sm:p-8">
          <div className="grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan/[0.07] blur-[80px]" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative w-fit">
              <Ring value={lvl.progress} size={116} stroke={3} label={`Level progress ${Math.round(lvl.progress * 100)}%`}>
                <Avatar id={game.profile.avatarId} size={84} ring />
              </Ring>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md border border-cyan/40 bg-void px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan">
                LV {lvl.level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <EditableName />
              <div className="mt-1 font-mono text-[12px] uppercase tracking-[0.2em] text-cyan/90">
                Level {lvl.level} — {lvl.title}
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <HudLabel>Total experience</HudLabel>
                  <div className="display mt-1 text-4xl font-semibold tabular-nums text-ink">
                    {xp.toLocaleString()}
                    <span className="ml-1.5 text-base text-ink-faint">XP</span>
                  </div>
                </div>
                <div className="text-right text-[12px] text-ink-muted">
                  <span className="text-ink">{lvl.toNext}</span> XP to Level {lvl.level + 1}
                </div>
              </div>
              <ProgressBar value={lvl.progress} height={6} className="mt-3" shimmer label="Experience to next level" />
            </div>
          </div>
          <div className="relative mt-8 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-void/40">
            <MiniStat label="Quests" value={stats.questsCompleted} />
            <MiniStat label="XP today" value={xpToday(game.xpLedger)} />
            <MiniStat label="Next title" value={levelTitle(lvl.level + 1)} small />
          </div>
        </Panel>

        {/* Active mission */}
        <Panel className="relative flex flex-col overflow-hidden p-6 sm:p-7">
          <div className="absolute -bottom-16 -right-16 opacity-[0.07]" aria-hidden="true">
            <WorldEmblem world={world} size={260} />
          </div>
          <div className="relative flex items-center gap-3">
            <WorldEmblem world={world} size={40} />
            <div>
              <HudLabel>Current world · 0{world.index}</HudLabel>
              <Link href={`/world-map/${world.id}`} className="text-[15px] font-medium hover:text-cyan" style={{ color: world.theme.accent }}>
                {world.name}
              </Link>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-lg text-ink tabular-nums">{Math.round(worldProgress(game, world.id).pct * 100)}%</div>
              <div className="hud-label">explored</div>
            </div>
          </div>
          <div className="relative mt-6 flex-1 border-t border-line pt-5">
            <HudLabel className="mb-2 text-cyan/80">Active mission</HudLabel>
            {mission ? (
              <>
                <QuestTypeTag quest={mission} />
                <h3 className="display mt-2 text-xl font-semibold leading-snug">{mission.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] text-ink-muted">{mission.summary}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={questProgress(game, mission)} height={4} label="Mission progress" />
                  <span className="font-mono text-[11px] text-ink-faint">{Math.round(questProgress(game, mission) * 100)}%</span>
                </div>
              </>
            ) : (
              <p className="text-ink-muted">Every quest complete. You are a frontier researcher.</p>
            )}
          </div>
          {mission && (
            <Button variant={mission.type === "boss" ? "gold" : "primary"} size="lg" className="relative mt-6 w-full" onClick={() => open(mission)}>
              {mission.type === "boss" ? <Swords size={16} /> : null}
              Continue Mission <ArrowRight size={16} />
            </Button>
          )}
        </Panel>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={rise} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="col-span-2 p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <HudLabel>Learning rhythm</HudLabel>
            <Flame size={15} className={streak.alive && streak.current > 0 ? "text-cyan" : "text-ink-faint"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="display text-3xl font-semibold tabular-nums">{streak.current}</span>
            <span className="text-[13px] text-ink-muted">day{streak.current === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-3 flex gap-1.5" aria-label="Activity over the last 7 days">
            {streak.week.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn("h-6 w-full rounded-[4px] border", d.active ? "border-cyan/40 bg-cyan/25" : "border-line bg-white/[0.02]", d.isToday && "ring-1 ring-cyan/30 ring-offset-1 ring-offset-surface")}
                  title={d.key}
                />
                <span className="font-mono text-[9px] text-ink-faint">{parseDayKey(d.key).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
            {REST_DAYS_ALLOWED} rest day between sessions never breaks your rhythm. Best: {streak.longest}.
          </p>
        </Panel>
        <StatTile icon={<Archive size={15} />} label="Projects completed" value={stats.projectsCompleted} href="/vault" sub="in your Research Vault" />
        <StatTile icon={<Gem size={15} />} label="Skills mastered" value={`${stats.skillsMastered}`} suffix={`/ ${stats.totalSkills}`} href="/skill-tree" sub="unlocked on the Skill Tree" />
        <StatTile icon={<Swords size={15} />} label="Bosses defeated" value={stats.bossesDefeated} suffix="/ 5" href="/world-map" sub={`${stats.questsCompleted} quests completed`} gold />
      </motion.div>

      {/* ── Daily quests + worlds ── */}
      <motion.div variants={rise} className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DailyQuests completedToday={stats.completedToday} />
        <div className="space-y-6">
          <WorldsMini />
          <RecentAchievements />
        </div>
      </motion.div>
    </motion.div>
  );
}

function xpToday(ledger: { amount: number; at: string }[]) {
  const today = dayKey();
  return ledger.filter((e) => dayKey(new Date(e.at)) === today).reduce((a, e) => a + e.amount, 0);
}

function MiniStat({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="px-4 py-3">
      <div className="hud-label truncate">{label}</div>
      <div className={cn("mt-1 truncate font-medium tabular-nums text-ink", small ? "text-[13px] leading-6" : "display text-lg")}>{value}</div>
    </div>
  );
}

function EditableName() {
  const username = useGame((s) => s.profile.username);
  const setProfile = useGame((s) => s.setProfile);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(username);
  if (editing)
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setProfile({ username: val.trim() || "Apprentice" });
          setEditing(false);
        }}
      >
        <input
          autoFocus
          value={val}
          maxLength={24}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            setProfile({ username: val.trim() || "Apprentice" });
            setEditing(false);
          }}
          onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          aria-label="Username"
          className="display w-full max-w-xs rounded-lg border border-cyan/40 bg-void/70 px-2 py-0.5 text-2xl font-semibold text-ink outline-none"
        />
      </form>
    );
  return (
    <button
      onClick={() => {
        setVal(username);
        setEditing(true);
      }}
      className="group flex items-center gap-2 text-left"
      aria-label={`Edit username, currently ${username}`}
    >
      <h1 className="display truncate text-2xl font-semibold text-ink sm:text-3xl">{username}</h1>
      <Pencil size={14} className="text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </button>
  );
}

function StatTile({
  icon,
  label,
  value,
  suffix,
  sub,
  href,
  gold,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  sub: string;
  href: string;
  gold?: boolean;
}) {
  return (
    <Link href={href} className="panel panel-hover group block p-5">
      <div className="flex items-center justify-between">
        <HudLabel>{label}</HudLabel>
        <span className={cn("transition-colors", gold ? "text-gold/70 group-hover:text-gold" : "text-ink-faint group-hover:text-cyan")}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn("display text-3xl font-semibold tabular-nums", gold && "text-gold")}>{value}</span>
        {suffix && <span className="text-sm text-ink-faint">{suffix}</span>}
      </div>
      <div className="mt-2 text-[12px] text-ink-faint">{sub}</div>
    </Link>
  );
}

function DailyQuests({ completedToday }: { completedToday: number }) {
  const game = useGame();
  const daily = dailyQuests(game);
  const open = useOpenQuest();
  const doneCount = daily.filter((q) => questStatus(game, q) === "completed").length;

  return (
    <Panel className="p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <HudLabel className="mb-1.5 text-cyan/80">Today</HudLabel>
          <h2 className="display text-lg font-semibold">Daily Quests</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-ink-faint">
            {doneCount}/{daily.length} complete
          </span>
          <Ring value={daily.length ? doneCount / daily.length : 0} size={34} stroke={3}>
            <span className="font-mono text-[9px] text-ink-muted">{doneCount}</span>
          </Ring>
        </div>
      </div>
      <ul className="space-y-2.5">
        {daily.map((q) => {
          const st = questStatus(game, q);
          const p = questProgress(game, q);
          const done = st === "completed";
          return (
            <li key={q.id}>
              <button onClick={() => open(q)} className={cn("group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors", done ? "border-cyan/15 bg-cyan/[0.03]" : "border-line hover:border-line-strong hover:bg-white/[0.02]")}>
                <Ring value={p} size={40} stroke={3} color={done ? "#00E5FF" : "#8B5CF6"}>
                  {done ? <Check size={14} className="text-cyan" strokeWidth={3} /> : <span className="font-mono text-[10px] text-ink-muted">{Math.round(p * 100)}</span>}
                </Ring>
                <div className="min-w-0 flex-1">
                  <QuestTypeTag quest={q} />
                  <div className={cn("mt-1 truncate text-[14px] font-medium", done ? "text-ink-muted" : "text-ink")}>{q.title}</div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-ink-faint">
                    <span>{WORLD_BY_ID[q.worldId].name}</span>
                    <span>·</span>
                    <span>{q.estimate}</span>
                    <DifficultyPips level={q.difficulty} />
                  </div>
                </div>
                <XpBadge amount={questXP(q)} className={done ? "opacity-50" : ""} />
              </button>
            </li>
          );
        })}
      </ul>
      {completedToday >= 4 ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5 text-[12.5px] text-ink-muted">
          <Coffee size={14} className="shrink-0 text-gold" /> Strong session — {completedToday} quests today. Sleep consolidates learning; the worlds will wait.
        </p>
      ) : (
        <div className="mt-5 flex justify-end">
          <ButtonLink href="/quests" variant="ghost" size="sm">
            <ScrollText size={13} /> Open Quest Log
          </ButtonLink>
        </div>
      )}
    </Panel>
  );
}

function WorldsMini() {
  const game = useGame();
  return (
    <Panel className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="display text-lg font-semibold">World Progress</h2>
        <Link href="/world-map" className="text-[12px] text-ink-faint hover:text-cyan">
          Map →
        </Link>
      </div>
      <ul className="space-y-3.5">
        {WORLDS.map((w) => {
          const st = worldStatus(game, w.id);
          const p = worldProgress(game, w.id);
          return (
            <li key={w.id}>
              <Link href={`/world-map/${w.id}`} className="group flex items-center gap-3">
                <WorldEmblem world={w} size={30} dim={st === "locked"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className={cn("truncate", st === "locked" ? "text-ink-faint" : "text-ink group-hover:text-cyan")}>{w.name}</span>
                    <span className="font-mono text-[10.5px] text-ink-faint">{st === "completed" ? "✓ CLEARED" : st === "locked" ? "LOCKED" : `${Math.round(p.pct * 100)}%`}</span>
                  </div>
                  <ProgressBar value={p.pct} height={3} className="mt-1.5" color={st === "completed" ? "gold" : w.theme.accent} label={`${w.name} progress`} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function RecentAchievements() {
  const unlocked = useGame((s) => s.achievements);
  const list = ACHIEVEMENTS.filter((a) => unlocked[a.id]).sort((a, b) => unlocked[b.id].localeCompare(unlocked[a.id]));
  return (
    <Panel className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="display text-lg font-semibold">Achievements</h2>
        <span className="font-mono text-[11px] text-ink-faint">
          {list.length}/{ACHIEVEMENTS.length}
        </span>
      </div>
      {list.length === 0 ? (
        <p className="flex items-center gap-2 text-[13px] text-ink-faint">
          <Trophy size={14} /> Complete your first quest to earn “First Light”.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {list.slice(0, 8).map((a) => (
            <li key={a.id} title={a.description} className="flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.05] px-2.5 py-1.5 text-[12px] text-gold-soft">
              <Icon name={a.icon} size={13} /> {a.name}
            </li>
          ))}
        </ul>
      )}
      <Link href="/vault#achievements" className="mt-4 block text-[12px] text-ink-faint hover:text-cyan">
        View all in the Research Vault →
      </Link>
    </Panel>
  );
}
