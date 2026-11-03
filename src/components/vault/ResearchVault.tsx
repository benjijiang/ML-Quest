"use client";

import { motion } from "framer-motion";
import { Calendar, Check, ExternalLink, FileText, Lock, Pencil, Swords } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, HudLabel, PageHeader, Panel, XpBadge } from "@/components/ui/primitives";
import { WorldEmblem } from "@/components/world/WorldEmblem";
import { ACHIEVEMENTS, ACHIEVEMENT_BY_ID } from "@/data/achievements";
import { QUESTS, WRITEUP_XP } from "@/data/quests";
import { SKILL_BY_ID } from "@/data/skills";
import type { Quest } from "@/data/types";
import { WORLD_BY_ID } from "@/data/worlds";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { GithubIcon, Icon } from "@/lib/icons";
import { isQuestComplete, vaultProjects } from "@/lib/progress";
import { useGame } from "@/lib/store";
import { useOpenQuest } from "@/components/quest/QuestCard";

function isUrl(v: string) {
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function ResearchVault() {
  const game = useGame();
  const projects = vaultProjects(game);
  const pending = QUESTS.filter((q) => (q.type === "project" || q.type === "boss") && !isQuestComplete(game, q.id));
  const tech = new Set(projects.flatMap((p) => p.technologies ?? []));
  const skills = new Set(projects.flatMap((p) => p.skillIds));
  const unlocked = Object.keys(game.achievements).length;

  return (
    <div>
      <PageHeader
        eyebrow="Research Vault"
        title="Your Portfolio of Proof"
        description="Every project and boss you complete is archived here — with code, write-ups and the skills it demonstrates. This is the record that outlasts the game."
      />

      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Projects archived" value={projects.length} />
        <Metric label="Technologies used" value={tech.size} />
        <Metric label="Skills demonstrated" value={skills.size} />
        <Metric label="Achievements" value={`${unlocked}/${ACHIEVEMENTS.length}`} gold />
      </div>

      <section aria-labelledby="projects-h">
        <h2 id="projects-h" className="display mb-5 text-xl font-semibold">
          Archived projects
        </h2>
        {projects.length === 0 && (
          <Panel className="mb-6 flex flex-col items-center p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line-strong text-ink-faint">
              <FileText size={22} />
            </div>
            <h3 className="mt-4 text-[15px] font-medium">The vault is empty — for now.</h3>
            <p className="mt-1.5 max-w-md text-[13px] text-ink-muted">Complete a mini-project or defeat a boss and it will be archived here as a portfolio card you can link to GitHub.</p>
          </Panel>
        )}
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <ProjectCard quest={p} />
            </motion.div>
          ))}
          {pending.map((q) => (
            <LockedProject key={q.id} quest={q} />
          ))}
        </div>
      </section>

      <section id="achievements" aria-labelledby="ach-h" className="mt-16 scroll-mt-8">
        <h2 id="ach-h" className="display mb-5 text-xl font-semibold">
          Achievements
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => {
            const at = game.achievements[a.id];
            const hidden = a.secret && !at;
            return (
              <div
                key={a.id}
                className={cn("panel flex items-start gap-3 p-4", at ? "border-gold/25" : "opacity-60")}
                aria-label={hidden ? "Secret achievement, locked" : `${a.name}: ${a.description}${at ? `, unlocked ${formatDate(at)}` : ", locked"}`}
              >
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border", at ? "border-gold/40 bg-gold/10 text-gold" : "border-line text-ink-faint")}>
                  {at ? <Icon name={a.icon} size={17} /> : <Lock size={14} />}
                </div>
                <div className="min-w-0">
                  <div className={cn("text-[13px] font-medium", at ? "text-ink" : "text-ink-muted")}>{hidden ? "???" : a.name}</div>
                  <div className="mt-0.5 text-[11.5px] leading-snug text-ink-faint">{hidden ? "A secret awaits at the end of the map." : a.description}</div>
                  {at && <div className="mt-1.5 font-mono text-[10px] text-gold/70">{formatDate(at)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, gold }: { label: string; value: number | string; gold?: boolean }) {
  return (
    <Panel className="p-5">
      <HudLabel>{label}</HudLabel>
      <div className={cn("display mt-2 text-3xl font-semibold tabular-nums", gold && "text-gold")}>{value}</div>
    </Panel>
  );
}

function ProjectCard({ quest }: { quest: Quest }) {
  const game = useGame();
  const world = WORLD_BY_ID[quest.worldId];
  const entry = game.vault[quest.id] ?? {};
  const completedAt = game.quests[quest.id]?.completedAt;
  const achievement = quest.boss ? ACHIEVEMENT_BY_ID[quest.boss.achievementId] : undefined;
  const [editingRepo, setEditingRepo] = useState(!entry.repoUrl);
  const [repo, setRepo] = useState(entry.repoUrl ?? "");
  const [writeup, setWriteup] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const isBoss = quest.type === "boss";

  const saveRepo = () => {
    if (repo && !isUrl(repo)) return setErr("Enter a full URL, e.g. https://github.com/you/project");
    setErr(null);
    game.updateVault(quest.id, { repoUrl: repo.trim() || undefined });
    if (repo) setEditingRepo(false);
  };

  return (
    <Panel glow={isBoss ? "gold" : undefined} className="flex h-full flex-col overflow-hidden" as="article">
      <div className="relative border-b border-line p-6">
        <div className="absolute -right-8 -top-8 opacity-[0.12]" aria-hidden="true">
          <WorldEmblem world={world} size={140} />
        </div>
        <div className="relative flex flex-wrap items-center gap-2">
          <Badge color={isBoss ? "#CDB07A" : "#34D399"}>
            {isBoss ? <Swords size={10} /> : null} {isBoss ? `Boss · ${quest.boss?.codename}` : "Mini-project"}
          </Badge>
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-faint">
            World 0{world.index} · {world.name}
          </span>
        </div>
        <h3 className="display relative mt-3 text-xl font-semibold leading-snug">{quest.title}</h3>
        <p className="relative mt-2 text-[13px] leading-relaxed text-ink-muted">{quest.description}</p>
      </div>

      <div className="flex-1 space-y-4 p-6">
        {quest.technologies && (
          <div>
            <HudLabel className="mb-2">Technologies</HudLabel>
            <div className="flex flex-wrap gap-1.5">
              {quest.technologies.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <HudLabel className="mb-2">Skills demonstrated</HudLabel>
          <div className="flex flex-wrap gap-1.5">
            {quest.skillIds.map((id) => (
              <Link key={id} href={`/skill-tree?skill=${id}`}>
                <Badge color="#00E5FF">{SKILL_BY_ID[id]?.name}</Badge>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-ink-muted">
          {completedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-ink-faint" /> Completed {formatDate(completedAt)}
            </span>
          )}
          {achievement && (
            <span className="flex items-center gap-1.5 text-gold-soft">
              <Icon name={achievement.icon} size={12} /> {achievement.name}
            </span>
          )}
        </div>

        {/* Repository */}
        <div className="rounded-xl border border-line bg-void/40 p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <HudLabel className="flex items-center gap-1.5">
              <GithubIcon size={12} /> Repository
            </HudLabel>
            {!editingRepo && (
              <button onClick={() => setEditingRepo(true)} className="text-ink-faint hover:text-ink" aria-label="Edit repository link">
                <Pencil size={12} />
              </button>
            )}
          </div>
          {editingRepo ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                saveRepo();
              }}
            >
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="https://github.com/you/project"
                aria-label="GitHub repository URL"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-void/70 px-3 font-mono text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-cyan/50"
              />
              <Button size="sm" type="submit">
                Save
              </Button>
            </form>
          ) : (
            <a href={entry.repoUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 truncate font-mono text-[12px] text-cyan hover:underline">
              {entry.repoUrl?.replace(/^https?:\/\//, "")} <ExternalLink size={11} className="shrink-0" />
            </a>
          )}
          {err && <p className="mt-2 text-[11.5px] text-danger">{err}</p>}
        </div>

        {/* Write-up */}
        <div className="rounded-xl border border-line bg-void/40 p-3.5">
          <HudLabel className="mb-2 flex items-center gap-1.5">
            <FileText size={12} /> Project write-up
          </HudLabel>
          {entry.writeupUrl ? (
            <div className="flex items-center justify-between gap-3">
              <a href={entry.writeupUrl} target="_blank" rel="noreferrer noopener" className="flex min-w-0 items-center gap-2 truncate font-mono text-[12px] text-cyan hover:underline">
                {entry.writeupUrl.replace(/^https?:\/\//, "")} <ExternalLink size={11} className="shrink-0" />
              </a>
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-gold">
                <Check size={11} strokeWidth={3} /> Published
              </span>
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!isUrl(writeup)) return setErr("Enter the full URL of your published write-up.");
                setErr(null);
                game.publishWriteup(quest.id, writeup);
              }}
            >
              <input
                value={writeup}
                onChange={(e) => setWriteup(e.target.value)}
                placeholder="https://your-blog.dev/post"
                aria-label="Write-up URL"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-void/70 px-3 font-mono text-[12px] text-ink outline-none placeholder:text-ink-faint focus:border-cyan/50"
              />
              <Button size="sm" type="submit" variant="primary">
                Publish <XpBadge amount={WRITEUP_XP} className="text-void" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </Panel>
  );
}

function LockedProject({ quest }: { quest: Quest }) {
  const world = WORLD_BY_ID[quest.worldId];
  const open = useOpenQuest();
  return (
    <button onClick={() => open(quest)} className="panel panel-hover group flex items-center gap-4 border-dashed p-5 text-left opacity-70 hover:opacity-100">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-dashed border-line-strong text-ink-faint">
        {quest.type === "boss" ? <Swords size={18} /> : <Lock size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <HudLabel>
          Undiscovered artifact · World 0{world.index}
        </HudLabel>
        <div className="mt-1 truncate text-[14px] text-ink-muted group-hover:text-ink">{quest.title}</div>
        <div className="mt-0.5 text-[11.5px] text-ink-faint">{quest.type === "boss" ? `Defeat ${quest.boss?.codename} to archive` : "Complete this mini-project to archive"}</div>
      </div>
    </button>
  );
}
