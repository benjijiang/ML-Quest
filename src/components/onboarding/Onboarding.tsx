"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/fx/Avatar";
import { ParticleField } from "@/components/fx/ParticleField";
import { LogoMark } from "@/components/shell/Logo";
import { Button, DifficultyPips, HudLabel, XpBadge } from "@/components/ui/primitives";
import { WorldEmblem } from "@/components/world/WorldEmblem";
import { AVATARS } from "@/data/avatars";
import { getQuest, questXP } from "@/data/quests";
import { WORLDS } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { useGame } from "@/lib/store";

const STEPS = ["Welcome", "Worlds", "Identity", "First Quest", "Launch"];
const FIRST_QUEST = "w1-q-tensors";

const fade = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(6px)" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const complete = useGame((s) => s.completeOnboarding);
  const router = useRouter();

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));

  useEffect(() => {
    if (step !== 4) return;
    const t = setTimeout(() => {
      router.push("/");
      complete(name, avatar);
    }, 2200);
    return () => clearTimeout(t);
  }, [step, name, avatar, complete, router]);

  return (
    <motion.div className="fixed inset-0 z-40 overflow-y-auto bg-void" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0" aria-hidden="true" />
      <ParticleField className="fixed" />
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan/[0.06] blur-[140px]" aria-hidden="true" />

      {/* Progress rail */}
      <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <LogoMark size={20} />
          <span className="hud-label text-ink-muted">Research Academy · Admission</span>
        </div>
        <ol className="hidden items-center gap-2 sm:flex" aria-label="Onboarding progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
              <span className={cn("h-[3px] w-8 rounded-full transition-colors duration-500", i <= step ? "bg-cyan" : "bg-white/10")} />
            </li>
          ))}
        </ol>
        {step < 4 && (
          <button onClick={() => setStep(4)} className="text-[12px] text-ink-faint hover:text-ink">
            Skip intro
          </button>
        )}
      </div>

      <div className="relative flex min-h-full items-center justify-center px-6 py-24">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.section key="s0" {...fade} className="flex max-w-2xl flex-col items-center text-center">
              <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
                <LogoMark size={72} />
              </motion.div>
              <HudLabel className="mt-10 text-cyan">Transmission received</HudLabel>
              <h1 className="display mt-4 text-5xl font-bold tracking-[0.12em] text-gradient sm:text-7xl">ML QUEST</h1>
              <p className="mt-4 text-lg text-ink-muted">Level Up Your Intelligence.</p>
              <div className="mt-10 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-ink-faint">
                {["Learn", "Build", "Conquer", "Level Up"].map((w, i) => (
                  <motion.span key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.25 }} className="flex items-center gap-3">
                    {i > 0 && <span className="text-cyan/50">→</span>}
                    <span className={i === 3 ? "text-cyan" : ""}>{w}</span>
                  </motion.span>
                ))}
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-10 max-w-md text-[14px] leading-relaxed text-ink-muted">
                Welcome to the academy. Here, every concept you master and every project you ship makes you measurably stronger.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>
                <Button variant="primary" size="lg" className="mt-10" onClick={next} autoFocus>
                  Enter the Academy <ArrowRight size={16} />
                </Button>
              </motion.div>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section key="s1" {...fade} className="flex w-full max-w-5xl flex-col items-center text-center">
              <HudLabel className="text-cyan">The Curriculum</HudLabel>
              <h2 className="display mt-4 text-3xl font-semibold sm:text-4xl">Five worlds stand between you and the frontier.</h2>
              <p className="mt-3 max-w-xl text-ink-muted">Each world ends with a Boss Battle — a real project. Defeat it to unlock the next world.</p>
              <div className="relative mt-14 grid w-full grid-cols-2 gap-6 sm:grid-cols-5">
                <motion.div
                  aria-hidden="true"
                  className="absolute left-[10%] right-[10%] top-[46px] hidden h-px origin-left bg-gradient-to-r from-cyan/60 via-violet/40 to-gold/50 sm:block"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
                />
                {WORLDS.map((w, i) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.25, duration: 0.6 }} className="relative flex flex-col items-center">
                    <div className="rounded-full bg-void p-1">
                      <WorldEmblem world={w} size={84} />
                    </div>
                    <div className="mt-4 font-mono text-[10px] tracking-[0.2em] text-ink-faint">WORLD 0{w.index}</div>
                    <div className="mt-1 text-[13.5px] font-medium" style={{ color: w.theme.accent }}>
                      {w.name}
                    </div>
                    <div className="mt-1 text-[11.5px] text-ink-faint">{w.topics.map((t) => t.title).join(" · ")}</div>
                  </motion.div>
                ))}
              </div>
              <Button variant="primary" size="lg" className="mt-14" onClick={next} autoFocus>
                Continue <ArrowRight size={16} />
              </Button>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="s2" {...fade} className="flex w-full max-w-xl flex-col items-center text-center">
              <HudLabel className="text-cyan">Identity Registration</HudLabel>
              <h2 className="display mt-4 text-3xl font-semibold sm:text-4xl">Who enters the academy?</h2>
              <form
                className="mt-10 w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
              >
                <div className="panel edge-glow flex flex-col items-center p-8">
                  <motion.div key={avatar} initial={{ scale: 0.85, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                    <Avatar id={avatar} size={96} ring />
                  </motion.div>
                  <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan">Level 1 — AI Apprentice</div>
                  <label className="mt-6 w-full text-left">
                    <span className="hud-label">Callsign</span>
                    <input
                      autoFocus
                      value={name}
                      maxLength={24}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Apprentice"
                      className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-void/70 px-4 text-center text-lg text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-cyan/50"
                    />
                  </label>
                  <fieldset className="mt-6 w-full">
                    <legend className="hud-label mb-3">Choose your sigil</legend>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATARS.map((a) => (
                        <button
                          type="button"
                          key={a.id}
                          onClick={() => setAvatar(a.id)}
                          aria-label={a.name}
                          aria-pressed={avatar === a.id}
                          className={cn("grid place-items-center rounded-xl border p-2 transition-colors", avatar === a.id ? "border-cyan/50 bg-cyan/[0.06]" : "border-line hover:border-line-strong")}
                        >
                          <Avatar id={a.id} size={36} />
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <Button type="submit" variant="primary" size="lg" className="mt-8">
                  Register identity <ArrowRight size={16} />
                </Button>
              </form>
            </motion.section>
          )}

          {step === 3 && <FirstQuest key="s3" onAccept={next} />}

          {step === 4 && (
            <motion.section key="s4" {...fade} className="flex flex-col items-center text-center" role="status">
              <motion.div className="relative grid h-28 w-28 place-items-center">
                <motion.span className="absolute inset-0 rounded-full border border-cyan/40" animate={{ scale: [1, 1.6], opacity: [0.8, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
                <motion.span className="absolute inset-0 rounded-full border border-violet/40" animate={{ scale: [1, 1.6], opacity: [0.8, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.7 }} />
                <Avatar id={avatar} size={72} />
              </motion.div>
              <HudLabel className="mt-8 text-cyan">Initializing Command Center</HudLabel>
              <div className="display mt-3 text-2xl font-semibold">Welcome, {name.trim() || "Apprentice"}.</div>
              <div className="mt-6 h-px w-56 overflow-hidden bg-white/10">
                <motion.div className="h-full bg-gradient-to-r from-cyan to-violet" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FirstQuest({ onAccept }: { onAccept: () => void }) {
  const q = getQuest(FIRST_QUEST)!;
  return (
    <motion.section {...fade} className="flex w-full max-w-xl flex-col items-center text-center">
      <HudLabel className="text-cyan">Incoming mission</HudLabel>
      <h2 className="display mt-4 text-3xl font-semibold sm:text-4xl">Your first quest awaits.</h2>
      <p className="mt-3 text-ink-muted">Every researcher started with a single tensor.</p>
      <div className="panel edge-glow mt-10 w-full p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan">World 01 · Concept Quest</span>
          <XpBadge amount={questXP(q)} />
        </div>
        <h3 className="display mt-3 text-xl font-semibold">{q.title}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{q.summary}</p>
        <div className="mt-4 flex items-center gap-4 text-[12px] text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> {q.estimate}
          </span>
          <DifficultyPips level={q.difficulty} />
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <div className="hud-label mb-3 flex items-center gap-2">
            <Target size={12} /> Objectives
          </div>
          <ul className="space-y-2">
            {q.objectives.slice(0, 3).map((o, i) => (
              <motion.li key={o.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }} className="flex gap-2.5 text-[13px] text-ink-muted">
                <span className="mt-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] border border-line-strong" />
                {o.label}
              </motion.li>
            ))}
            <li className="pl-6 text-[12px] text-ink-faint">+ {q.objectives.length - 3} more</li>
          </ul>
        </div>
      </div>
      <Button variant="primary" size="lg" className="mt-8" onClick={onAccept} autoFocus>
        <Check size={16} /> Accept quest
      </Button>
    </motion.section>
  );
}
