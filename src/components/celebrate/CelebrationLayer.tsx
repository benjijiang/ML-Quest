"use client";

import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive, ArrowRight, Award, Map as MapIcon, Sparkles, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/fx/Avatar";
import { Button, ProgressBar } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { WorldEmblem } from "@/components/world/WorldEmblem";
import { ACHIEVEMENT_BY_ID } from "@/data/achievements";
import { levelTitle } from "@/data/levels";
import { getQuest, questXP } from "@/data/quests";
import { WORLD_BY_ID } from "@/data/worlds";
import type { WorldId } from "@/data/types";
import { Icon } from "@/lib/icons";
import { playerLevel } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { MODAL_KINDS, useUI, type Celebration } from "@/lib/ui";

export function useCountUp(target: number, duration = 1.1) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setV(target);
      return;
    }
    const c = animate(0, target, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [target, duration, reduce]);
  return v;
}

export function CelebrationLayer() {
  const items = useUI((s) => s.celebrations);
  const dismiss = useUI((s) => s.dismiss);
  const modal = items.find((c) => MODAL_KINDS.has(c.kind));
  const toasts = modal ? [] : items.filter((c) => !MODAL_KINDS.has(c.kind)).slice(0, 3);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8 lg:left-[272px] lg:right-auto lg:items-start lg:px-0" aria-live="polite">
        <AnimatePresence>
          {toasts.map((c) => (
            <Toast key={c.id} c={c} onDone={() => dismiss(c.id)} />
          ))}
        </AnimatePresence>
      </div>
      <Modal
        open={modal?.kind === "level"}
        onClose={() => modal && dismiss(modal.id)}
        label="Level up"
      >
        {modal?.kind === "level" && <LevelUp level={modal.level} onClose={() => dismiss(modal.id)} />}
      </Modal>
      <Modal open={modal?.kind === "boss"} onClose={() => modal && dismiss(modal.id)} label="Boss defeated" variant="fullscreen" dismissable={false}>
        {modal?.kind === "boss" && <BossDefeated questId={modal.questId} nextWorldId={modal.nextWorldId} onClose={() => dismiss(modal.id)} />}
      </Modal>
    </>
  );
}

function Toast({ c, onDone }: { c: Celebration; onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), c.kind === "achievement" ? 5000 : 3800);
    return () => clearTimeout(t);
  }, [c.kind]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto"
    >
      {c.kind === "xp" && <XpToast amount={c.amount} label={c.label} />}
      {c.kind === "achievement" && <AchievementToast id={c.achievementId} />}
      {c.kind === "unlock" && (
        <div className="panel edge-glow flex items-center gap-3 !bg-abyss/95 px-4 py-3">
          <Unlock size={16} className="text-cyan" />
          <span className="text-sm">World unlocked: {WORLD_BY_ID[c.worldId as WorldId]?.name}</span>
        </div>
      )}
    </motion.div>
  );
}

function XpToast({ amount, label }: { amount: number; label: string }) {
  const v = useCountUp(amount, 0.9);
  const lvl = playerLevel(useGame());
  return (
    <div className="panel edge-glow flex min-w-[320px] items-center gap-4 overflow-hidden !bg-abyss/95 px-5 py-3.5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-y-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-cyan/[0.08] to-transparent" />
      </div>
      <div className="relative">
        <div className="display text-2xl font-semibold text-gradient-gold tabular-nums">
          {amount > 0 ? `+${v}` : "✓"}
          {amount > 0 && <span className="ml-1 text-sm">XP</span>}
        </div>
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="truncate text-[13px] text-ink">{label}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar value={lvl.progress} height={3} label="Level progress" />
          <span className="shrink-0 font-mono text-[10px] text-ink-faint">Lv {lvl.level}</span>
        </div>
      </div>
    </div>
  );
}

function AchievementToast({ id }: { id: string }) {
  const a = ACHIEVEMENT_BY_ID[id];
  if (!a) return null;
  return (
    <div className="panel edge-glow edge-glow-gold flex min-w-[320px] items-center gap-4 !bg-abyss/95 px-5 py-3.5">
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-gold/40 bg-gold/10 text-gold shadow-glow-gold">
        <Icon name={a.icon} size={18} />
      </div>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold/80">Achievement unlocked</div>
        <div className="text-[14px] font-medium text-ink">{a.name}</div>
        <div className="text-[12px] text-ink-muted">{a.description}</div>
      </div>
    </div>
  );
}

function LevelUp({ level, onClose }: { level: number; onClose: () => void }) {
  const avatarId = useGame((s) => s.profile.avatarId);
  return (
    <div className="panel edge-glow relative overflow-hidden px-8 pb-8 pt-10 text-center">
      <div className="grid-bg grid-fade absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid h-36 w-36 place-items-center">
        <motion.div
          className="absolute inset-0 rounded-full border border-cyan/30"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.25, 1], opacity: [0, 1, 0.6] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border border-violet/30"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        />
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 16 }}>
          <Avatar id={avatarId} size={72} ring />
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative">
        <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">Level up</div>
        <div className="display mt-2 text-5xl font-bold text-gradient">Level {level}</div>
        <div className="mt-2 text-[15px] text-ink-muted">
          New title: <span className="text-ink">{levelTitle(level)}</span>
        </div>
        <p className="mx-auto mt-4 max-w-xs text-[13px] leading-relaxed text-ink-faint">
          Every level reflects work you actually shipped. Take a moment — you earned this.
        </p>
        <Button variant="primary" className="mt-6" onClick={onClose} data-autofocus>
          Continue <ArrowRight size={15} />
        </Button>
      </motion.div>
    </div>
  );
}

function BossDefeated({ questId, nextWorldId, onClose }: { questId: string; nextWorldId?: string; onClose: () => void }) {
  const router = useRouter();
  const quest = getQuest(questId)!;
  const world = WORLD_BY_ID[quest.worldId];
  const next = nextWorldId ? WORLD_BY_ID[nextWorldId as WorldId] : undefined;
  const achievement = quest.boss ? ACHIEVEMENT_BY_ID[quest.boss.achievementId] : undefined;
  const reduce = useReducedMotion();
  const xp = useCountUp(questXP(quest), 1.4);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="relative grid h-full w-full place-items-center overflow-y-auto bg-void/95 px-6 py-12">
      <div className="grid-bg grid-fade absolute inset-0" aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] rounded-full"
        style={{ x: "-50%", y: "-50%", background: "radial-gradient(circle, rgba(205,176,122,0.16), transparent 60%)" }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      {!reduce &&
        Array.from({ length: 18 }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[2px] w-24 origin-left bg-gradient-to-r from-gold/60 to-transparent"
            style={{ rotate: `${i * 20}deg` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1.6], opacity: [0, 0.8, 0], x: [0, 40, 160] }}
            transition={{ duration: 1.6, delay: 0.3 + (i % 3) * 0.05, ease: "easeOut" }}
          />
        ))}

      <div className="relative flex max-w-2xl flex-col items-center text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14 }}>
          <WorldEmblem world={world} size={120} />
        </motion.div>
        <motion.div initial={{ opacity: 0, letterSpacing: "0.8em" }} animate={{ opacity: 1, letterSpacing: "0.32em" }} transition={{ duration: 1, delay: 0.3 }} className="mt-8 font-mono text-xs uppercase text-gold">
          {quest.boss?.codename}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="display mt-3 text-5xl font-bold tracking-[0.08em] text-gradient-gold md:text-7xl"
        >
          BOSS DEFEATED
        </motion.h2>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 grid w-full gap-3 sm:grid-cols-3">
          <div className="panel p-4">
            <Sparkles size={16} className="mx-auto text-gold" />
            <div className="display mt-2 text-2xl font-semibold text-gold tabular-nums">+{xp} XP</div>
            <div className="hud-label mt-1">Reward</div>
          </div>
          <div className="panel p-4">
            <Award size={16} className="mx-auto text-gold" />
            <div className="mt-2 text-[15px] font-medium text-ink">{achievement?.name}</div>
            <div className="hud-label mt-1">Achievement</div>
          </div>
          <div className="panel p-4">
            <Archive size={16} className="mx-auto text-cyan" />
            <div className="mt-2 text-[15px] font-medium text-ink">Added to Vault</div>
            <div className="hud-label mt-1">Portfolio</div>
          </div>
        </motion.div>
        {next && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="panel edge-glow mt-4 flex w-full items-center gap-4 p-4 text-left"
          >
            <WorldEmblem world={next} size={52} />
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">New world unlocked</div>
              <div className="display text-lg font-semibold">
                World 0{next.index} · {next.name}
              </div>
              <div className="text-[12.5px] text-ink-muted">{next.tagline}</div>
            </div>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => go("/vault")}>
            <Archive size={15} /> Open Research Vault
          </Button>
          <Button variant="gold" onClick={() => go("/world-map")} data-autofocus>
            <MapIcon size={15} /> {next ? `Travel to ${next.name}` : "Return to World Map"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
