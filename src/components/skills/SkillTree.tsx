"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, GitFork, List, Lock, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { QuestTypeTag, useOpenQuest } from "@/components/quest/QuestCard";
import { Badge, HudLabel, PageHeader, Panel, ProgressBar, XpBadge } from "@/components/ui/primitives";
import { getQuest, questXP } from "@/data/quests";
import { CATEGORY_BY_ID, SKILL_BY_ID, SKILL_CATEGORIES, SKILLS, skillDepth } from "@/data/skills";
import type { Quest, Skill, SkillCategoryId } from "@/data/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/icons";
import { isQuestComplete, skillProgress, skillStatus, skillXP, type SkillStatus } from "@/lib/progress";
import { useGame } from "@/lib/store";

// ───────────────────────── Layout ─────────────────────────

const COL_W = 250;
const ROW_H = 92;
const NODE_W = 200;
const NODE_H = 64;
const LANE_PAD = 34;
const LABEL_W = 210;

interface Layout {
  pos: Record<string, { x: number; y: number }>;
  lanes: { id: SkillCategoryId; y: number; h: number }[];
  width: number;
}

function computeLayout(): Layout {
  const memo: Record<string, number> = {};
  const depth = Object.fromEntries(SKILLS.map((s) => [s.id, skillDepth(s.id, memo)]));
  const maxDepth = Math.max(...Object.values(depth));
  const pos: Layout["pos"] = {};
  const lanes: Layout["lanes"] = [];
  let y = 0;
  for (const cat of SKILL_CATEGORIES) {
    const skills = SKILLS.filter((s) => s.category === cat.id);
    const byDepth: Record<number, Skill[]> = {};
    skills.forEach((s) => (byDepth[depth[s.id]] ??= []).push(s));
    const maxStack = Math.max(...Object.values(byDepth).map((a) => a.length));
    const h = maxStack * ROW_H + LANE_PAD * 2 - (ROW_H - NODE_H);
    for (const [d, list] of Object.entries(byDepth)) {
      const offset = ((maxStack - list.length) * ROW_H) / 2;
      list.forEach((s, i) => {
        pos[s.id] = { x: Number(d) * COL_W, y: y + LANE_PAD + offset + i * ROW_H };
      });
    }
    lanes.push({ id: cat.id, y, h });
    y += h + 14;
  }
  return { pos, lanes, width: (maxDepth + 1) * COL_W - (COL_W - NODE_W) };
}

const LAYOUT = computeLayout();

// ───────────────────────── Nodes ─────────────────────────

type SkillNodeData = { skill: Skill; status: SkillStatus; pct: number; selected: boolean; dimmed: boolean };
type LaneNodeData = { name: string; color: string; width: number; height: number; mastered: number; total: number };

const STATUS_TEXT: Record<SkillStatus, string> = {
  locked: "Locked",
  available: "Available",
  "in-progress": "In progress",
  mastered: "Mastered",
};

const SkillNode = memo(function SkillNode({ data }: NodeProps<Node<SkillNodeData>>) {
  const { skill, status, pct, selected, dimmed } = data;
  const color = CATEGORY_BY_ID[skill.category].color;
  const locked = status === "locked";
  const mastered = status === "mastered";
  return (
    <div
      className={cn(
        "skill-node relative flex items-center gap-3 rounded-xl border px-3 transition-all duration-300",
        locked ? "border-line bg-surface/60" : "bg-surface-2/90",
        selected && "scale-[1.04]",
        dimmed && "opacity-30",
      )}
      style={{
        width: NODE_W,
        height: NODE_H,
        borderColor: selected ? color : mastered ? `${color}80` : !locked ? `${color}33` : undefined,
        boxShadow: mastered ? `0 0 0 1px ${color}30, 0 0 24px -6px ${color}90` : selected ? `0 0 0 1px ${color}55` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" isConnectable={false} />
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
        style={{
          color: locked ? "#5A6476" : color,
          borderColor: locked ? "rgba(148,163,184,0.12)" : `${color}40`,
          background: mastered ? `${color}22` : locked ? "transparent" : `${color}0D`,
        }}
      >
        {locked ? <Lock size={14} /> : <Icon name={skill.icon} size={16} strokeWidth={1.7} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-[12.5px] font-medium", locked ? "text-ink-faint" : "text-ink")}>{skill.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider" style={{ color: mastered ? color : undefined }}>
          {mastered && <Check size={9} strokeWidth={3} />}
          <span className={mastered ? "" : "text-ink-faint"}>{STATUS_TEXT[status]}</span>
        </div>
        {!locked && !mastered && (
          <div className="mt-1.5 h-[2px] overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" isConnectable={false} />
    </div>
  );
});

const LaneNode = memo(function LaneNode({ data }: NodeProps<Node<LaneNodeData>>) {
  return (
    <div className="pointer-events-none relative rounded-2xl border border-line/70 bg-white/[0.012]" style={{ width: data.width, height: data.height }}>
      <div className="absolute left-5 top-1/2 w-[170px] -translate-y-1/2">
        <div className="mb-1.5 h-[2px] w-6 rounded-full" style={{ background: data.color }} />
        <div className="text-[13px] font-medium text-ink">{data.name}</div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {data.mastered}/{data.total} mastered
        </div>
      </div>
    </div>
  );
});

const nodeTypes = { skill: SkillNode, lane: LaneNode };

// ───────────────────────── Main ─────────────────────────

export function SkillTree() {
  const [view, setView] = useState<"tree" | "list">("tree");
  return (
    <div>
      <PageHeader
        eyebrow="Skill Tree"
        title="Neural Architecture of You"
        description="Every skill is earned by completing the quests linked to it. Mastered skills illuminate their connections; locked skills wait for their prerequisites."
      >
        <div className="flex rounded-xl border border-line bg-surface/60 p-1" role="tablist" aria-label="Skill view">
          {(["tree", "list"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn("flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12.5px] capitalize transition-colors", view === v ? "bg-white/[0.06] text-ink" : "text-ink-faint hover:text-ink")}
            >
              {v === "tree" ? <GitFork size={13} /> : <List size={13} />} {v}
            </button>
          ))}
        </div>
      </PageHeader>
      <ReactFlowProvider>
        <SkillTreeInner view={view} />
      </ReactFlowProvider>
    </div>
  );
}

function SkillTreeInner({ view }: { view: "tree" | "list" }) {
  const game = useGame();
  const params = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(params.get("skill"));
  const [hovered, setHovered] = useState<string | null>(null);
  const rf = useReactFlow();

  const select = useCallback(
    (id: string | null) => {
      setSelected(id);
      router.replace(id ? `/skill-tree?skill=${id}` : "/skill-tree", { scroll: false });
    },
    [router],
  );

  // Focus the camera on a deep-linked skill.
  useEffect(() => {
    const id = params.get("skill");
    if (!id || !LAYOUT.pos[id] || view !== "tree") return;
    const t = setTimeout(() => {
      const p = LAYOUT.pos[id];
      rf.setCenter(p.x + NODE_W / 2 + 120, p.y + NODE_H / 2, { zoom: 1, duration: 800 });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const related = useMemo(() => {
    const focus = hovered ?? selected;
    if (!focus) return null;
    const set = new Set<string>([focus]);
    const up = (id: string) => SKILL_BY_ID[id]?.prerequisites.forEach((p) => (set.add(p), up(p)));
    const down = (id: string) => SKILLS.filter((s) => s.prerequisites.includes(id)).forEach((s) => (set.add(s.id), down(s.id)));
    up(focus);
    down(focus);
    return set;
  }, [hovered, selected]);

  const nodes: Node[] = useMemo(() => {
    const lanes: Node<LaneNodeData>[] = LAYOUT.lanes.map((l) => {
      const cat = CATEGORY_BY_ID[l.id];
      const skills = SKILLS.filter((s) => s.category === l.id);
      return {
        id: `lane-${l.id}`,
        type: "lane",
        position: { x: -LABEL_W - 24, y: l.y },
        data: {
          name: cat.name,
          color: cat.color,
          width: LAYOUT.width + LABEL_W + 48,
          height: l.h,
          mastered: skills.filter((s) => skillStatus(game, s) === "mastered").length,
          total: skills.length,
        },
        draggable: false,
        selectable: false,
        focusable: false,
        zIndex: -1,
      };
    });
    const skills: Node<SkillNodeData>[] = SKILLS.map((s) => {
      const status = skillStatus(game, s);
      return {
        id: s.id,
        type: "skill",
        position: LAYOUT.pos[s.id],
        data: { skill: s, status, pct: skillProgress(game, s).pct, selected: selected === s.id, dimmed: !!related && !related.has(s.id) },
        draggable: false,
        ariaLabel: `${s.name} — ${STATUS_TEXT[status]}. Press Enter to inspect.`,
      };
    });
    return [...lanes, ...skills];
  }, [game, selected, related]);

  const edges: Edge[] = useMemo(
    () =>
      SKILLS.flatMap((s) =>
        s.prerequisites.map((p) => {
          const src = SKILL_BY_ID[p];
          const srcMastered = skillStatus(game, src) === "mastered";
          const tgtStatus = skillStatus(game, s);
          const color = CATEGORY_BY_ID[src.category].color;
          const dim = !!related && !(related.has(p) && related.has(s.id));
          return {
            id: `${p}->${s.id}`,
            source: p,
            target: s.id,
            animated: srcMastered && tgtStatus !== "mastered",
            focusable: false,
            style: {
              stroke: srcMastered ? color : "rgba(148,163,184,0.16)",
              strokeWidth: srcMastered ? 1.4 : 1.1,
              opacity: dim ? 0.12 : srcMastered ? 0.9 : 1,
              filter: srcMastered && !dim && tgtStatus === "mastered" ? `drop-shadow(0 0 3px ${color})` : undefined,
              transition: "opacity 0.3s",
            },
          } satisfies Edge;
        }),
      ),
    [game, related],
  );

  const skill = selected ? SKILL_BY_ID[selected] : undefined;

  if (view === "list") return <SkillList onSelect={select} selected={skill} onClose={() => select(null)} />;

  return (
    <div className="relative">
      <Panel className="relative h-[calc(100dvh-260px)] min-h-[560px] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: (LABEL_W + 24) * 0.85 + 20, y: 24, zoom: 0.85 }}
          minZoom={0.3}
          maxZoom={1.8}
          nodesConnectable={false}
          nodesDraggable={false}
          elementsSelectable
          onNodeClick={(_, n) => n.type === "skill" && select(n.id)}
          onNodeMouseEnter={(_, n) => n.type === "skill" && setHovered(n.id)}
          onNodeMouseLeave={() => setHovered(null)}
          onSelectionChange={({ nodes: ns }) => {
            const n = ns.find((x) => x.type === "skill");
            if (n && n.id !== selected) select(n.id);
          }}
          onPaneClick={() => select(null)}
          proOptions={{ hideAttribution: true }}
          aria-label="Skill tree. Use Tab to move between skills and Enter to inspect."
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(148,163,184,0.12)" />
          <Controls showInteractive={false} position="bottom-left" />

        </ReactFlow>
        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-3 rounded-lg border border-line bg-void/70 px-3 py-2 text-[10.5px] text-ink-faint backdrop-blur">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-cyan shadow-[0_0_6px_#00E5FF]" /> Mastered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm border border-cyan/40" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={9} /> Locked
          </span>
          <span className="hidden sm:inline">· Scroll to zoom · Drag to pan</span>
        </div>
      </Panel>
      <AnimatePresence>{skill && <SkillInspector key={skill.id} skill={skill} onClose={() => select(null)} onSelect={select} floating />}</AnimatePresence>
    </div>
  );
}

// ───────────────────────── Inspector ─────────────────────────

function SkillInspector({ skill, onClose, onSelect, floating }: { skill: Skill; onClose: () => void; onSelect: (id: string) => void; floating?: boolean }) {
  const game = useGame();
  const status = skillStatus(game, skill);
  const prog = skillProgress(game, skill);
  const cat = CATEGORY_BY_ID[skill.category];
  const quests = skill.questIds.map((id) => getQuest(id)!).filter(Boolean);
  const challenges = quests.filter((q) => q.type === "challenge");
  const projects = quests.filter((q) => q.type === "project" || q.type === "boss");
  const concepts = quests.filter((q) => q.type === "concept");
  const unlocks = SKILLS.filter((s) => s.prerequisites.includes(skill.id));

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "panel z-10 flex flex-col overflow-hidden bg-abyss/95",
        floating ? "absolute bottom-3 right-3 top-3 w-[min(380px,calc(100%-24px))]" : "w-full",
      )}
      aria-label={`Skill details: ${skill.name}`}
    >
      <div className="relative border-b border-line p-5">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full blur-[60px]" style={{ background: `${cat.color}22` }} aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl border" style={{ color: cat.color, borderColor: `${cat.color}50`, background: `${cat.color}12` }}>
            <Icon name={skill.icon} size={22} strokeWidth={1.6} />
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-faint hover:text-ink" aria-label="Close skill details">
            <X size={14} />
          </button>
        </div>
        <div className="relative mt-4">
          <HudLabel style={{ color: cat.color }}>{cat.name}</HudLabel>
          <h2 className="display mt-1 text-xl font-semibold">{skill.name}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{skill.description}</p>
        </div>
        <div className="relative mt-4 flex items-center gap-3">
          <ProgressBar value={prog.pct} height={4} color={cat.color} label="Skill mastery" />
          <span className="shrink-0 font-mono text-[11px] text-ink-muted">
            {prog.done}/{prog.total}
          </span>
        </div>
        <div className="relative mt-3 flex items-center justify-between text-[12px]">
          <Badge color={status === "mastered" ? cat.color : undefined}>{STATUS_TEXT[status]}</Badge>
          <span className="flex items-center gap-1.5 text-ink-faint">
            Mastery reward <XpBadge amount={skillXP(skill)} />
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <InspectorSection title="Prerequisites">
          {skill.prerequisites.length === 0 ? (
            <p className="text-[12.5px] text-ink-faint">None — a foundational skill.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {skill.prerequisites.map((p) => {
                const ps = SKILL_BY_ID[p];
                const m = skillStatus(game, ps) === "mastered";
                return (
                  <button key={p} onClick={() => onSelect(p)} className={cn("flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] transition-colors hover:text-ink", m ? "border-cyan/30 text-cyan" : "border-line-strong text-ink-muted")}>
                    {m ? <Check size={10} strokeWidth={3} /> : <Lock size={10} />} {ps.name}
                  </button>
                );
              })}
            </div>
          )}
        </InspectorSection>
        {concepts.length > 0 && <QuestLinks title="Concept quests" quests={concepts} />}
        <QuestLinks title="Related coding challenges" quests={challenges} empty="No coding challenges — mastered through projects." />
        <QuestLinks title="Associated projects" quests={projects} empty="No projects yet for this skill." />
        {unlocks.length > 0 && (
          <InspectorSection title="Unlocks">
            <div className="flex flex-wrap gap-1.5">
              {unlocks.map((u) => (
                <button key={u.id} onClick={() => onSelect(u.id)} className="rounded-md border border-line px-2 py-1 text-[11.5px] text-ink-muted hover:border-line-strong hover:text-ink">
                  {u.name}
                </button>
              ))}
            </div>
          </InspectorSection>
        )}
      </div>
    </motion.aside>
  );
}

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <HudLabel className="mb-2">{title}</HudLabel>
      {children}
    </section>
  );
}

function QuestLinks({ title, quests, empty }: { title: string; quests: Quest[]; empty?: string }) {
  const game = useGame();
  const open = useOpenQuest();
  return (
    <InspectorSection title={title}>
      {quests.length === 0 ? (
        <p className="text-[12.5px] text-ink-faint">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {quests.map((q) => {
            const done = isQuestComplete(game, q.id);
            return (
              <li key={q.id}>
                <button onClick={() => open(q)} className="group flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2 text-left transition-colors hover:border-line-strong">
                  <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded-full border", done ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-line-strong")}>{done && <Check size={9} strokeWidth={3} />}</span>
                  <span className="min-w-0 flex-1">
                    <QuestTypeTag quest={q} />
                    <span className="mt-0.5 block truncate text-[12.5px] text-ink">{q.title}</span>
                  </span>
                  <XpBadge amount={questXP(q)} className="text-[10.5px]" />
                  <ChevronRight size={12} className="text-ink-faint group-hover:text-ink" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </InspectorSection>
  );
}

// ───────────────────────── List view ─────────────────────────

function SkillList({ onSelect, selected, onClose }: { onSelect: (id: string) => void; selected?: Skill; onClose: () => void }) {
  const game = useGame();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {SKILL_CATEGORIES.map((cat) => {
          const skills = SKILLS.filter((s) => s.category === cat.id);
          return (
            <Panel key={cat.id} className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-[2px] w-5 rounded-full" style={{ background: cat.color }} />
                <h2 className="text-[14px] font-medium">{cat.name}</h2>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {skills.map((s) => {
                  const st = skillStatus(game, s);
                  const p = skillProgress(game, s);
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => onSelect(s.id)}
                        aria-pressed={selected?.id === s.id}
                        className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors", selected?.id === s.id ? "border-cyan/40 bg-cyan/[0.04]" : "border-line hover:border-line-strong")}
                      >
                        <span style={{ color: st === "locked" ? "#5A6476" : cat.color }}>{st === "locked" ? <Lock size={15} /> : <Icon name={s.icon} size={16} />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">{s.name}</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                            {STATUS_TEXT[st]} · {p.done}/{p.total}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          );
        })}
      </div>
      <div className="lg:sticky lg:top-8 lg:h-[calc(100dvh-120px)]">
        {selected ? (
          <SkillInspector skill={selected} onClose={onClose} onSelect={onSelect} />
        ) : (
          <Panel className="grid h-48 place-items-center p-6 text-center text-[13px] text-ink-faint">Select a skill to inspect it.</Panel>
        )}
      </div>
    </div>
  );
}
