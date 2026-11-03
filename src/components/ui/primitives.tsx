"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// ───────────────────────── Button ─────────────────────────

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-cyan text-void font-semibold hover:bg-cyan-soft shadow-[0_0_0_1px_rgba(0,229,255,0.5),0_8px_30px_-10px_rgba(0,229,255,0.6)]",
  secondary: "bg-surface-2/80 text-ink border border-line-strong hover:border-cyan/40 hover:text-white",
  ghost: "text-ink-muted hover:text-ink hover:bg-white/[0.04]",
  gold: "bg-gradient-to-b from-gold-soft to-gold text-void font-semibold hover:brightness-110 shadow-glow-gold",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
};
const sizeCls: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-40",
        variantCls[variant],
        sizeCls[size],
        className,
      )}
      {...props}
    />
  );
});

export function ButtonLink({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center justify-center whitespace-nowrap transition-all duration-200", variantCls[variant], sizeCls[size], className)}
    >
      {children}
    </Link>
  );
}

// ───────────────────────── Panel ─────────────────────────

export function Panel({
  className,
  children,
  glow,
  as: Tag = "div",
}: {
  className?: string;
  children: ReactNode;
  glow?: boolean | "gold";
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag className={cn("panel", glow && "edge-glow", glow === "gold" && "edge-glow-gold", className)}>{children}</Tag>
  );
}

// ───────────────────────── Labels ─────────────────────────

export function HudLabel({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("hud-label", className)} style={style}>
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <HudLabel className="mb-2 text-cyan/80">{eyebrow}</HudLabel>}
        <h2 className="display text-xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <HudLabel className="mb-3 flex items-center gap-2 text-cyan/80">
          <span className="inline-block h-px w-6 bg-cyan/60" />
          {eyebrow}
        </HudLabel>
        <h1 className="display text-3xl font-semibold tracking-wide text-ink md:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider",
        !color && "border-line-strong text-ink-muted",
        className,
      )}
      style={color ? { color, borderColor: `${color}40`, background: `${color}0F` } : undefined}
    >
      {children}
    </span>
  );
}

export function XpBadge({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-xs font-medium text-gold", className)}>
      <span className="text-gold/60">+</span>
      {amount}
      <span className="text-[10px] tracking-wider text-gold/70">XP</span>
    </span>
  );
}

export function DifficultyPips({ level, max = 5, className }: { level: number; max?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[3px]", className)} aria-label={`Difficulty ${level} of ${max}`} role="img">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn("h-2.5 w-1 rounded-full", i < level ? "bg-violet-soft" : "bg-white/10")}
          style={i < level ? { boxShadow: "0 0 6px rgba(139,92,246,0.6)" } : undefined}
        />
      ))}
    </span>
  );
}

// ───────────────────────── Progress ─────────────────────────

export function ProgressBar({
  value,
  className,
  color = "cyan",
  height = 6,
  label,
  shimmer,
}: {
  value: number;
  className?: string;
  color?: "cyan" | "violet" | "gold" | string;
  height?: number;
  label?: string;
  shimmer?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const bg =
    color === "cyan"
      ? "linear-gradient(90deg, #0891B2, #00E5FF)"
      : color === "violet"
        ? "linear-gradient(90deg, #6D28D9, #A78BFA)"
        : color === "gold"
          ? "linear-gradient(90deg, #9A8152, #E4CFA2)"
          : color;
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-full bg-white/[0.06]", className)}
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: bg }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {shimmer && pct > 0 && (
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </span>
        )}
      </motion.div>
    </div>
  );
}

export function Ring({
  value,
  size = 56,
  stroke = 4,
  color = "#00E5FF",
  track = "rgba(255,255,255,0.07)",
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function SelfReportedNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-faint", className)}>
      <span className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
      <span>
        <span className="font-medium text-ink-muted">Self-reported completion.</span> ML QUEST runs on the honor system —
        no automated grading yet. GitHub-linked verification is planned.
      </span>
    </p>
  );
}
