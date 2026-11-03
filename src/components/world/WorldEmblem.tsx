"use client";

import { useId } from "react";
import type { World } from "@/data/types";
import { cn } from "@/lib/cn";

/**
 * Each world has its own geometric visual identity, drawn as SVG.
 * `dim` renders the locked/silhouette state.
 */
export function WorldEmblem({ world, size = 120, dim, className }: { world: World; size?: number; dim?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const a = dim ? "#4B5566" : world.theme.accent;
  const b = dim ? "#323A48" : world.theme.accent2;
  const g = `g-${uid}`;
  const glow = `glow-${uid}`;
  const common = { a, b, g, glow, dim };

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={cn("overflow-visible", className)} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {world.theme.emblem === "neural" && <Neural {...common} />}
      {world.theme.emblem === "forest" && <Forest {...common} />}
      {world.theme.emblem === "arena" && <Arena {...common} />}
      {world.theme.emblem === "lab" && <Lab {...common} />}
      {world.theme.emblem === "frontier" && <Frontier {...common} />}
    </svg>
  );
}

type P = { a: string; b: string; g: string; glow: string; dim?: boolean };

function Neural({ a, b, g, glow, dim }: P) {
  const layers = [
    [30, 48, 72, 90].map((y) => [24, y]),
    [22, 42, 62, 82, 98].map((y) => [60, y]),
    [44, 76].map((y) => [96, y]),
  ];
  const edges: [number[], number[]][] = [];
  for (let l = 0; l < layers.length - 1; l++) for (const p of layers[l]) for (const q of layers[l + 1]) edges.push([p, q]);
  return (
    <g>
      <circle cx="60" cy="60" r="56" fill="none" stroke={a} strokeOpacity="0.12" />
      <circle cx="60" cy="60" r="48" fill="none" stroke={a} strokeOpacity="0.06" strokeDasharray="2 4" className={dim ? "" : "origin-center animate-spin-slow"} style={{ transformBox: "fill-box" }} />
      {edges.map(([p, q], i) => (
        <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={`url(#${g})`} strokeOpacity={0.22 + ((i * 7) % 5) * 0.06} strokeWidth="0.7" />
      ))}
      {layers.flat().map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 3.6 : 2.8} fill="#080A0F" stroke={i % 3 ? a : b} strokeWidth="1.4" filter={dim ? undefined : `url(#${glow})`} />
      ))}
    </g>
  );
}

function Forest({ a, b, g, glow, dim }: P) {
  // Stacked feature-map planes in perspective — a "canopy" of layers.
  const planes = [0, 1, 2, 3, 4];
  return (
    <g>
      <circle cx="60" cy="60" r="56" fill="none" stroke={a} strokeOpacity="0.12" />
      {planes.map((i) => {
        const y = 84 - i * 12;
        const w = 46 - i * 6;
        return (
          <g key={i} opacity={0.35 + i * 0.13}>
            <polygon
              points={`${60 - w},${y} ${60},${y - 10} ${60 + w},${y} ${60},${y + 10}`}
              fill={`url(#${g})`}
              fillOpacity={0.05 + i * 0.02}
              stroke={i % 2 ? b : a}
              strokeWidth="1"
              filter={i === 4 && !dim ? `url(#${glow})` : undefined}
            />
            <line x1={60 - w / 2} y1={y - 5} x2={60 + w / 2} y2={y + 5} stroke={a} strokeOpacity="0.35" strokeWidth="0.6" />
            <line x1={60 + w / 2} y1={y - 5} x2={60 - w / 2} y2={y + 5} stroke={a} strokeOpacity="0.35" strokeWidth="0.6" />
          </g>
        );
      })}
      <line x1="60" y1="94" x2="60" y2="22" stroke={`url(#${g})`} strokeOpacity="0.5" strokeDasharray="1 3" />
      <circle cx="60" cy="22" r="3" fill={a} filter={dim ? undefined : `url(#${glow})`} />
    </g>
  );
}

function Arena({ a, b, g, glow, dim }: P) {
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <g>
      <circle cx="60" cy="60" r="56" fill="none" stroke={a} strokeOpacity="0.12" />
      <g className={dim ? "" : "origin-center animate-spin-slow"} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {ticks.map((deg) => {
          const r1 = 46;
          const r2 = deg % 30 === 0 ? 40 : 43;
          const rad = (deg * Math.PI) / 180;
          return (
            <line key={deg} x1={60 + r1 * Math.cos(rad)} y1={60 + r1 * Math.sin(rad)} x2={60 + r2 * Math.cos(rad)} y2={60 + r2 * Math.sin(rad)} stroke={a} strokeOpacity={deg % 30 === 0 ? 0.7 : 0.25} strokeWidth="1" />
          );
        })}
      </g>
      <ellipse cx="60" cy="74" rx="34" ry="10" fill="none" stroke={`url(#${g})`} strokeOpacity="0.6" />
      <ellipse cx="60" cy="74" rx="22" ry="6" fill="none" stroke={b} strokeOpacity="0.35" />
      {/* cart + pole */}
      <rect x="50" y="68" width="20" height="7" rx="1.5" fill="#080A0F" stroke={a} strokeWidth="1.2" />
      <line x1="60" y1="68" x2="66" y2="36" stroke={b} strokeWidth="2" strokeLinecap="round" filter={dim ? undefined : `url(#${glow})`} />
      <circle cx="66" cy="36" r="3" fill={b} />
    </g>
  );
}

function Lab({ a, b, g, glow, dim }: P) {
  // Isometric simulation grid with an articulated arm — a digital twin.
  const iso = (x: number, y: number) => [60 + (x - y) * 9, 78 + (x + y) * 4.5];
  const grid: React.ReactNode[] = [];
  for (let i = -3; i <= 3; i++) {
    const [x1, y1] = iso(i, -3);
    const [x2, y2] = iso(i, 3);
    const [x3, y3] = iso(-3, i);
    const [x4, y4] = iso(3, i);
    grid.push(<line key={`a${i}`} x1={x1} y1={y1 - 27} x2={x2} y2={y2 - 27} stroke={a} strokeOpacity="0.18" strokeWidth="0.7" />);
    grid.push(<line key={`b${i}`} x1={x3} y1={y3 - 27} x2={x4} y2={y4 - 27} stroke={a} strokeOpacity="0.18" strokeWidth="0.7" />);
  }
  return (
    <g>
      <circle cx="60" cy="60" r="56" fill="none" stroke={a} strokeOpacity="0.12" />
      {grid}
      <polyline points="48,64 48,52 62,38 80,44" fill="none" stroke={`url(#${g})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter={dim ? undefined : `url(#${glow})`} />
      <rect x="42" y="62" width="12" height="5" rx="1" fill="#080A0F" stroke={a} />
      {[
        [48, 52],
        [62, 38],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#080A0F" stroke={b} strokeWidth="1.4" />
      ))}
      <path d="M80 44 l5 -3 M80 44 l5 3" stroke={b} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="86" cy="56" r="2.5" fill={b} fillOpacity="0.8" className={dim ? "" : "animate-pulse-soft"} />
    </g>
  );
}

function Frontier({ a, b, g, glow, dim }: P) {
  const hex = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const ang = (Math.PI / 3) * i - Math.PI / 2;
      return `${60 + r * Math.cos(ang)},${60 + r * Math.sin(ang)}`;
    }).join(" ");
  return (
    <g>
      <circle cx="60" cy="60" r="56" fill="none" stroke={a} strokeOpacity="0.12" />
      <polygon points={hex(44)} fill="none" stroke={a} strokeOpacity="0.25" />
      <polygon points={hex(32)} fill={`url(#${g})`} fillOpacity="0.06" stroke={`url(#${g})`} strokeWidth="1.2" />
      <g className={dim ? "" : "animate-spin-slow"} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <polygon points={hex(20)} fill="none" stroke={b} strokeOpacity="0.6" strokeDasharray="3 3" />
      </g>
      {/* portal */}
      <path d="M52 72 V54 a8 8 0 0 1 16 0 V72" fill="#080A0F" stroke={a} strokeWidth="1.4" filter={dim ? undefined : `url(#${glow})`} />
      <line x1="60" y1="50" x2="60" y2="70" stroke={a} strokeOpacity="0.5" strokeDasharray="1 2" />
      {[
        [20, 30],
        [98, 26],
        [102, 90],
        [16, 88],
        [60, 10],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 4 ? 1.8 : 1.2} fill={i % 2 ? b : a} className={dim ? "" : "animate-pulse-soft"} style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
    </g>
  );
}
