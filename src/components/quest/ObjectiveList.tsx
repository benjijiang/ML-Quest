"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Objective, Quest } from "@/data/types";
import { cn } from "@/lib/cn";
import { useGame } from "@/lib/store";

export function ObjectiveItem({
  quest,
  objective,
  index,
  disabled,
  accent = "#00E5FF",
}: {
  quest: Quest;
  objective: Objective;
  index: number;
  disabled?: boolean;
  accent?: string;
}) {
  const checked = useGame((s) => s.quests[quest.id]?.done.includes(objective.id) ?? false);
  const toggle = useGame((s) => s.toggleObjective);

  return (
    <li>
      <label
        className={cn(
          "group flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
          checked ? "border-transparent bg-white/[0.02]" : "border-line hover:border-line-strong hover:bg-white/[0.02]",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={() => toggle(quest.id, objective.id)}
        />
        <span
          className="relative mt-[1px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-cyan/80 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-void"
          style={{
            borderColor: checked ? accent : "rgba(148,163,184,0.3)",
            background: checked ? `${accent}26` : "transparent",
          }}
          aria-hidden="true"
        >
          {checked && (
            <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
              <Check size={12} strokeWidth={3} style={{ color: accent }} />
            </motion.span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex gap-2">
            <span className="font-mono text-[11px] leading-5 text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
            <span className={cn("text-[13.5px] leading-5 transition-colors", checked ? "text-ink-muted line-through decoration-white/20" : "text-ink")}>
              {objective.label}
            </span>
          </span>
          {objective.hint && <span className="mt-1 block pl-7 text-[12px] leading-relaxed text-ink-faint">{objective.hint}</span>}
        </span>
      </label>
    </li>
  );
}

export function ObjectiveList({ quest, disabled, accent }: { quest: Quest; disabled?: boolean; accent?: string }) {
  return (
    <ul className="space-y-2">
      {quest.objectives.map((o, i) => (
        <ObjectiveItem key={o.id} quest={quest} objective={o} index={i} disabled={disabled} accent={accent} />
      ))}
    </ul>
  );
}
